import { readJson, sendJson, handleError } from "../http.js";
import { signupUser, createToken, setAuthCookie } from "../auth.js";
import { normalizeAvatarSlug } from "../avatars.js";

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    isAdmin: !!user.is_admin,
    isMod: !!user.is_mod,
    avatarSlug: normalizeAvatarSlug(user.avatar_slug)
  };
}

export async function handle(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed." });
  try {
    const body = await readJson(req);
    const user = await signupUser(body.username, body.password, body.avatarSlug);
    const token = await createToken(user);
    setAuthCookie(res, token);
    sendJson(res, 201, { user: publicUser(user) });
  } catch (err) {
    handleError(res, err);
  }
}
