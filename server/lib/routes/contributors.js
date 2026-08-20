import { sendJson, handleError } from "../http.js";
import { getDb, ensureSchema } from "../db.js";
import { isAdminUser } from "../auth.js";

const MAX_CONTRIBUTORS = 100;

export async function handle(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed." });
  try {
    await ensureSchema();
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT username FROM users ORDER BY username COLLATE NOCASE ASC LIMIT ?",
      args: [MAX_CONTRIBUTORS + 10]
    });
    const contributors = result.rows
      .map((row) => row.username)
      .filter((username) => !isAdminUser(username))
      .slice(0, MAX_CONTRIBUTORS);
    return sendJson(res, 200, { contributors });
  } catch (err) {
    handleError(res, err);
  }
}
