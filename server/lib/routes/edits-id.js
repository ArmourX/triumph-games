import { readJson, sendJson, handleError } from "../http.js";
import { requireAdmin } from "../auth.js";
import { getDb, ensureSchema } from "../db.js";

export async function handle(req, res, id) {
  try {
    await ensureSchema();
    const db = getDb();

    if (req.method === "PATCH") {
      const session = await requireAdmin(req);
      const body = await readJson(req);
      const action = body.action;

      const existing = await db.execute({ sql: "SELECT * FROM wiki_edits WHERE id = ?", args: [id] });
      if (!existing.rows.length) return sendJson(res, 404, { error: "Edit not found." });
      const edit = existing.rows[0];
      const now = new Date().toISOString();

      if (action === "approve") {
        await db.execute({
          sql: `INSERT INTO wiki_approved (game, page_id, field, content, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(game, page_id, field) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
          args: [edit.game, edit.page_id, edit.field, edit.proposed_text, now]
        });
        await db.execute({ sql: "DELETE FROM wiki_edits WHERE id = ?", args: [id] });
        return sendJson(res, 200, { ok: true, status: "approved" });
      }

      if (action === "reject") {
        await db.execute({ sql: "DELETE FROM wiki_edits WHERE id = ?", args: [id] });
        return sendJson(res, 200, { ok: true, status: "rejected" });
      }

      return sendJson(res, 400, { error: "Invalid action." });
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    handleError(res, err);
  }
}
