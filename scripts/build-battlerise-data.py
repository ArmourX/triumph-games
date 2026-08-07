"""Generate BattleRise data JS and SVG placeholders from dev folder metadata."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEV = Path(r"C:\Users\dynam\Desktop\Battlerise DEV\Battlerise\BattleRise")
ASSETS = ROOT / "assets" / "battlerise"
CHARS_JSON = DEV / "Assets" / "scripts" / "database" / "json" / "characters.json"
ARTIFACTS_TXT = DEV / "Artifacts" / "artifact_list_full.txt"
if not ARTIFACTS_TXT.exists():
    ARTIFACTS_TXT = DEV / "artifact_list_full.txt"

ROLE_MAP = {
    "Invictus": ("defender", "STR", "Legendary", "Heaven Guardian"),
    "Heretic": ("attacker", "INT", "Epic", "Dead Knight"),
    "Bonelord": ("controller", "INT", "Legendary", "Undead"),
    "Samurai": ("attacker", "AGI", "Legendary", "Eastern Realm"),
    "Succubus": ("controller", "INT", "Epic", "Infernal"),
    "Vampire_Lord": ("attacker", "AGI", "Legendary", "Vampires"),
    "ElvenArcher": ("attacker", "AGI", "Rare", "Elvenwood"),
    "Nightwalker": ("attacker", "AGI", "Epic", "Shadow Court"),
    "BearBerserker": ("attacker", "STR", "Rare", "Wildlands"),
    "BlessedSentinel": ("defender", "STR", "Epic", "Heaven Guardian"),
    "Protector": ("defender", "STR", "Rare", "Royal Guard"),
    "Assassin": ("attacker", "AGI", "Epic", "Shadow Court"),
    "Archdruid": ("support", "INT", "Epic", "Nature"),
    "Cassiel": ("support", "INT", "Legendary", "Seraphim"),
    "Gozu": ("defender", "STR", "Epic", "Oni Clan"),
    "Harpy": ("attacker", "AGI", "Rare", "Skylands"),
    "Hilde": ("defender", "STR", "Epic", "Northern Holds"),
    "Huntress": ("attacker", "AGI", "Rare", "Wildlands"),
    "Ifrit": ("attacker", "INT", "Legendary", "Infernal"),
    "Kabuto": ("defender", "STR", "Rare", "Eastern Realm"),
    "Lifebringer": ("support", "INT", "Epic", "Heaven Guardian"),
    "Marduk": ("attacker", "STR", "Legendary", "Ancient Gods"),
    "Marksman": ("attacker", "AGI", "Rare", "Royal Guard"),
    "Mezu": ("controller", "INT", "Epic", "Infernal"),
    "Monk": ("support", "INT", "Rare", "Eastern Realm"),
    "Rience": ("attacker", "AGI", "Epic", "Shadow Court"),
    "Unshaken": ("defender", "STR", "Legendary", "Dragonborn"),
    "Vaila": ("support", "INT", "Epic", "Elvenwood"),
    "WolfSpirit": ("attacker", "AGI", "Rare", "Wildlands"),
    "Ent": ("defender", "STR", "Rare", "Nature"),
    "Golem": ("defender", "STR", "Rare", "Constructs"),
    "Vampire_Slayer": ("attacker", "STR", "Epic", "Vampire Hunters"),
    "Vampire_Hunter": ("attacker", "AGI", "Rare", "Vampire Hunters"),
    "Vampire_General": ("defender", "STR", "Epic", "Vampires"),
    "Footman": ("defender", "STR", "Common", "Royal Guard"),
    "Ghost": ("controller", "INT", "Rare", "Undead"),
    "HellHound": ("attacker", "AGI", "Rare", "Infernal"),
    "HellKnight": ("defender", "STR", "Epic", "Infernal"),
}

RARITY_CLASS = {
    "Common": "common",
    "Rare": "blue",
    "Epic": "purple",
    "Legendary": "gold",
    "Mythic": "mythic",
}

SPEC_COLORS = {"STR": "#c44", "AGI": "#4a9", "INT": "#68c", "NONE": "#999"}


def slugify(key: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", key.lower()).strip("-")


def display_name(key: str) -> str:
    return re.sub(r"([a-z])([A-Z])", r"\1 \2", key.replace("_", " "))


def champion_key_from_meta(meta: Path) -> str:
    name = meta.name
    if name.endswith("_Vertical.png.meta"):
        return name[: -len("_Vertical.png.meta")]
    stem = meta.stem
    return stem.replace("_Vertical", "")


def collect_champion_keys() -> list[str]:
    keys = set()
    for meta in DEV.glob("Assets/ResourcesExternal/**/*_Vertical.png.meta"):
        key = champion_key_from_meta(meta)
        if key.startswith("CardsTag") or key.startswith("CharacterFrame"):
            continue
        if key in {"NoChampion", "Popup_vertical", "_Unknown"}:
            continue
        if key.startswith("_"):
            continue
        if key.endswith("NPC") or "Burned" in key or "Void" in key or "Toxic" in key:
            continue
        if key.startswith("Skeleton_"):
            continue
        keys.add(key)
    return sorted(keys)


def parse_artifacts() -> list[dict]:
    rank = {"RARE": 1, "EPIC": 2, "LEGENDARY": 3, "MYTHIC": 4}
    seen = {}
    for line in ARTIFACTS_TXT.read_text(encoding="utf-8", errors="replace").splitlines():
        m = re.match(r"\d+:\s*(.+?)\s*\|\s*rarity=(\w+)\s*\|\s*spec=(\w+)\s*\|\s*icon=(.+)", line)
        if not m:
            continue
        name, rarity, spec, icon = [x.strip() for x in m.groups()]
        rarity = rarity.upper()
        if rarity not in rank:
            continue
        prev = seen.get(name)
        prev_rank = rank.get(str(prev["rarity"]).upper(), 0) if prev else 0
        if not prev or rank[rarity] > prev_rank:
            seen[name] = {
                "name": name,
                "rarity": rarity.title(),
                "spec": spec,
                "icon": icon,
                "slug": slugify(icon),
            }
    return sorted(seen.values(), key=lambda a: (-{"Mythic": 4, "Legendary": 3, "Epic": 2, "Rare": 1}[a["rarity"]], a["name"]))


def make_svg(path: Path, label: str, color: str, subtitle: str = ""):
    path.parent.mkdir(parents=True, exist_ok=True)
    safe = label.replace("&", "&amp;").replace("<", "&lt;")
    sub = subtitle.replace("&", "&amp;")
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{color}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0c0a06"/>
    </linearGradient>
  </defs>
  <rect width="400" height="560" fill="url(#g)"/>
  <rect x="16" y="16" width="368" height="528" rx="12" fill="none" stroke="{color}" stroke-opacity="0.35" stroke-width="2"/>
  <text x="200" y="480" text-anchor="middle" fill="#f5f2eb" font-family="Montserrat, sans-serif" font-size="22" font-weight="700">{safe}</text>
  <text x="200" y="510" text-anchor="middle" fill="#e9bb73" font-family="Inter, sans-serif" font-size="13">{sub}</text>
</svg>'''
    path.write_text(svg, encoding="utf-8")


def main():
    keys = collect_champion_keys()
    artifacts = parse_artifacts()
    proto = json.loads(CHARS_JSON.read_text(encoding="utf-8", errors="replace"))

    champions = []
    for key in keys:
        role, spec, rarity, faction = ROLE_MAP.get(
            key, ("attacker", "NONE", "Rare", "Unknown")
        )
        champions.append({
            "key": key,
            "slug": slugify(key),
            "name": display_name(key),
            "role": role,
            "spec": spec,
            "rarity": rarity,
            "faction": faction,
            "cardClass": RARITY_CLASS.get(rarity, "purple"),
            "portrait": f"assets/battlerise/champions/{key}_Vertical.svg",
            "detailUrl": f"battlerise-champion-{slugify(key)}.html",
        })
        color = SPEC_COLORS.get(spec, "#e9bb73")
        make_svg(
            ASSETS / "champions" / f"{key}_Vertical.svg",
            display_name(key),
            color,
            f"{rarity} · {spec}",
        )

    for art in artifacts:
        color = SPEC_COLORS.get(art["spec"], "#e9bb73")
        make_svg(
            ASSETS / "artifacts" / f"{art['icon']}.svg",
            art["name"],
            color,
            f"{art['rarity']} · {art['spec']}",
        )

    featured = ["Invictus", "Heretic", "Bonelord", "Samurai", "Vampire_Lord", "Cassiel"]
    detail_champions = {}
    for c in champions:
        if c["key"] in featured:
            detail_champions[c["slug"]] = c

    # Enrich Heretic from characters.json
    heretic = next((x for x in proto["characters"] if x["charName"] == "Heretic"), None)
    if heretic and "heretic" in detail_champions:
        detail_champions["heretic"]["skills"] = [
            {
                "name": s.get("name") if not s.get("name", "").startswith("idx:") else "Dark Strike" if i == 0 else "Heretic's Curse",
                "description": s["description"],
                "cooldown": s.get("cooldown", -1),
                "type": s.get("type", "physical"),
            }
            for i, s in enumerate(heretic.get("skills", []))
        ]
        detail_champions["heretic"]["passive"] = heretic.get("charAbilities", [{}])[0].get("description", "")
        detail_champions["heretic"]["stats"] = heretic.get("stats", {})

    data = {
        "champions": champions,
        "artifacts": artifacts,
        "featured": featured,
        "detailChampions": detail_champions,
    }

    out = ROOT / "js" / "battlerise-data.js"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        "window.BATTLERISE_DATA = " + json.dumps(data, indent=2) + ";\n",
        encoding="utf-8",
    )
    generate_champion_pages(champions)
    print(f"Wrote {len(champions)} champions, {len(artifacts)} artifacts -> {out}")


CHAMPION_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{name} | BattleRise | Triumph Guides</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="hub.css">
  <link rel="stylesheet" href="battlerise-champion.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
</head>
<body class="hub-page br-champion-page" data-champion-slug="{slug}">
  <header class="hub-header"><div class="container hub-header-inner"><a href="index.html" class="hub-brand"><span class="hub-logo-icon">T</span><span class="hub-logo-text">Triumph Guides</span></a><nav class="hub-games-nav"><a href="elumia.html" class="hub-game-pill">Elumia</a><a href="battlerise.html" class="hub-game-pill active">Battlerise</a><a href="armourx.html" class="hub-game-pill">ArmourX</a></nav></div></header>
  <nav class="hub-nav"><div class="container hub-nav-inner"><a href="battlerise.html" class="hub-nav-link">Overview</a><a href="battlerise-champions.html" class="hub-nav-link active">Champions</a><a href="battlerise-artifacts.html" class="hub-nav-link">Artifacts</a><a href="battlerise-guides.html" class="hub-nav-link">Guides</a><a href="battlerise-tier-list.html" class="hub-nav-link">Tier List</a></div></nav>

  <div id="br-champion-root">
    <section class="br-champion-hero"><div class="container br-champion-hero-inner"><img id="br-portrait" class="br-champion-portrait" src="{portrait}" alt="{name}"><div><h1 class="br-champion-title" id="br-name">{name}</h1><div class="br-champion-meta"><span class="br-meta-pill" id="br-faction">{faction}</span><span class="br-meta-pill" id="br-rarity">{rarity}</span><span class="br-meta-pill" id="br-spec">{spec}</span><span class="br-meta-pill" id="br-role">{role}</span></div><p class="br-champion-updated">Last Updated: <time datetime="2026-07-31">July 31, 2026</time></p></div></div></section>

    <nav class="br-champion-tabs"><div class="container br-champion-tabs-inner"><a href="#overview" class="br-champion-tab active">Overview</a><a href="#ratings" class="br-champion-tab">Ratings</a><a href="#skills" class="br-champion-tab">Skills</a><a href="#gear" class="br-champion-tab">Gear</a></div></nav>

    <div class="container br-champion-body">
      <section id="overview" class="br-section"><h2>{name} Overview</h2><div id="br-overview-text"></div><div id="br-base-stats" class="br-stats-row"></div></section>
      <section id="ratings" class="br-section"><h2>{name} Ratings</h2><div id="br-ratings-grid" class="br-ratings-grid"></div></section>
      <section id="skills" class="br-section"><h2>{name} Skills</h2><div id="br-skills-list" class="br-skills-list"></div><div class="br-book-box"><div><strong>Book Value:</strong> <span id="br-book-value"></span></div><div><strong>Book Priority:</strong> <span id="br-book-priority"></span></div></div></section>
      <section id="gear" class="br-section"><h2>{name} Gear Recommendations</h2><div class="br-gear-grid"><div class="br-gear-card"><h3>Recommended PvE Stats</h3><ul id="br-pve-stats"></ul><h3 style="margin-top:1rem">Recommended PvE Artifacts</h3><div id="br-pve-sets" class="br-artifact-recs"></div></div><div class="br-gear-card"><h3>Recommended PvP Stats</h3><ul id="br-pvp-stats"></ul><h3 style="margin-top:1rem">Recommended PvP Artifacts</h3><div id="br-pvp-sets" class="br-artifact-recs"></div></div></div></section>
    </div>
  </div>

  <footer class="hub-footer"><div class="container hub-footer-inner"><a href="battlerise-champions.html">&larr; Back to Champions</a><p>&copy; 2026 Triumph Guides. Data sourced from BattleRise development files.</p></div></footer>
  <script src="js/battlerise-data.js"></script>
  <script src="js/battlerise-champion-extras.js"></script>
  <script src="js/battlerise-champion-detail.js"></script>
</body>
</html>
"""


def generate_champion_pages(champions: list[dict]):
    for c in champions:
        role = c["role"].capitalize()
        html = CHAMPION_HTML.format(
            name=c["name"],
            slug=c["slug"],
            portrait=c["portrait"],
            faction=c["faction"],
            rarity=c["rarity"],
            spec=c["spec"],
            role=role,
        )
        path = ROOT / c["detailUrl"]
        path.write_text(html, encoding="utf-8")


if __name__ == "__main__":
    main()
