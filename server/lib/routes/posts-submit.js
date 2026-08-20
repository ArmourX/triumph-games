import { sendJson, handleError } from "../http.js";
import { requireSession } from "../auth.js";
import { getDb, ensureSchema } from "../db.js";

export async function handle(req, res, id) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed." });
  try {
    const session = await requireSession(req);
    await ensureSchema();
    const db = getDb();

    const result = await db.execute({ sql: "SELECT * FROM posts WHERE id = ?", args: [id] });
    if (!result.rows.length) return sendJson(res, 404, { error: "Post not found." });
    const post = result.rows[0];
    if (post.author_id !== session.userId) return sendJson(res, 403, { error: "Not your post." });

    const sections = JSON.parse(post.sections || "[]");
    if (!post.title.trim()) return sendJson(res, 400, { error: "Add a title before submitting." });
    if (!sections.some((s) => s.body?.trim() || (s.images && s.images.length))) {
      return sendJson(res, 400, { error: "Add at least one section with text or an image." });
    }

    const now = new Date().toISOString();
    await db.execute({
      sql: "UPDATE posts SET status = 'pending', updated_at = ? WHERE id = ?",
      args: [now, id]
    });
    sendJson(res, 200, { ok: true, status: "pending" });
  } catch (err) {
    handleError(res, err);
  }
}
