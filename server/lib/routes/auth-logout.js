import { sendJson } from "../http.js";
import { clearAuthCookie } from "../auth.js";

export async function handle(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed." });
  clearAuthCookie(res);
  sendJson(res, 200, { ok: true });
}
