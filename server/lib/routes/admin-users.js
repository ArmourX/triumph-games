import { readJson, sendJson, handleError } from "../http.js";
import { requireAdmin, isAdminUser, isModUser } from "../auth.js";
import { getDb, ensureSchema } from "../db.js";

function rowToUser(row) {
  return {
    id: row.id,
    username: row.username,
    isAdmin: !!(isAdminUser(row.username) || row.is_admin),
    isMod: !!(isModUser(row.username) || row.is_mod),
    isBuiltInAdmin: isAdminUser(row.username),
    isBuiltInMod: isModUser(row.username),
    avatarSlug: row.avatar_slug || "invictus",
    createdAt: row.created_at
  };
}

export async function handle(req, res, userId) {
  try {
    await ensureSchema();
    const db = getDb();

    if (!userId && req.method === "GET") {
      await requireAdmin(req);
      const result = await db.execute({
        sql: "SELECT id, username, is_admin, is_mod, avatar_slug, created_at FROM users ORDER BY created_at DESC",
        args: []
      });
      return sendJson(res, 200, { users: result.rows.map(rowToUser) });
    }

    if (userId && req.method === "PATCH") {
      const session = await requireAdmin(req);
      const body = await readJson(req);
      const target = await db.execute({
        sql: "SELECT id, username, is_admin, is_mod FROM users WHERE id = ?",
        args: [userId]
      });
      if (!target.rows.length) return sendJson(res, 404, { error: "User not found." });

      const username = target.rows[0].username;
      if (body.action === "promote") {
        await db.execute({ sql: "UPDATE users SET is_admin = 1 WHERE id = ?", args: [userId] });
        return sendJson(res, 200, { ok: true, isAdmin: true });
      }
      if (body.action === "demote") {
        if (isAdminUser(username)) {
          return sendJson(res, 400, { error: username + " is a built-in admin account and cannot be demoted." });
        }
        if (userId === session.userId) {
          return sendJson(res, 400, { error: "You cannot demote your own account." });
        }
        await db.execute({ sql: "UPDATE users SET is_admin = 0 WHERE id = ?", args: [userId] });
        return sendJson(res, 200, { ok: true, isAdmin: false });
      }
      if (body.action === "promoteMod") {
        await db.execute({ sql: "UPDATE users SET is_mod = 1 WHERE id = ?", args: [userId] });
        return sendJson(res, 200, { ok: true, isMod: true });
      }
      if (body.action === "demoteMod") {
        if (isModUser(username)) {
          return sendJson(res, 400, { error: username + " is a built-in mod account and cannot be demoted." });
        }
        if (userId === session.userId) {
          return sendJson(res, 400, { error: "You cannot remove your own mod role." });
        }
        await db.execute({ sql: "UPDATE users SET is_mod = 0 WHERE id = ?", args: [userId] });
        return sendJson(res, 200, { ok: true, isMod: false });
      }
      return sendJson(res, 400, { error: "Invalid action." });
    }

    if (userId && req.method === "DELETE") {
      const session = await requireAdmin(req);
      if (userId === session.userId) {
        return sendJson(res, 400, { error: "You cannot remove your own account while signed in." });
      }
      const target = await db.execute({
        sql: "SELECT id, username FROM users WHERE id = ?",
        args: [userId]
      });
      if (!target.rows.length) return sendJson(res, 404, { error: "User not found." });

      await db.execute({ sql: "DELETE FROM votes WHERE user_id = ?", args: [userId] });
      await db.execute({ sql: "DELETE FROM wiki_edits WHERE user_id = ?", args: [userId] });
      await db.execute({ sql: "DELETE FROM posts WHERE author_id = ?", args: [userId] });
      await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [userId] });
      return sendJson(res, 200, { ok: true });
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    handleError(res, err);
  }
}
