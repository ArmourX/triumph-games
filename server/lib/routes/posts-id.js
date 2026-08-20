import { readJson, sendJson, handleError } from "../http.js";
import { requireSession, requireAdmin, getSession, sessionIsAdmin } from "../auth.js";
import { getDb, ensureSchema, slugify } from "../db.js";

function rowToPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    game: row.game,
    type: row.type,
    title: row.title,
    description: row.description || "",
    authorId: row.author_id,
    authorUsername: row.author_username,
    status: row.status,
    sections: JSON.parse(row.sections || "[]"),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    rejectNote: row.reject_note || ""
  };
}

export async function handle(req, res, id) {
  try {
    await ensureSchema();
    const db = getDb();

    if (req.method === "GET") {
      const result = await db.execute({ sql: "SELECT * FROM posts WHERE id = ?", args: [id] });
      if (!result.rows.length) return sendJson(res, 404, { error: "Post not found." });
      const post = rowToPost(result.rows[0]);
      const session = await getSession(req);
      if (post.status !== "published" && post.authorId !== session?.userId && !sessionIsAdmin(session)) {
        return sendJson(res, 403, { error: "Not available." });
      }
      return sendJson(res, 200, { post });
    }

    if (req.method === "PUT") {
      const session = await requireSession(req);
      const body = await readJson(req);
      const result = await db.execute({ sql: "SELECT * FROM posts WHERE id = ?", args: [id] });
      if (!result.rows.length) return sendJson(res, 404, { error: "Post not found." });
      const post = result.rows[0];
      if (post.author_id !== session.userId && !sessionIsAdmin(session)) {
        return sendJson(res, 403, { error: "Not your post." });
      }
      if (post.status === "published" && !sessionIsAdmin(session)) {
        return sendJson(res, 403, { error: "Published posts cannot be edited." });
      }
      const now = new Date().toISOString();
      const title = (body.title ?? post.title).trim();
      await db.execute({
        sql: `UPDATE posts SET title = ?, slug = ?, description = ?, game = ?, type = ?, sections = ?, updated_at = ? WHERE id = ?`,
        args: [
          title, slugify(title), body.description ?? post.description,
          body.game ?? post.game, body.type ?? post.type,
          JSON.stringify(body.sections ?? JSON.parse(post.sections)),
          now, id
        ]
      });
      const updated = await db.execute({ sql: "SELECT * FROM posts WHERE id = ?", args: [id] });
      return sendJson(res, 200, { post: rowToPost(updated.rows[0]) });
    }

    if (req.method === "PATCH") {
      const session = await requireAdmin(req);
      const body = await readJson(req);
      const now = new Date().toISOString();
      if (body.action === "approve") {
        await db.execute({
          sql: "UPDATE posts SET status = 'published', published_at = ?, reviewed_at = ?, reviewed_by = ?, reject_note = '' WHERE id = ?",
          args: [now, now, session.username, id]
        });
        return sendJson(res, 200, { ok: true, status: "published" });
      }
      if (body.action === "reject") {
        await db.execute({
          sql: "UPDATE posts SET status = 'rejected', reviewed_at = ?, reviewed_by = ?, reject_note = ? WHERE id = ?",
          args: [now, session.username, body.rejectNote || "", id]
        });
        return sendJson(res, 200, { ok: true, status: "rejected" });
      }
      return sendJson(res, 400, { error: "Invalid action." });
    }

    if (req.method === "DELETE") {
      const session = await requireSession(req);
      const result = await db.execute({ sql: "SELECT author_id FROM posts WHERE id = ?", args: [id] });
      if (!result.rows.length) return sendJson(res, 404, { error: "Post not found." });
      if (result.rows[0].author_id !== session.userId && !sessionIsAdmin(session)) {
        return sendJson(res, 403, { error: "Not your post." });
      }
      await db.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [id] });
      return sendJson(res, 200, { ok: true });
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    handleError(res, err);
  }
}
