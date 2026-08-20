import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnvFile(name) {
  try {
    const text = readFileSync(join(ROOT, name), "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* optional */
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

function parseJsExport(path, exportName) {
  const text = readFileSync(join(ROOT, path), "utf8");
  const marker = exportName + " = ";
  const start = text.indexOf(marker);
  if (start === -1) throw new Error("Could not parse " + path);
  const jsonStart = text.indexOf("[", start);
  const jsonEnd = text.lastIndexOf("]");
  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}

const icons = parseJsExport("js/elumia-item-icons.js", "window.ElumiaItemIcons");
const generators = parseJsExport("js/elumia-rng-generators.js", "window.ElumiaRngGenerators");

const RARITY_FROM_PREFIX = [
  ["common", "common"],
  ["rare", "rare"],
  ["mystic", "uncommon"],
  ["mythic", "uncommon"],
  ["epic", "epic"],
  ["legendary", "legendary"],
  ["nightmare", "legendary"]
];

const ILVL_BY_RARITY = {
  common: 10,
  uncommon: 30,
  rare: 40,
  epic: 60,
  legendary: 80
};

function stripRarityPrefix(name) {
  const text = String(name || "").trim();
  const low = text.toLowerCase();
  for (const [prefix] of RARITY_FROM_PREFIX) {
    if (low.startsWith(prefix + " ")) {
      return text.slice(prefix.length + 1).trim();
    }
  }
  return text;
}

function rarityFromLabel(label) {
  const low = String(label || "").toLowerCase();
  for (const [prefix, rarity] of RARITY_FROM_PREFIX) {
    if (low.startsWith(prefix + " ")) return rarity;
  }
  return "common";
}

function categoryFromLabel(label) {
  const n = String(label || "").toLowerCase();
  if (n.includes("ring")) return "rings";
  if (n.includes("necklace") || n.includes("amulet")) return "amulet";
  if (n.includes("shield") || n.includes("offhand") || n.includes("quiver")) return "offhand";
  if (n.includes("helm") || n.includes("armor") || n.includes("armour")) return "armour";
  if (/(sword|spear|bow|staff|axe|mace|dagger|wand)/.test(n)) return "weapons";
  return null;
}

function slotFromLabel(label, category) {
  const n = String(label || "").toLowerCase();
  if (category === "weapons") {
    if (n.includes("spear")) return "Spear";
    if (n.includes("bow")) return "Bow";
    if (n.includes("staff")) return "Staff";
    return "Sword";
  }
  if (category === "offhand") {
    if (n.includes("quiver")) return "Quiver";
    if (n.includes("shield")) return "Shield";
    return "Offhand";
  }
  if (category === "armour") return n.includes("helm") ? "Helmet" : "Chest";
  if (category === "rings") return "Ring";
  if (category === "amulet") return "Necklace";
  return "";
}

function cemeteryLevelBand(ilvl) {
  const lvl = Math.max(1, Math.min(100, Number(ilvl) || 10));
  if (lvl <= 10) return "1-10";
  if (lvl >= 91) return "90-100";
  const low = Math.floor(lvl / 10) * 10;
  return low + "-" + (low + 10);
}

function generatorMatchesBand(type, band) {
  const normalized = String(type || "").replace(/\s+/g, "");
  const target = String(band || "").replace(/\s+/g, "");
  return normalized.includes(target);
}

function generatorPrefix(category, label) {
  const n = String(label || "").toLowerCase();
  if (category === "weapons") return "Cemetery Weapon";
  if (category === "armour") return n.includes("helm") ? "Cemetery Helmet" : "Cemetery Armor";
  if (category === "offhand") return n.includes("shield") ? "Cemetery Shield" : "Cemetery OffHand";
  if (category === "rings") return "Cemetery Ring";
  if (category === "amulet") return "Cemetery Necklace";
  return null;
}

function pickGenerator(category, label, ilvl) {
  const prefix = generatorPrefix(category, label);
  if (!prefix) return null;
  const band = cemeteryLevelBand(ilvl);
  return generators.find(function (g) {
    return g.type.includes(prefix) && generatorMatchesBand(g.type, band);
  }) || generators.find(function (g) {
    return g.type.includes(prefix);
  });
}

function buildBonuses(gen) {
  if (!gen || !gen.bonusRows || !gen.bonusRows.length) return null;
  const bonuses = [];
  gen.bonusRows.forEach(function (row) {
    row.forEach(function (slot) {
      if (!slot.stat || String(slot.stat).startsWith("Bonus")) return;
      bonuses.push({
        quality: slot.quality === "max" ? "legendary" : slot.quality,
        stat: slot.stat,
        group: slot.group,
        weight: slot.weight,
        min: slot.min,
        max: slot.max
      });
    });
  });
  if (!bonuses.length) return null;
  return {
    generatorId: gen.id,
    generatorType: gen.type,
    rollPcts: gen.rollPcts,
    bonuses
  };
}

function uid(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function isCemeteryItemName(name) {
  const n = String(name || "").toLowerCase();
  return n.includes("zarath") || n.includes("crypt");
}

function pickIconForName(iconsForKey) {
  if (!iconsForKey.length) return null;
  const order = ["legendary", "epic", "rare", "uncommon", "common"];
  for (const rarity of order) {
    const match = iconsForKey.find(function (entry) {
      return rarityFromLabel(entry.label) === rarity;
    });
    if (match) return match;
  }
  return iconsForKey[0];
}

function buildSeedItems() {
  const grouped = new Map();

  for (const icon of icons) {
    const category = categoryFromLabel(icon.label);
    if (!category) continue;
    const rawName = icon.label.trim();
    if (!isCemeteryItemName(rawName)) continue;
    const name = stripRarityPrefix(rawName);
    if (!name.toLowerCase().startsWith("zarath ")) continue;
    const key = category + "::" + name.toLowerCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(icon);
  }

  const items = [];
  grouped.forEach(function (iconsForKey, key) {
    const icon = pickIconForName(iconsForKey);
    if (!icon) return;
    const category = key.split("::")[0];
    const name = stripRarityPrefix(icon.label);
    const ilvl = 10;
    const gen = pickGenerator(category, name, ilvl);
    const bonuses = buildBonuses(gen);

    items.push({
      category,
      name,
      rarity: "common",
      phase: "Early Access",
      ilvl,
      req: Math.max(1, ilvl - 5),
      slot: slotFromLabel(name, category),
      source: "The Silent City Hard Mode",
      sourceType: "Cemetery drop",
      iconId: icon.id,
      bonuses
    });
  });

  return items.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN (e.g. in .env.local).");
    process.exit(1);
  }

  const items = buildSeedItems();
  console.log("Prepared", items.length, "items with icons and RNG tiers.");

  const db = createClient({ url, authToken: authToken || undefined });
  const now = new Date().toISOString();

  await db.execute("DELETE FROM elumia_item_entries");
  console.log("Cleared existing Elumia item entries.");

  const batchSize = 40;
  let inserted = 0;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const statements = batch.map(function (item) {
      return {
        sql: `INSERT INTO elumia_item_entries
          (id, category, name, rarity, phase, ilvl, req, slot, source, source_type,
           dps, speed, armor, stat, roll_pct, bonuses_json, icon_id, status, author_id, author_username, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, ?, ?, 'published', NULL, 'seed', ?)`,
        args: [
          uid("elumia_item"),
          item.category,
          item.name,
          item.rarity,
          item.phase,
          item.ilvl,
          item.req,
          item.slot,
          item.source,
          item.sourceType,
          item.bonuses ? JSON.stringify(item.bonuses) : null,
          item.iconId,
          now
        ]
      };
    });
    await db.batch(statements);
    inserted += batch.length;
    console.log("Inserted", inserted, "/", items.length);
  }

  console.log("Done. Seeded", inserted, "published items.");
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
