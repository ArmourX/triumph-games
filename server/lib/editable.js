/** Fields contributors may propose edits for. Image/asset fields are never allowed. */
const TEXT_FIELDS = new Set([
  "intro",
  "overview",
  "description",
  "lore",
  "skills",
  "gear",
  "ratings",
  "tier-list",
  "content"
]);

const BLOCKED_FIELD_PATTERNS = [
  /portrait/i,
  /image/i,
  /icon/i,
  /artifact/i,
  /card/i,
  /asset/i,
  /photo/i,
  /picture/i
];

const BLOCKED_PAGE_PATTERNS = [
  /^assets\//,
  /-artifacts$/,
  /artifact-/,
  /champion-portrait/
];

export function isEditableField(game, pageId, field) {
  if (!game || !pageId || !field) return false;
  if (BLOCKED_FIELD_PATTERNS.some((re) => re.test(field))) return false;
  if (BLOCKED_PAGE_PATTERNS.some((re) => re.test(pageId))) return false;
  if (!TEXT_FIELDS.has(field)) return false;

  if (pageId === "overview" && field === "intro") return true;
  if (pageId.startsWith("champion-") && field === "overview") return true;
  if (pageId.startsWith("guide-") || pageId.startsWith("battlerise-guide-")) return false;
  if (pageId.startsWith("champion-") && ["lore", "skills", "gear"].includes(field)) return true;
  if (pageId.endsWith("-tier-list") && field === "tier-list") return true;

  return TEXT_FIELDS.has(field);
}

export function assertEditable(game, pageId, field) {
  if (!isEditableField(game, pageId, field)) {
    const err = new Error("This field cannot be edited. Champion portraits and artifact images are locked.");
    err.status = 403;
    throw err;
  }
}
