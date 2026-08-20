import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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

export function isCemeteryItemName(name) {
  const n = String(name || "").toLowerCase();
  return n.includes("zarath") || n.includes("crypt");
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN (e.g. in .env.local).");
    process.exit(1);
  }

  const db = createClient({ url, authToken: authToken || undefined });
  const before = await db.execute("SELECT COUNT(*) AS c FROM elumia_item_entries");
  const countBefore = before.rows[0].c;

  const result = await db.execute(`
    DELETE FROM elumia_item_entries
    WHERE LOWER(name) NOT LIKE '%zarath%'
      AND LOWER(name) NOT LIKE '%crypt%'
  `);

  const after = await db.execute("SELECT COUNT(*) AS c FROM elumia_item_entries");
  const countAfter = after.rows[0].c;

  console.log("Removed", result.rowsAffected, "non-cemetery items.");
  console.log("Before:", countBefore, "→ After:", countAfter, "cemetery items kept.");
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
