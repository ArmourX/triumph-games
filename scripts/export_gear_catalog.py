#!/usr/bin/env python3
"""Export Elumia gear catalog JSON for elumia-database2."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "CryptolandWarrior" / "scripts"))

from generate_gear_economy import (  # noqa: E402
    CLASS_LINE,
    MW_META,
    STAR_META,
    build_items,
    fixed_stat_slots,
    stat_count,
    stars_label,
)

OUT = ROOT / "data" / "elumia-gear-catalog.json"

SLOT_TO_CATEGORY = {
    "Weapon": "weapons",
    "Off-hand": "offhand",
    "Chest": "armour",
    "Helmet": "armour",
    "Amulet": "amulet",
    "Ring": "rings",
}

RARITY_CLASS = {
    "Common": "common",
    "Uncommon": "uncommon",
    "Rare": "rare",
    "Epic": "epic",
    "Legendary": "legendary",
}


def placeholder_url(slot: str, cls: str, star: int) -> str:
    labels = {
        "Weapon": "WPN",
        "Off-hand": "OFF",
        "Chest": "CHT",
        "Helmet": "HLM",
        "Amulet": "AMU",
        "Ring": "RNG",
    }
    text = labels.get(slot, "ITM")
    if cls in ("Any", "Classless", ""):
        text = {"Champion": "CH", "Battlemage": "MG", "Archer": "AR"}.get(cls, text) + text[:2]
    bg = ["2d1b0e", "1a2a3a", "1a3a2a", "2a1a3a", "3a2a1a", "3a3a1a", "1a2a4a", "2a1a4a", "4a3a1a"][star - 1]
    return f"https://placehold.co/60x60/{bg}/e8c872?text={text}"


def main() -> None:
    items = build_items()
    catalog = []
    for it in items:
        stats = []
        for stat_slot, affix, _group, value, note in fixed_stat_slots(it["Slot"], it["Class"], it["IP"]):
            if stat_slot <= it["StatCount"]:
                stats.append({
                    "slot": stat_slot,
                    "affix": affix,
                    "value": value,
                    "note": note,
                })
        line = CLASS_LINE.get(it["Class"], {})
        catalog.append({
            "id": it["ItemId"],
            "category": SLOT_TO_CATEGORY[it["Slot"]],
            "name": it["Name"],
            "baseName": it["Name"].split(" ", 2)[-1] if len(it["Name"].split(" ")) >= 3 else it["Name"],
            "slot": it["Slot"],
            "displaySlot": it["WeaponType"] if it["Slot"] in ("Weapon", "Off-hand") else it["Slot"],
            "class": it["Class"],
            "classLock": it["ClassLock"],
            "starRank": it["StarRank"],
            "stars": it["Stars"],
            "starName": it["StarName"],
            "element": it.get("Element", ""),
            "masterwork": it["Masterwork"],
            "masterworkName": it["MasterworkName"],
            "rarity": RARITY_CLASS.get(it["Rarity"], "common"),
            "rarityLabel": it["Rarity"],
            "statCount": it["StatCount"],
            "maxStatSlots": stat_count(4),
            "level": it["RequiredLevel"],
            "craftLevel": it.get("CraftLevel", it["RequiredLevel"]),
            "ip": it["IP"],
            "stats": stats,
            "recipe": it.get("Recipe", ""),
            "gatherZone": it.get("GatherZone", ""),
            "iconUrl": placeholder_url(it["Slot"], it["Class"], it["StarRank"]),
            "armorLine": line.get("armor", "—"),
        })

    meta = {
        "stars": [{"rank": s[0], "name": s[1], "element": s[3], "zone": s[4]} for s in STAR_META],
        "masterwork": [{"id": m[0], "name": m[1], "rarity": m[2], "statCount": stat_count(m[0])} for m in MW_META],
        "categories": [
            {"id": "weapons", "label": "Weapons"},
            {"id": "armour", "label": "Armour"},
            {"id": "offhand", "label": "Offhand"},
            {"id": "rings", "label": "Rings"},
            {"id": "amulet", "label": "Amulet"},
        ],
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"meta": meta, "items": catalog}, indent=2), encoding="utf-8")
    print("exported", len(catalog), "items ->", OUT)


if __name__ == "__main__":
    main()
