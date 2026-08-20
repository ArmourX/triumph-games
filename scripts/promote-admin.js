import { createClient } from "@libsql/client";

const username = (process.argv[2] || "Tester").trim();
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.");
  process.exit(1);
}

const db = createClient({ url, authToken: authToken || undefined });
const result = await db.execute({
  sql: "UPDATE users SET is_admin = 1 WHERE LOWER(username) = LOWER(?)",
  args: [username]
});

if (!result.rowsAffected) {
  console.error('No user found with username "' + username + '".');
  process.exit(1);
}

console.log('Promoted "' + username + '" to admin.');
