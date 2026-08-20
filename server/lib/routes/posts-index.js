import { readJson, sendJson, handleError } from "../http.js";
import { requireSession, requireAdmin, getSession, sessionIsAdmin } from "../auth.js";
import { getDb, ensureSchema, uid, slugify } from "../db.js";

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

export async function handle(req, res) {
  try {
    await ensureSchema();
    const db = getDb();
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET") {
      const game = url.searchParams.get("game");
      const typeParam = url.searchParams.get("type");
      const status = url.searchParams.get("status") || "published";
      const authorId = url.searchParams.get("authorId");
      const session = await getSession(req);

      let sql = "SELECT * FROM posts WHERE 1=1";
      const args = [];

      if (typeParam) {
        sql += " AND type = ?";
        args.push(typeParam);
      } else if (status !== "all") {
        sql += " AND type = ?";
        args.push("guide");
      }

      if (game) { sql += " AND game = ?"; args.push(game); }
      if (status === "all" && sessionIsAdmin(session)) {
        /* admin: list every post regardless of status */
      } else if (status === "published") {
        sql += " AND status = 'published'";
      } else if (status === "mine" && session) {
        sql += " AND author_id = ?";
        args.push(session.userId);
      } else if (status === "pending" && sessionIsAdmin(session)) {
        sql += " AND status = 'pending'";
      } else if (authorId) {
        sql += " AND author_id = ?";
        args.push(authorId);
      } else {
        sql += " AND status = 'published'";
      }

      sql += " ORDER BY updated_at DESC";
      const result = await db.execute({ sql, args });
      return sendJson(res, 200, { posts: result.rows.map(rowToPost) });
    }

    if (req.method === "POST") {
      const session = await requireSession(req);
      const body = await readJson(req);
      const type = body.type === "article" ? "article" : "guide";
      const now = new Date().toISOString();
      const id = uid("post");
      const title = (body.title || "").trim() || "Untitled";
      const sections = JSON.stringify(body.sections || [{ id: uid("sec"), heading: "", body: "", images: [] }]);

      await db.execute({
        sql: `INSERT INTO posts
          (id, slug, game, type, title, description, author_id, author_username, status, sections, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
        args: [
          id, slugify(title), body.game || "battlerise", type, title,
          (body.description || "").trim(), session.userId, session.username,
          sections, now, now
        ]
      });
      return sendJson(res, 201, { post: rowToPost({
        id, slug: slugify(title), game: body.game || "battlerise", type, title,
        description: body.description || "", author_id: session.userId,
        author_username: session.username, status: "draft", sections,
        created_at: now, updated_at: now, published_at: null,
        reviewed_at: null, reviewed_by: null, reject_note: ""
      }) });
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    handleError(res, err);
  }
}
