import { sendJson, handleError } from "../http.js";
import { requireAdmin } from "../auth.js";
import { getDb, ensureSchema } from "../db.js";

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
    createdAt: row.created_at
  };
}

function rowToPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    game: row.game,
    type: row.type,
    title: row.title,
    description: row.description || "",
    authorUsername: row.author_username,
    status: row.status,
    sections: JSON.parse(row.sections || "[]"),
    updatedAt: row.updated_at
  };
}

export async function handle(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed." });
  try {
    await requireAdmin(req);
    await ensureSchema();
    const db = getDb();

    const edits = await db.execute({
      sql: "SELECT * FROM wiki_edits WHERE status = 'pending' ORDER BY created_at DESC",
      args: []
    });
    const posts = await db.execute({
      sql: "SELECT * FROM posts WHERE status = 'pending' ORDER BY updated_at DESC",
      args: []
    });
    const elumiaItems = await db.execute({
      sql: "SELECT * FROM elumia_item_entries WHERE status = 'pending' ORDER BY created_at DESC",
      args: []
    });

    sendJson(res, 200, {
      edits: edits.rows.map(rowToEdit),
      posts: posts.rows.map(rowToPost),
      elumiaItems: elumiaItems.rows.map(function (row) {
        return {
          id: row.id,
          category: row.category,
          name: row.name,
          rarity: row.rarity,
          phase: row.phase,
          ilvl: row.ilvl,
          req: row.req,
          slot: row.slot,
          source: row.source,
          sourceType: row.source_type,
          dps: row.dps,
          speed: row.speed,
          armor: row.armor,
          stat: row.stat,
          roll: row.roll_pct,
          iconId: row.icon_id || "",
          bonuses: (function () {
            if (!row.bonuses_json) return null;
            try { return JSON.parse(row.bonuses_json); } catch { return null; }
          })(),
          authorUsername: row.author_username,
          createdAt: row.created_at
        };
      })
    });
  } catch (err) {
    handleError(res, err);
  }
}
