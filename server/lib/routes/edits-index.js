import { readJson, sendJson, handleError } from "../http.js";
import { requireSession, requireAdmin, getSession, sessionIsAdmin } from "../auth.js";
import { getDb, ensureSchema, uid } from "../db.js";
import { assertEditable } from "../editable.js";

function rowToEdit(row) {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    game: row.game,
    pageId: row.page_id,
    pageTitle: row.page_title,
    field: row.field,
    fieldLabel: row.field_label,
    originalText: row.original_text || "",
    proposedText: row.proposed_text,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    rejectNote: row.reject_note || ""
  };
}

export async function handle(req, res) {
  try {
    await ensureSchema();
    const db = getDb();

    if (req.method === "GET") {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const mine = url.searchParams.get("mine");
      const session = await getSession(req);

      if (mine === "1") {
        if (!session) return sendJson(res, 401, { error: "Authentication required." });
        const result = await db.execute({
          sql: "SELECT * FROM wiki_edits WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC",
          args: [session.userId]
        });
        return sendJson(res, 200, { edits: result.rows.map(rowToEdit) });
      }

      if (!sessionIsAdmin(session)) return sendJson(res, 403, { error: "Admin access required." });
      const result = await db.execute({
        sql: "SELECT * FROM wiki_edits WHERE status = 'pending' ORDER BY created_at DESC",
        args: []
      });
      return sendJson(res, 200, { edits: result.rows.map(rowToEdit) });
    }

    if (req.method === "POST") {
      const session = await requireSession(req);
      const body = await readJson(req);
      assertEditable(body.game, body.pageId, body.field);

      const id = uid("edit");
      const createdAt = new Date().toISOString();
      await db.execute({
        sql: `INSERT INTO wiki_edits
          (id, user_id, username, game, page_id, page_title, field, field_label, original_text, proposed_text, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        args: [
          id, session.userId, session.username,
          body.game, body.pageId, body.pageTitle || body.pageId,
          body.field, body.fieldLabel || body.field,
          body.originalText || "", body.proposedText || "", createdAt
        ]
      });
      return sendJson(res, 201, { edit: { id, status: "pending", createdAt } });
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    handleError(res, err);
  }
}
