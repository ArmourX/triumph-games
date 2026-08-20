import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

let client = null;
let initialized = false;

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not configured.");
  }
  if (!client) {
    client = createClient({ url, authToken: authToken || undefined });
  }
  return client;
}

export async function ensureSchema() {
  if (initialized) return;
  const db = getDb();
  const schemaPath = join(__dirname, "../../scripts/init-db.sql");
  const schema = readFileSync(schemaPath, "utf8");
  const statements = schema.split(";").map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await db.execute(stmt);
  }
  try {
    await db.execute("ALTER TABLE users ADD COLUMN avatar_slug TEXT NOT NULL DEFAULT 'invictus'");
  } catch {
    /* column already exists */
  }
  try {
    await db.execute("ALTER TABLE users ADD COLUMN is_mod INTEGER DEFAULT 0");
  } catch {
    /* column already exists */
  }
  await ensureElumiaItemsSchema(db);
  initialized = true;
}

async function ensureElumiaItemsSchema(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS _schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);
  const ver = await db.execute({
    sql: "SELECT value FROM _schema_meta WHERE key = ?",
    args: ["elumia_items_schema"]
  });
  const current = ver.rows.length ? ver.rows[0].value : null;
  if (current === "4") return;

  if (!current) {
    await db.execute("DROP TABLE IF EXISTS elumia_item_entries");
    await db.execute(`CREATE TABLE elumia_item_entries (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL CHECK(category IN ('weapons', 'armour', 'rings', 'offhand', 'amulet', 'pets', 'goods')),
      name TEXT NOT NULL,
      rarity TEXT NOT NULL DEFAULT 'common',
      phase TEXT,
      ilvl INTEGER,
      req INTEGER,
      slot TEXT,
      source TEXT,
      source_type TEXT,
      dps REAL,
      speed REAL,
      armor INTEGER,
      stat TEXT,
      roll_pct TEXT,
      bonuses_json TEXT,
      icon_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      author_id TEXT,
      author_username TEXT,
      created_at TEXT NOT NULL,
      reviewed_at TEXT,
      reviewed_by TEXT,
      reject_note TEXT
    )`);
    await db.execute("CREATE INDEX IF NOT EXISTS idx_elumia_items_cat ON elumia_item_entries(category, status)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_elumia_items_name ON elumia_item_entries(category, name)");
  } else if (current === "2") {
    try {
      await db.execute("ALTER TABLE elumia_item_entries ADD COLUMN bonuses_json TEXT");
    } catch { /* exists */ }
    try {
      await db.execute("ALTER TABLE elumia_item_entries ADD COLUMN icon_id TEXT");
    } catch { /* exists */ }
  } else if (current === "3") {
    try {
      await db.execute("ALTER TABLE elumia_item_entries ADD COLUMN icon_id TEXT");
    } catch { /* exists */ }
  }

  await db.execute({
    sql: `INSERT INTO _schema_meta (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: ["elumia_items_schema", "4"]
  });
}

export function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "post";
}
