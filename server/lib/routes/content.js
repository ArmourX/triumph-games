import { sendJson, handleError } from "../http.js";
import { getDb, ensureSchema } from "../db.js";

export async function handle(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed." });
  try {
    await ensureSchema();
    const db = getDb();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const game = url.searchParams.get("game");
    const pageId = url.searchParams.get("page");
    const field = url.searchParams.get("field");
    const bulk = url.searchParams.get("bulk");

    if (bulk === "1" && game) {
      const result = await db.execute({
        sql: "SELECT page_id, field, content FROM wiki_approved WHERE game = ?",
        args: [game]
      });
      const map = {};
      result.rows.forEach((row) => {
        map[`${row.page_id}|${row.field}`] = row.content;
      });
      return sendJson(res, 200, { content: map });
    }

    if (!game || !pageId || !field) {
      return sendJson(res, 400, { error: "game, page, and field query params required." });
    }

    const result = await db.execute({
      sql: "SELECT content FROM wiki_approved WHERE game = ? AND page_id = ? AND field = ?",
      args: [game, pageId, field]
    });
    sendJson(res, 200, { content: result.rows[0]?.content || null });
  } catch (err) {
    handleError(res, err);
  }
}
