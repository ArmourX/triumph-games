import { readJson, sendJson, handleError } from "../http.js";
import { requireSession, getSession } from "../auth.js";
import { getDb, ensureSchema } from "../db.js";

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function handle(req, res) {
  try {
    await ensureSchema();
    const db = getDb();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const championSlug = url.searchParams.get("champion");
    const category = url.searchParams.get("category");

    if (req.method === "GET" && championSlug && category) {
      const key = `${championSlug}:${slugify(category)}`;
      const result = await db.execute({
        sql: "SELECT user_id, stars FROM votes WHERE champion_slug = ? AND category = ?",
        args: [championSlug, slugify(category)]
      });
      const votes = {};
      result.rows.forEach((row) => { votes[row.user_id] = row.stars; });
      const values = Object.values(votes);
      const avg = values.length
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
        : null;
      const session = await getSession(req);
      return sendJson(res, 200, {
        average: avg,
        count: values.length,
        userVote: session ? votes[session.userId] || null : null
      });
    }

    if (req.method === "POST") {
      const session = await requireSession(req);
      const body = await readJson(req);
      const slug = body.championSlug;
      const cat = slugify(body.category);
      const stars = Math.max(1, Math.min(5, Math.round(body.stars)));
      await db.execute({
        sql: `INSERT INTO votes (champion_slug, category, user_id, stars)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(champion_slug, category, user_id) DO UPDATE SET stars = excluded.stars`,
        args: [slug, cat, session.userId, stars]
      });
      return sendJson(res, 200, { ok: true, stars });
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    handleError(res, err);
  }
}
