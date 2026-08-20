import { readJson, sendJson, handleError } from "../http.js";
import { requireModOrAdmin, requireAdmin } from "../auth.js";
import { getDb, ensureSchema } from "../db.js";
import { validatePayload, rowToItem, bonusesToJson } from "./elumia-items.js";

export async function handle(req, res, id) {
  try {
    await ensureSchema();
    const db = getDb();

    if (req.method === "PATCH") {
      const body = await readJson(req);
      const action = body.action;
      const now = new Date().toISOString();

      const existing = await db.execute({
        sql: "SELECT * FROM elumia_item_entries WHERE id = ?",
        args: [id]
      });
      if (!existing.rows.length) return sendJson(res, 404, { error: "Item entry not found." });
      const row = existing.rows[0];

      if (action === "approve") {
        const session = await requireAdmin(req);
        await db.execute({
          sql: "UPDATE elumia_item_entries SET status = 'published', reviewed_at = ?, reviewed_by = ?, reject_note = NULL WHERE id = ?",
          args: [now, session.username, id]
        });
        return sendJson(res, 200, { ok: true, status: "published" });
      }

      if (action === "reject") {
        await requireAdmin(req);
        await db.execute({
          sql: "DELETE FROM elumia_item_entries WHERE id = ?",
          args: [id]
        });
        return sendJson(res, 200, { ok: true, status: "rejected" });
      }

      if (action === "updateIcon") {
        await requireModOrAdmin(req);
        const iconId = String(body.iconId || body.icon_id || "").trim() || null;
        await db.execute({
          sql: "UPDATE elumia_item_entries SET icon_id = ? WHERE id = ?",
          args: [iconId, id]
        });
        const updated = await db.execute({
          sql: "SELECT * FROM elumia_item_entries WHERE id = ?",
          args: [id]
        });
        return sendJson(res, 200, { ok: true, item: rowToItem(updated.rows[0]) });
      }

      if (action === "update") {
        await requireModOrAdmin(req);
        const data = validatePayload(body);
        await db.execute({
          sql: `UPDATE elumia_item_entries SET
            category = ?, name = ?, rarity = ?, phase = ?, ilvl = ?, req = ?, slot = ?,
            source = ?, source_type = ?, dps = ?, speed = ?, armor = ?, stat = ?, roll_pct = ?,
            bonuses_json = ?, icon_id = ?
            WHERE id = ?`,
          args: [
            data.category, data.name, data.rarity, data.phase, data.ilvl, data.req,
            data.slot, data.source, data.sourceType, data.dps, data.speed, data.armor,
            data.stat, data.roll, bonusesToJson(data.bonuses), data.iconId, id
          ]
        });
        const updated = await db.execute({
          sql: "SELECT * FROM elumia_item_entries WHERE id = ?",
          args: [id]
        });
        return sendJson(res, 200, { ok: true, item: rowToItem(updated.rows[0]) });
      }

      return sendJson(res, 400, { error: "Invalid action." });
    }

    if (req.method === "DELETE") {
      await requireAdmin(req);
      await db.execute({ sql: "DELETE FROM elumia_item_entries WHERE id = ?", args: [id] });
      return sendJson(res, 200, { ok: true });
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    handleError(res, err);
  }
}
