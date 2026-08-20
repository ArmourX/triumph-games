import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, "init-db.sql"), "utf8");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.");
  process.exit(1);
}

const db = createClient({ url, authToken: authToken || undefined });
const statements = schema.split(";").map((s) => s.trim()).filter(Boolean);

for (const stmt of statements) {
  await db.execute(stmt);
  console.log("OK:", stmt.split("\n")[0].slice(0, 60) + "...");
}

console.log("Database initialized.");
