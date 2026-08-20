"""Download BattleRise images from Megalords CDN asset bundles and refresh site data."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets" / "battlerise"
CDN = "https://bundles.sourceofmana.com/Android/prod_0.170.0/"
HEADERS = {
    "User-Agent": "UnityPlayer/2021.3.0f1 (UnityWebRequest/1.0, libcurl/7.84.0-DEV)",
    "Accept": "*/*",
}
BUNDLES = [
    ("tutorial", ASSETS / "champions", "_Vertical|_Portrait|_Avatar"),
    ("atlascharacter_verticalportraits", ASSETS / "champions", "_Vertical"),
    ("atlascharacter_portraits", ASSETS / "champions" / "portraits", "_Portrait|_Avatar"),
    ("atlas_cardsstoryillustrations", ASSETS / "artifacts" / "story", "_Story|"),
    ("atlas_shardscardsrarity", ASSETS / "artifacts" / "icons", ""),
]
API_CHARACTER = "https://megalords.com/api/character/"
API_GEAR = "https://megalords.com/api/gear/"

CHAMPION_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{name} | BattleRise | Triumph Guides</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="hub.css">
  <link rel="stylesheet" href="battlerise-champion.css">
  <link rel="stylesheet" href="triumph-community.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
</head>
<body class="hub-page br-champion-page" data-champion-slug="{slug}">
  <header class="hub-header"><div class="container hub-header-inner"><a href="index.html" class="hub-brand"><span class="hub-logo-icon">T</span><span class="hub-logo-text">Triumph Guides</span></a><nav class="hub-games-nav"><a href="elumia.html" class="hub-game-pill">Elumia</a><a href="battlerise.html" class="hub-game-pill active">Battlerise</a><a href="armourx.html" class="hub-game-pill">ArmourX</a></nav></div></header>
  <nav class="hub-nav"><div class="container hub-nav-inner"><a href="battlerise.html" class="hub-nav-link">Overview</a><a href="battlerise-champions.html" class="hub-nav-link active">Champions</a><a href="battlerise-artifacts.html" class="hub-nav-link">Artifacts</a><a href="battlerise-guides.html" class="hub-nav-link">Guides</a><a href="battlerise-tier-list.html" class="hub-nav-link">Tier List</a></div></nav>
  <div id="br-champion-root">
    <section class="br-champion-hero"><div class="container br-champion-hero-inner"><img id="br-portrait" class="br-champion-portrait" src="{portrait}" alt="{name}"><div><h1 class="br-champion-title" id="br-name">{name}</h1><div class="br-champion-meta"><span class="br-meta-pill" id="br-faction">{faction}</span><span class="br-meta-pill" id="br-spec">{spec}</span><span class="br-meta-pill" id="br-role">{role}</span></div><p class="br-champion-updated">Last Updated: <time datetime="2026-07-31">July 31, 2026</time></p></div></div></section>
    <nav class="br-champion-tabs"><div class="container br-champion-tabs-inner"><a href="#overview" class="br-champion-tab active">Overview</a><a href="#ratings" class="br-champion-tab">Ratings</a><a href="#skills" class="br-champion-tab">Skills</a><a href="#gear" class="br-champion-tab">Gear</a></div></nav>
    <div class="container br-champion-body">
      <section id="overview" class="br-section"><h2>{name} Overview</h2><div id="br-overview-text" data-editable data-edit-game="battlerise" data-edit-page="champion-{slug}" data-edit-field="overview" data-edit-title="{name}" data-edit-label="Overview"></div><div id="br-base-stats" class="br-stats-row"></div></section>
      <section id="ratings" class="br-section"><h2>{name} Ratings</h2><div id="tg-auth-bar"></div><div id="br-ratings-grid" class="br-ratings-grid"></div></section>
      <section id="skills" class="br-section"><h2>{name} Skills</h2><div id="br-skills-list" class="br-skills-list"></div><div class="br-book-box"><div><strong>Book Value:</strong> <span id="br-book-value"></span></div><div><strong>Book Priority:</strong> <span id="br-book-priority"></span></div></div></section>
      <section id="gear" class="br-section"><h2>{name} Gear Recommendations</h2><div class="br-gear-grid"><div class="br-gear-card"><h3>Recommended PvE Stats</h3><ul id="br-pve-stats"></ul><h3 style="margin-top:1rem">Recommended PvE Artifacts</h3><div id="br-pve-sets" class="br-artifact-recs"></div></div><div class="br-gear-card"><h3>Recommended PvP Stats</h3><ul id="br-pvp-stats"></ul><h3 style="margin-top:1rem">Recommended PvP Artifacts</h3><div id="br-pvp-sets" class="br-artifact-recs"></div></div></div></section>
    </div>
  </div>
  <footer class="hub-footer"><div class="container hub-footer-inner"><a href="battlerise-champions.html">&larr; Back to Champions</a><p>&copy; 2026 Triumph Guides. Data from megalords.com.</p></div></footer>
  <script src="js/triumph-community.js"></script>
  <script src="js/triumph-edits.js"></script>
  <script src="js/battlerise-data.js"></script>
  <script src="js/battlerise-champion-extras.js"></script>
  <script src="js/battlerise-champion-detail.js"></script>
</body>
</html>
"""


def fetch_json(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def download_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=180) as resp:
        return resp.read()


def should_keep_sprite(name: str, pattern: str) -> bool:
    if not name or name.startswith("Unity") or "sactx-" in name:
        return False
    if not pattern:
        return True
    return bool(re.search(pattern, name))


def extract_bundle_sprites(bundle_bytes: bytes, out_dir: Path, pattern: str = "") -> dict[str, str]:
    from UnityPy import Environment

    out_dir.mkdir(parents=True, exist_ok=True)
    saved: dict[str, str] = {}
    env = Environment(bundle_bytes)

    for obj in env.objects:
        if obj.type.name != "Sprite":
            continue
        data = obj.read()
        name = data.m_Name
        if not should_keep_sprite(name, pattern):
            continue
        img = data.image
        if img is None:
            continue
        path = out_dir / f"{name}.png"
        img.save(path)
        saved[name] = str(path.relative_to(ROOT)).replace("\\", "/")
    return saved


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def spec_name(code: int) -> str:
    return {0: "NONE", 1: "STR", 2: "AGI", 3: "INT"}.get(code, "NONE")


def rarity_name(code: int) -> str:
    return {0: "Common", 1: "Rare", 2: "Epic", 3: "Legendary", 4: "Mythic"}.get(code, "Rare")


def role_from_tags(tags: list[int]) -> str:
    if 1 in tags:
        return "defender"
    if 14 in tags or 16 in tags:
        return "support"
    if 15 in tags:
        return "controller"
    return "attacker"


def card_class(rarity: str) -> str:
    return {"Common": "blue", "Rare": "blue", "Epic": "purple", "Legendary": "gold", "Mythic": "mythic"}.get(rarity, "purple")


def lookup_portrait(portrait_key: str, sprites: dict[str, str]) -> str:
    candidates = [
        f"{portrait_key}_Vertical",
        f"{portrait_key}_Portrait",
        f"{portrait_key}_Avatar",
        portrait_key,
    ]
    for key in candidates:
        if key in sprites:
            return sprites[key]
    for name, path in sprites.items():
        if name.startswith(portrait_key + "_") and ("Vertical" in name or "Portrait" in name):
            return path
    return f"assets/battlerise/champions/{portrait_key}_Vertical.png"


STAT_LABELS = {
    0: "Health",
    1: "Speed",
    2: "Armor",
    3: "Magic RES",
    4: "Crit Rate",
    5: "Damage",
    6: "Crit DMG",
}

GEAR_TYPE_LABELS = {
    1: "Weapon",
    2: "Minion",
    3: "Spell",
    4: "Armor",
    5: "Relic",
    6: "Tale",
    7: "Clothing",
    8: "Shield",
    9: "Gauntlets",
    10: "Boots",
    11: "Helmet",
    12: "Material",
    13: "Exotic",
    14: "Ring",
    15: "Necklace",
}


def format_stat(stat: dict) -> str:
    label = STAT_LABELS.get(stat.get("type", -1), "Stat")
    value = stat.get("value", 0)
    if stat.get("valueType") == 1:
        return f"+{value}% {label}"
    return f"+{value} {label}"


def build_display_stats(entry: dict) -> tuple[list[str], int]:
    stats = entry.get("stats") or []
    formatted = [format_stat(s) for s in stats if s.get("value")]
    if formatted:
        hidden = max(0, len(formatted) - 2) + len(entry.get("unique_slots") or [])
        return formatted[:2], hidden

    distributions = sorted(
        [d for d in (entry.get("statDistributions") or []) if d.get("value", 0) > 0],
        key=lambda d: -d.get("value", 0),
    )
    dist_labels = [STAT_LABELS.get(d.get("type", -1), "Stat") for d in distributions[:2]]
    formatted = [f"+{d.get('value')}% {STAT_LABELS.get(d.get('type', -1), 'Stat')}" for d in distributions[:2]]
    if not formatted and dist_labels:
        formatted = dist_labels
    hidden = max(0, len(distributions) - 2) + len(entry.get("unique_slots") or []) + len(entry.get("slots") or [])
    return formatted[:2], hidden


def build_roll(g: dict) -> dict:
    stats = [format_stat(s) for s in g.get("stats") or [] if s.get("value")]
    substat_rolls = []
    for d in sorted(g.get("statDistributions") or [], key=lambda x: -x.get("value", 0)):
        if d.get("value", 0) > 0:
            label = STAT_LABELS.get(d.get("type", -1), "Stat")
            substat_rolls.append(f"+{d['value']}% {label} (substat roll)")
    unique_count = len(g.get("unique_slots") or [])
    slot_count = len(g.get("slots") or [])
    notes = []
    if unique_count:
        notes.append(f"{unique_count} unique ability slot{'s' if unique_count > 1 else ''}")
    elif slot_count:
        notes.append(f"{slot_count} ability slot{'s' if slot_count > 1 else ''}")
    level = g.get("level", 1)
    return {
        "id": g.get("id"),
        "level": level,
        "label": f"Level {level}",
        "stats": stats,
        "substatRolls": substat_rolls,
        "notes": notes,
    }


def dedupe_rolls(rolls: list[dict]) -> list[dict]:
    seen: set[tuple] = set()
    out: list[dict] = []
    for r in sorted(rolls, key=lambda x: (x["level"], x["id"])):
        key = (r["level"], tuple(r["stats"]), tuple(r["substatRolls"]), tuple(r["notes"]))
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out


def lookup_card_image(icon: str, cards: dict[str, str], stories: dict[str, str], icons: dict[str, str]) -> str:
    if icon in cards:
        return cards[icon]
    story_key = f"{icon}_Story"
    if story_key in stories:
        return stories[story_key]
    if icon in icons:
        return icons[icon]
    for name, path in stories.items():
        if name.replace("_Story", "") == icon:
            return path
    return f"assets/battlerise/artifacts/cards/{icon}.png"


def extract_gear_cards(bundle_bytes: bytes, out_dir: Path, icon_names: set[str]) -> dict[str, str]:
    from UnityPy import Environment

    out_dir.mkdir(parents=True, exist_ok=True)
    saved: dict[str, str] = {}
    env = Environment(bundle_bytes)

    for obj in env.objects:
        if obj.type.name != "Sprite":
            continue
        data = obj.read()
        name = data.m_Name
        if name not in icon_names:
            continue
        img = data.image
        if img is None:
            continue
        path = out_dir / f"{name}.png"
        img.save(path)
        saved[name] = str(path.relative_to(ROOT)).replace("\\", "/")
    return saved


def build_characters(api: dict, sprites: dict[str, str]) -> list[dict]:
    by_slug: dict[str, dict] = {}
    rank = {"Common": 0, "Rare": 1, "Epic": 2, "Legendary": 3, "Mythic": 4}

    for ch in api.get("charactersPrototypes", []):
        if ch.get("type") != 0:
            continue
        name = (ch.get("name") or "").strip()
        portrait_key = ch.get("portrait") or ch.get("bundle")
        if not name or not portrait_key or portrait_key == "_Unknown" or name.lower() == "unknown":
            continue

        rarity = rarity_name(ch.get("rarity", 1))
        slug = slugify(name)
        desc = ch.get("description") or ""
        faction = desc.split()[0] if desc else "Eos"
        lore = (ch.get("loreText") or "").replace("\r\n", "\n").strip()

        entry = {
            "id": ch.get("id"),
            "key": portrait_key,
            "slug": slug,
            "name": name,
            "title": ch.get("title", ""),
            "role": role_from_tags(ch.get("tags", [])),
            "spec": spec_name(ch.get("specialization", 0)),
            "rarity": rarity,
            "faction": faction,
            "cardClass": card_class(rarity),
            "portrait": lookup_portrait(portrait_key, sprites),
            "detailUrl": f"battlerise-champion-{slug}.html",
            "description": desc,
            "lore": lore,
        }

        prev = by_slug.get(slug)
        if not prev:
            by_slug[slug] = entry
            continue
        prev_score = (len(prev.get("lore", "")), rank.get(prev["rarity"], 0), -prev["id"])
        new_score = (len(lore), rank.get(rarity, 0), -entry["id"])
        if new_score > prev_score:
            by_slug[slug] = entry

    return sorted(by_slug.values(), key=lambda c: c["name"].lower())


def build_artifacts(api: dict, cards: dict[str, str], icons: dict[str, str], stories: dict[str, str]) -> list[dict]:
    rank = {"Common": 0, "Rare": 1, "Epic": 2, "Legendary": 3, "Mythic": 4}
    by_icon: dict[str, dict] = {}
    rolls_map: dict[str, list[dict]] = {}

    for g in api.get("gearItemsPrototypes", []):
        name = g.get("name", "")
        icon = g.get("icon", "")
        if not name or not icon:
            continue
        rolls_map.setdefault(icon, []).append(g)
        rarity = rarity_name(g.get("rarity", 1))
        gear_type = g.get("type", 0)
        card_image = lookup_card_image(icon, cards, stories, icons)
        entry = {
            "id": g.get("id"),
            "name": name,
            "rarity": rarity,
            "spec": spec_name(g.get("specialization", 0)),
            "icon": icon,
            "slug": slugify(name),
            "level": g.get("level", 1),
            "gearType": gear_type,
            "gearTypeLabel": GEAR_TYPE_LABELS.get(gear_type, "Artifact"),
            "image": card_image,
            "cardImage": card_image,
            "stats": g.get("stats") or [],
            "story": (g.get("story") or "").replace("\r\n", "\n").strip(),
            "storyTitle": g.get("storyTitle", ""),
        }
        display_stats, hidden = build_display_stats({**entry, "statDistributions": g.get("statDistributions"), "unique_slots": g.get("unique_slots"), "slots": g.get("slots")})
        entry["displayStats"] = display_stats
        entry["hiddenCount"] = hidden
        prev = by_icon.get(icon)
        if not prev or rank[rarity] > rank[prev["rarity"]] or (rank[rarity] == rank[prev["rarity"]] and entry["level"] > prev["level"]):
            by_icon[icon] = entry

    artifacts = []
    for icon, entry in by_icon.items():
        rolls = dedupe_rolls([build_roll(g) for g in rolls_map.get(icon, [])])
        if rolls:
            entry["rolls"] = rolls
            default = rolls[-1]
            entry["level"] = default["level"]
            entry["displayStats"] = default["stats"][:2]
            extra = len(default["stats"]) - 2 + len(default["substatRolls"]) + len(default["notes"])
            entry["hiddenCount"] = max(0, extra)
        artifacts.append(entry)

    return sorted(artifacts, key=lambda a: (-rank[a["rarity"]], a["name"]))


def generate_champion_pages(champions: list[dict]):
    keep = set()
    slugs: set[str] = set()
    for c in champions:
        if c["slug"] in slugs:
            continue
        slugs.add(c["slug"])
        keep.add(c["detailUrl"])
        role = c["role"].capitalize()
        html = CHAMPION_HTML.format(
            name=c["name"],
            slug=c["slug"],
            portrait=c["portrait"],
            faction=c["faction"],
            spec=c["spec"],
            role=role,
        )
        (ROOT / c["detailUrl"]).write_text(html, encoding="utf-8")

    for old in ROOT.glob("battlerise-champion-*.html"):
        if old.name not in keep:
            old.unlink()


def main():
    print("Downloading asset bundles...")
    all_sprites: dict[str, str] = {}
    icons: dict[str, str] = {}
    stories: dict[str, str] = {}

    for bundle, out_dir, pattern in BUNDLES:
        url = CDN + bundle
        print(f"  {bundle}...")
        try:
            data = download_bytes(url)
            found = extract_bundle_sprites(data, out_dir, pattern)
            all_sprites.update(found)
            if "artifact" in str(out_dir):
                if "story" in str(out_dir):
                    stories.update(found)
                else:
                    icons.update(found)
            print(f"    extracted {len(found)} sprites")
        except Exception as exc:
            print(f"    FAILED: {exc}")

    print("Fetching Megalords API...")
    char_api = fetch_json(API_CHARACTER)
    gear_api = fetch_json(API_GEAR)
    gear_icons = {g.get("icon") for g in gear_api.get("gearItemsPrototypes", []) if g.get("icon")}

    cards: dict[str, str] = {}
    tutorial_url = CDN + "tutorial"
    print("Extracting gear card art from tutorial bundle...")
    try:
        tutorial_bytes = download_bytes(tutorial_url)
        cards = extract_gear_cards(tutorial_bytes, ASSETS / "artifacts" / "cards", gear_icons)
        print(f"  saved {len(cards)} card illustrations")
    except Exception as exc:
        print(f"  card extraction FAILED: {exc}")

    champions = build_characters(char_api, all_sprites)
    artifacts = build_artifacts(gear_api, cards, icons, stories)

    featured_keys = ["Invictus", "BlessedSentinel", "Bonelord", "Samurai", "Vampire_Lord", "Cassiel"]
    featured = [k for k in featured_keys if any(c["key"] == k for c in champions)]

    payload = {
        "champions": champions,
        "artifacts": artifacts,
        "featured": featured,
        "source": "megalords.com API + bundles.sourceofmana.com",
    }

    (ROOT / "js" / "battlerise-data.js").write_text(
        "window.BATTLERISE_DATA = " + json.dumps(payload, indent=2) + ";\n",
        encoding="utf-8",
    )

    print("Generating champion pages...")
    generate_champion_pages(champions)

    print(f"Done: {len(champions)} champions, {len(artifacts)} artifacts, {len(all_sprites)} sprites")


if __name__ == "__main__":
    main()
