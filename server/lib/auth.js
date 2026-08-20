import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getDb, ensureSchema, uid } from "./db.js";
import { assertValidAvatar, DEFAULT_AVATAR_SLUG, normalizeAvatarSlug } from "./avatars.js";

const COOKIE_NAME = "tg_token";
const TOKEN_TTL = "30d";
const ADMIN_USERNAMES = new Set(["admin", "tester"]);
const MOD_USERNAMES = new Set(["mod"]);

function isAdminUser(username) {
  return ADMIN_USERNAMES.has(String(username || "").trim().toLowerCase());
}

function isModUser(username) {
  return MOD_USERNAMES.has(String(username || "").trim().toLowerCase());
}

export function sessionIsAdmin(session) {
  return !!(session && (session.isAdmin || isAdminUser(session.username)));
}

export function sessionIsMod(session) {
  if (!session) return false;
  return !!(session.isMod || isModUser(session.username));
}

export function sessionCanEditElumia(session) {
  return sessionIsAdmin(session) || sessionIsMod(session);
}

function secret() {
  const key = process.env.JWT_SECRET;
  if (!key || key.length < 16) {
    throw new Error("JWT_SECRET must be set (min 16 characters).");
  }
  return new TextEncoder().encode(key);
}

export function getTokenFromRequest(req) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (match) return match[1];
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function createToken(user) {
  const avatarSlug = normalizeAvatarSlug(user.avatar_slug);
  return new SignJWT({
    sub: user.id,
    username: user.username,
    isAdmin: !!user.is_admin,
    isMod: !!user.is_mod,
    avatarSlug
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secret());
}

export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      userId: payload.sub,
      username: payload.username,
      isAdmin: !!payload.isAdmin,
      isMod: !!payload.isMod,
      avatarSlug: normalizeAvatarSlug(payload.avatarSlug)
    };
  } catch {
    return null;
  }
}

export function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${secure}`
  );
}

export function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`);
}

export async function getSession(req) {
  const token = getTokenFromRequest(req);
  return verifyToken(token);
}

export async function requireSession(req) {
  const session = await getSession(req);
  if (!session) {
    const err = new Error("Authentication required.");
    err.status = 401;
    throw err;
  }
  return session;
}

export async function requireModOrAdmin(req) {
  const session = await requireSession(req);
  if (!sessionCanEditElumia(session)) {
    const err = new Error("Moderator access required.");
    err.status = 403;
    throw err;
  }
  return session;
}

export async function requireAdmin(req) {
  const session = await requireSession(req);
  if (!sessionIsAdmin(session)) {
    const err = new Error("Admin access required.");
    err.status = 403;
    throw err;
  }
  return session;
}

export async function signupUser(username, password, avatarSlug) {
  await ensureSchema();
  const db = getDb();
  username = username.trim();
  if (username.length < 3) throw Object.assign(new Error("Username must be at least 3 characters."), { status: 400 });
  if ((password || "").length < 6) throw Object.assign(new Error("Password must be at least 6 characters."), { status: 400 });
  const avatar = assertValidAvatar(avatarSlug || DEFAULT_AVATAR_SLUG);

  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
    args: [username]
  });
  if (existing.rows.length) {
    throw Object.assign(new Error("That username is already taken."), { status: 409 });
  }

  const id = uid("u");
  const passwordHash = await bcrypt.hash(password, 10);
  const isAdmin = isAdminUser(username) ? 1 : 0;
  const isMod = isModUser(username) ? 1 : 0;
  const createdAt = new Date().toISOString();

  await db.execute({
    sql: "INSERT INTO users (id, username, password_hash, avatar_slug, is_admin, is_mod, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [id, username, passwordHash, avatar, isAdmin, isMod, createdAt]
  });

  return { id, username, avatar_slug: avatar, is_admin: isAdmin, is_mod: isMod, created_at: createdAt };
}

export async function loginUser(username, password) {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, username, password_hash, avatar_slug, is_admin, is_mod FROM users WHERE LOWER(username) = LOWER(?)",
    args: [username.trim()]
  });
  if (!result.rows.length) {
    throw Object.assign(new Error("Account not found."), { status: 404 });
  }
  const row = result.rows[0];
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) throw Object.assign(new Error("Incorrect password."), { status: 401 });
  return {
    id: row.id,
    username: row.username,
    avatar_slug: normalizeAvatarSlug(row.avatar_slug),
    is_admin: isAdminUser(row.username) || row.is_admin ? 1 : 0,
    is_mod: isModUser(row.username) || row.is_mod ? 1 : 0
  };
}

export { COOKIE_NAME, isAdminUser, isModUser };
