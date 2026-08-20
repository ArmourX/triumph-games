CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_slug TEXT NOT NULL DEFAULT 'invictus',
  is_admin INTEGER DEFAULT 0,
  is_mod INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wiki_edits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  game TEXT NOT NULL,
  page_id TEXT NOT NULL,
  page_title TEXT,
  field TEXT NOT NULL,
  field_label TEXT,
  original_text TEXT,
  proposed_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL,
  reviewed_at TEXT,
  reviewed_by TEXT,
  reject_note TEXT
);

CREATE TABLE IF NOT EXISTS wiki_approved (
  game TEXT NOT NULL,
  page_id TEXT NOT NULL,
  field TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (game, page_id, field)
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  game TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('guide', 'article')),
  title TEXT NOT NULL,
  description TEXT,
  author_id TEXT NOT NULL,
  author_username TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  sections TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  reviewed_at TEXT,
  reviewed_by TEXT,
  reject_note TEXT
);

CREATE TABLE IF NOT EXISTS votes (
  champion_slug TEXT NOT NULL,
  category TEXT NOT NULL,
  user_id TEXT NOT NULL,
  stars INTEGER NOT NULL,
  PRIMARY KEY (champion_slug, category, user_id)
);

CREATE INDEX IF NOT EXISTS idx_posts_list ON posts(game, type, status);
CREATE INDEX IF NOT EXISTS idx_wiki_edits_status ON wiki_edits(status);

CREATE TABLE IF NOT EXISTS elumia_item_entries (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('weapons', 'armour', 'rings', 'offhand', 'amulet', 'pets', 'goods')),
  name TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  phase TEXT,
  ilvl INTEGER,
  req INTEGER,
  slot TEXT,
  source TEXT,
  source_type TEXT,
  dps REAL,
  speed REAL,
  armor INTEGER,
  stat TEXT,
  roll_pct TEXT,
  bonuses_json TEXT,
  icon_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  author_id TEXT,
  author_username TEXT,
  created_at TEXT NOT NULL,
  reviewed_at TEXT,
  reviewed_by TEXT,
  reject_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_elumia_items_cat ON elumia_item_entries(category, status);
CREATE INDEX IF NOT EXISTS idx_elumia_items_name ON elumia_item_entries(category, name);
