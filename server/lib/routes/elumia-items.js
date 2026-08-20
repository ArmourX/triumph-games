import { readJson, sendJson, handleError } from "../http.js";
import { requireSession, requireAdmin, getSession, sessionIsAdmin, sessionIsMod } from "../auth.js";
import { getDb, ensureSchema, uid } from "../db.js";

const CATEGORIES = new Set(["weapons", "armour", "rings", "offhand", "amulet", "pets", "goods"]);
const RARITIES = new Set(["common", "uncommon", "rare", "epic", "legendary"]);
const RNG_CATEGORIES = new Set(["weapons", "armour", "rings", "offhand", "amulet"]);

function parseBonusesJson(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function rowToItem(row) {
  const bonuses = parseBonusesJson(row.bonuses_json);
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    rarity: row.rarity,
    phase: row.phase || "",
    ilvl: row.ilvl,
    req: row.req,
    slot: row.slot || "",
    source: row.source || "",
    sourceType: row.source_type || "",
    dps: row.dps,
    speed: row.speed,
    armor: row.armor,
    stat: row.stat || "",
    roll: row.roll_pct || "",
    bonuses: bonuses,
    iconId: row.icon_id || "",
    iconUrl: row.icon_id ? "/assets/elumia/item-icons/" + row.icon_id + ".png" : "",
    status: row.status,
    authorUsername: row.author_username || "",
    createdAt: row.created_at
  };
}

function normalizeCategory(value) {
  const cat = String(value || "").trim().toLowerCase();
  return CATEGORIES.has(cat) ? cat : null;
}

function normalizeRarity(value) {
  const rarity = String(value || "common").trim().toLowerCase();
  return RARITIES.has(rarity) ? rarity : "common";
}

function numOrNull(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function strOrNull(value) {
  const s = String(value || "").trim();
  return s || null;
}

function normalizeBonuses(body, category, rarity) {
  const raw = body.bonuses;
  if (!raw) return null;

  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw Object.assign(new Error("Invalid bonus data."), { status: 400 });
    }
  }

  if (!parsed || typeof parsed !== "object") return null;

  const bonusList = Array.isArray(parsed.bonuses) ? parsed.bonuses : Array.isArray(parsed) ? parsed : null;
  if (!bonusList) return null;

  const bonuses = bonusList.map(function (entry, index) {
    const stat = String(entry.stat || "").trim();
    if (!stat) {
      throw Object.assign(new Error("Each bonus needs a stat name (row " + (index + 1) + ")."), { status: 400 });
    }
    const min = numOrNull(entry.min);
    const max = numOrNull(entry.max);
    if (min == null && max == null) {
      throw Object.assign(new Error("Each bonus needs a min or max value (row " + (index + 1) + ")."), { status: 400 });
    }
    const quality = normalizeRarity(entry.quality || entry.rarity || rarity);
    return {
      quality,
      stat,
      group: numOrNull(entry.group),
      weight: numOrNull(entry.weight),
      min,
      max: max != null ? max : min
    };
  });

  const rollPcts = Array.isArray(parsed.rollPcts)
    ? parsed.rollPcts.map(function (v) { return numOrNull(v); })
    : null;

  return {
    generatorId: numOrNull(parsed.generatorId),
    generatorType: strOrNull(parsed.generatorType),
    rollPcts,
    bonuses
  };
}

export function bonusesToJson(bonuses) {
  if (!bonuses) return null;
  return JSON.stringify(bonuses);
}

function formatRollRange(min, max) {
  if (min == null && max == null) return null;
  if (min == null) return String(max);
  if (max == null || min === max) return String(min);
  return min + "–" + max;
}

export function computeOverallFromBonuses(bonusData) {
  if (!bonusData || !Array.isArray(bonusData.bonuses) || !bonusData.bonuses.length) return null;

  const byStat = {};
  let globalMin = null;
  let globalMax = null;

  bonusData.bonuses.forEach(function (entry) {
    const stat = String(entry.stat || "").trim();
    if (!stat) return;
    const min = numOrNull(entry.min);
    const max = numOrNull(entry.max);
    if (!byStat[stat]) byStat[stat] = { min: null, max: null };
    if (min != null) {
      byStat[stat].min = byStat[stat].min == null ? min : Math.min(byStat[stat].min, min);
      globalMin = globalMin == null ? min : Math.min(globalMin, min);
    }
    if (max != null) {
      byStat[stat].max = byStat[stat].max == null ? max : Math.max(byStat[stat].max, max);
      globalMax = globalMax == null ? max : Math.max(globalMax, max);
    }
  });

  const statNames = Object.keys(byStat).sort();
  if (!statNames.length) return null;

  return {
    statSummary: statNames.map(function (stat) {
      return stat + " " + formatRollRange(byStat[stat].min, byStat[stat].max);
    }).join(" · "),
    globalRange: formatRollRange(globalMin, globalMax)
  };
}

export function mergeBonusEntries(entries) {
  const byKey = {};
  (entries || []).forEach(function (entry) {
    const stat = String(entry.stat || "").trim();
    if (!stat) return;
    const quality = normalizeRarity(entry.quality || entry.rarity || "common");
    const key = quality + "::" + stat;
    const min = numOrNull(entry.min);
    const max = numOrNull(entry.max);
    if (!byKey[key]) {
      byKey[key] = {
        quality,
        stat,
        group: numOrNull(entry.group),
        weight: numOrNull(entry.weight),
        min: null,
        max: null
      };
    }
    if (min != null) {
      byKey[key].min = byKey[key].min == null ? min : Math.min(byKey[key].min, min);
    }
    if (max != null) {
      byKey[key].max = byKey[key].max == null ? max : Math.max(byKey[key].max, max);
    }
  });

  return Object.keys(byKey).map(function (key) {
    const row = byKey[key];
    if (row.max == null && row.min != null) row.max = row.min;
    if (row.min == null && row.max != null) row.min = row.max;
    return row;
  });
}

function applyOverallStats(data) {
  if (data.bonuses && Array.isArray(data.bonuses.bonuses)) {
    data.bonuses.bonuses = mergeBonusEntries(data.bonuses.bonuses);
  }
  return data;
}

function hasLegacyStats(data) {
  return !!(data.dps || data.speed || data.armor || data.stat || data.roll);
}

export function validatePayload(body) {
  const category = normalizeCategory(body.category);
  if (!category) throw Object.assign(new Error("Valid category is required."), { status: 400 });

  const name = String(body.name || "").trim();
  if (name.length < 2) throw Object.assign(new Error("Item name is required."), { status: 400 });

  const rarity = normalizeRarity(body.rarity);
  const bonuses = normalizeBonuses(body, category, rarity);

  if (RNG_CATEGORIES.has(category)) {
    if (!bonuses || !bonuses.bonuses.length) {
      if (!hasLegacyStats(body)) {
        throw Object.assign(new Error("Add at least one RNG bonus with min/max rolls."), { status: 400 });
      }
    }
  }

  return applyOverallStats({
    category,
    name,
    rarity,
    phase: strOrNull(body.phase) || "Early Access",
    ilvl: numOrNull(body.ilvl),
    req: numOrNull(body.req),
    slot: strOrNull(body.slot),
    source: strOrNull(body.source),
    sourceType: strOrNull(body.sourceType || body.source_type),
    dps: numOrNull(body.dps),
    speed: numOrNull(body.speed),
    armor: numOrNull(body.armor),
    stat: strOrNull(body.stat),
    roll: strOrNull(body.roll || body.rollPct || body.roll_pct),
    iconId: strOrNull(body.iconId || body.icon_id),
    bonuses
  });
}

async function findPublishedByName(db, category, name) {
  const result = await db.execute({
    sql: `SELECT * FROM elumia_item_entries
          WHERE category = ? AND LOWER(name) = LOWER(?) AND status = 'published'
          ORDER BY created_at ASC LIMIT 1`,
    args: [category, name]
  });
  return result.rows[0] || null;
}

export async function handle(req, res) {
  try {
    await ensureSchema();
    const db = getDb();
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET") {
      const category = normalizeCategory(url.searchParams.get("category"));
      const lookupName = url.searchParams.get("lookup");

      if (lookupName && category) {
        const row = await findPublishedByName(db, category, lookupName.trim());
        if (!row) return sendJson(res, 200, { exists: false });
        return sendJson(res, 200, { exists: true, item: rowToItem(row) });
      }

      let sql = "SELECT * FROM elumia_item_entries WHERE status = 'published'";
      const args = [];
      if (category) {
        sql += " AND category = ?";
        args.push(category);
      }
      sql += " ORDER BY category ASC, name COLLATE NOCASE ASC, created_at ASC";
      const result = await db.execute({ sql, args });
      return sendJson(res, 200, { items: result.rows.map(rowToItem) });
    }

    if (req.method === "POST") {
      const session = await requireSession(req);
      const body = await readJson(req);
      const data = validatePayload(body);
      const now = new Date().toISOString();
      const id = uid("elumia_item");
      const autoPublish = sessionIsAdmin(session) || sessionIsMod(session);
      const status = autoPublish ? "published" : "pending";

      const existing = await findPublishedByName(db, data.category, data.name);
      if (existing) {
        const hasNewData = (data.bonuses && data.bonuses.bonuses.length) || hasLegacyStats(data);
        if (!hasNewData) {
          throw Object.assign(new Error("Add RNG bonus rolls or stats for this item variant."), { status: 400 });
        }
        data.phase = data.phase || existing.phase;
        data.ilvl = data.ilvl ?? existing.ilvl;
        data.req = data.req ?? existing.req;
        data.slot = data.slot || existing.slot;
        data.source = data.source || existing.source;
        data.sourceType = data.sourceType || existing.source_type;
      }

      await db.execute({
        sql: `INSERT INTO elumia_item_entries
          (id, category, name, rarity, phase, ilvl, req, slot, source, source_type,
           dps, speed, armor, stat, roll_pct, bonuses_json, icon_id, status, author_id, author_username, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, data.category, data.name, data.rarity, data.phase, data.ilvl, data.req,
          data.slot, data.source, data.sourceType, data.dps, data.speed, data.armor,
          data.stat, data.roll, bonusesToJson(data.bonuses), data.iconId, status, session.userId, session.username, now
        ]
      });

      return sendJson(res, 201, {
        ok: true,
        status,
        item: rowToItem({
          id,
          category: data.category,
          name: data.name,
          rarity: data.rarity,
          phase: data.phase,
          ilvl: data.ilvl,
          req: data.req,
          slot: data.slot,
          source: data.source,
          source_type: data.sourceType,
          dps: data.dps,
          speed: data.speed,
          armor: data.armor,
          stat: data.stat,
          roll_pct: data.roll,
          bonuses_json: bonusesToJson(data.bonuses),
          icon_id: data.iconId,
          status,
          author_username: session.username,
          created_at: now
        }),
        isVariant: !!existing
      });
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    handleError(res, err);
  }
}
