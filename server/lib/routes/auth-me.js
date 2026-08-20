import { sendJson, handleError } from "../http.js";
import { getSession, isAdminUser, isModUser, sessionIsAdmin, sessionIsMod } from "../auth.js";
import { getDb, ensureSchema } from "../db.js";

export async function handle(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed." });
  try {
    const session = await getSession(req);
    if (!session) return sendJson(res, 200, { user: null });

    let isAdmin = sessionIsAdmin(session);
    let isMod = sessionIsMod(session);

    if (!isAdmin || !isMod) {
      await ensureSchema();
      const db = getDb();
      const result = await db.execute({
        sql: "SELECT is_admin, is_mod FROM users WHERE id = ?",
        args: [session.userId]
      });
      if (result.rows[0]) {
        if (!isAdmin) {
          isAdmin = !!(result.rows[0].is_admin || isAdminUser(session.username));
        }
        if (!isMod) {
          isMod = !!(result.rows[0].is_mod || isModUser(session.username));
        }
      }
    }

    sendJson(res, 200, {
      user: {
        id: session.userId,
        username: session.username,
        isAdmin: isAdmin,
        isMod: isMod,
        avatarSlug: session.avatarSlug
      }
    });
  } catch (err) {
    handleError(res, err);
  }
}
