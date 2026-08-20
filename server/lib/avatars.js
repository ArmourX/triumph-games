export const DEFAULT_AVATAR_SLUG = "invictus";

export const AVATAR_SLUGS = new Set([
  "bonelord", "caelan", "cassiel", "elicard", "etherstone-golem", "fara", "fionann",
  "gozu", "hilde", "hirada", "honnari", "invictus", "kojin", "logarius", "marduk",
  "nightwalker", "nightwalker-fencer", "orochi", "ryker", "siegward", "sinister-lich",
  "skeleton-knight", "skeleton-maniac", "spirit-of-nature", "sybil", "tharcann",
  "tristan", "unshaken", "ursan", "vaila", "wraith", "zephyr"
]);

export function normalizeAvatarSlug(slug) {
  const s = String(slug || "").trim().toLowerCase();
  if (AVATAR_SLUGS.has(s)) return s;
  return DEFAULT_AVATAR_SLUG;
}

export function assertValidAvatar(slug) {
  const s = String(slug || "").trim().toLowerCase();
  if (!AVATAR_SLUGS.has(s)) {
    throw Object.assign(new Error("Choose a valid BattleRise avatar."), { status: 400 });
  }
  return s;
}
