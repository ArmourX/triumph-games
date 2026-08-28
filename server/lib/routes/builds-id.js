import { readJson, sendJson, handleError } from "../http.js";
import { requireSession, getSession, sessionIsAdmin } from "../auth.js";
import { getDb, ensureSchema } from "../db.js";

function rowToBuild(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    tags: JSON.parse(row.tags_json || "[]"),
    slots: JSON.parse(row.slots_json || "[]"),
    authorId: row.author_id,
    authorUsername: row.author_username,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function validateBuildBody(body) {
  const name = String(body.name || "").trim();
  if (!name) throw Object.assign(new Error("Build name is required."), { status: 400 });
  if (name.length > 80) throw Object.assign(new Error("Build name is too long."), { status: 400 });

  const tags = Array.isArray(body.tags) ? body.tags.filter(Boolean) : [];
  if (!tags.length) throw Object.assign(new Error("Pick at least one build type."), { status: 400 });

  const slots = Array.isArray(body.slots) ? body.slots : [];
  if (!slots.some((s) => s && s.champion)) {
    throw Object.assign(new Error("Select at least one champion before saving."), { status: 400 });
  }

  const description = String(body.description || "").trim().slice(0, 500);
  return { name, tags, slots, description };
}

export async function handle(req, res, id) {
  try {
    await ensureSchema();
    const db = getDb();

    if (req.method === "GET") {
      const result = await db.execute({ sql: "SELECT * FROM battlerise_builds WHERE id = ?", args: [id] });
      if (!result.rows.length) return sendJson(res, 404, { error: "Build not found." });
      const build = rowToBuild(result.rows[0]);
      const session = await getSession(req);
      if (build.status !== "published" && build.authorId !== session?.userId && !sessionIsAdmin(session)) {
        return sendJson(res, 403, { error: "Not available." });
      }
      return sendJson(res, 200, { build });
    }

    if (req.method === "PUT") {
      const session = await requireSession(req);
      const body = await readJson(req);
      const result = await db.execute({ sql: "SELECT * FROM battlerise_builds WHERE id = ?", args: [id] });
      if (!result.rows.length) return sendJson(res, 404, { error: "Build not found." });
      const row = result.rows[0];
      if (row.author_id !== session.userId && !sessionIsAdmin(session)) {
        return sendJson(res, 403, { error: "Not your build." });
      }

      const { name, tags, slots, description } = validateBuildBody(body);
      const now = new Date().toISOString();

      await db.execute({
        sql: `UPDATE battlerise_builds SET name = ?, description = ?, tags_json = ?, slots_json = ?, updated_at = ?
          WHERE id = ?`,
        args: [name, description, JSON.stringify(tags), JSON.stringify(slots), now, id]
      });

      return sendJson(res, 200, {
        build: rowToBuild(Object.assign({}, row, {
          name, description, tags_json: JSON.stringify(tags), slots_json: JSON.stringify(slots), updated_at: now
        }))
      });
    }

    if (req.method === "DELETE") {
      const session = await requireSession(req);
      const result = await db.execute({ sql: "SELECT author_id FROM battlerise_builds WHERE id = ?", args: [id] });
      if (!result.rows.length) return sendJson(res, 404, { error: "Build not found." });
      if (result.rows[0].author_id !== session.userId && !sessionIsAdmin(session)) {
        return sendJson(res, 403, { error: "Not your build." });
      }
      await db.execute({ sql: "DELETE FROM battlerise_builds WHERE id = ?", args: [id] });
      return sendJson(res, 200, { ok: true });
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    handleError(res, err);
  }
}
