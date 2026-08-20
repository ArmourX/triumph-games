"""Merge artifact roll variants from Megalords API into js/battlerise-data.js."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "js" / "battlerise-data.js"
API_GEAR = "https://megalords.com/api/gear/"

STAT_LABELS = {
    0: "Health",
    1: "Speed",
    2: "Armor",
    3: "Magic RES",
    4: "Crit Rate",
    5: "Damage",
    6: "Crit DMG",
}


def format_stat(stat: dict) -> str:
    label = STAT_LABELS.get(stat.get("type", -1), "Stat")
    value = stat.get("value", 0)
    if stat.get("valueType") == 1:
        return f"+{value}% {label}"
    return f"+{value} {label}"


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


def load_data() -> dict:
    text = DATA_FILE.read_text(encoding="utf-8")
    match = re.search(r"window\.BATTLERISE_DATA\s*=\s*(\{.*\})\s*;", text, re.DOTALL)
    if not match:
        raise SystemExit("Could not parse battlerise-data.js")
    return json.loads(match.group(1))


def fetch_gear() -> list[dict]:
    with urllib.request.urlopen(API_GEAR, timeout=30) as resp:
        payload = json.load(resp)
    return payload.get("gearItemsPrototypes", [])


def rolls_by_icon(prototypes: list[dict]) -> dict[str, list[dict]]:
    grouped: dict[str, list[dict]] = {}
    for g in prototypes:
        icon = g.get("icon")
        if not icon:
            continue
        grouped.setdefault(icon, []).append(build_roll(g))
    return {icon: dedupe_rolls(rolls) for icon, rolls in grouped.items()}


def main() -> None:
    data = load_data()
    prototypes = fetch_gear()
    icon_rolls = rolls_by_icon(prototypes)
    updated = 0

    for art in data.get("artifacts", []):
        rolls = icon_rolls.get(art.get("icon"), [])
        if not rolls:
            continue
        art["rolls"] = rolls
        default = rolls[-1]
        art["level"] = default["level"]
        art["displayStats"] = default["stats"][:2]
        extra = len(default["stats"]) - 2 + len(default["substatRolls"]) + len(default["notes"])
        art["hiddenCount"] = max(0, extra)
        updated += 1

    DATA_FILE.write_text(
        "window.BATTLERISE_DATA = " + json.dumps(data, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Updated {updated} artifacts with roll data -> {DATA_FILE}")


if __name__ == "__main__":
    main()
