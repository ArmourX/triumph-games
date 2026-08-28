import { readJson, sendJson, handleError } from "../http.js";
import { requireSession, getSession } from "../auth.js";
import { getDb, ensureSchema, uid } from "../db.js";

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

export async function handle(req, res) {
  try {
    await ensureSchema();
    const db = getDb();
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET") {
      const status = url.searchParams.get("status") || "published";
      const session = await getSession(req);

      let sql = "SELECT * FROM battlerise_builds WHERE 1=1";
      const args = [];

      if (status === "mine") {
        if (!session) return sendJson(res, 401, { error: "Authentication required." });
        sql += " AND author_id = ?";
        args.push(session.userId);
      } else {
        sql += " AND status = 'published'";
      }

      sql += " ORDER BY updated_at DESC";
      const result = await db.execute({ sql, args });
      return sendJson(res, 200, { builds: result.rows.map(rowToBuild) });
    }

    if (req.method === "POST") {
      const session = await requireSession(req);
      const body = await readJson(req);
      const { name, tags, slots, description } = validateBuildBody(body);
      const now = new Date().toISOString();
      const id = uid("brbuild");

      await db.execute({
        sql: `INSERT INTO battlerise_builds
          (id, name, description, tags_json, slots_json, author_id, author_username, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
        args: [
          id, name, description, JSON.stringify(tags), JSON.stringify(slots),
          session.userId, session.username, now, now
        ]
      });

      return sendJson(res, 201, {
        build: rowToBuild({
          id, name, description, tags_json: JSON.stringify(tags), slots_json: JSON.stringify(slots),
          author_id: session.userId, author_username: session.username, status: "published",
          created_at: now, updated_at: now
        })
      });
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    handleError(res, err);
  }
}
