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

from water_gear import WATER_QUALITY_TIERS, TIER_ZONE, build_water_items  # noqa: E402

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


def placeholder_url(slot: str, cls: str, star: int, gear_line: str = "standard") -> str:
    labels = {
        "Weapon": "WPN",
        "Off-hand": "OFF",
        "Chest": "CHT",
        "Helmet": "HLM",
        "Amulet": "AMU",
        "Ring": "RNG",
    }
    text = labels.get(slot, "ITM")
    if gear_line == "water":
        text = "H2O"
    elif cls in ("Any", "Classless", ""):
        text = {"Champion": "CH", "Battlemage": "MG", "Archer": "AR"}.get(cls, text) + text[:2]
    if gear_line == "water":
        bg = ["0a1a28", "0c2230", "0e2a38", "103040", "123848", "144050", "164858", "185060", "1a5868"][star - 1]
    else:
        bg = ["2d1b0e", "1a2a3a", "1a3a2a", "2a1a3a", "3a2a1a", "3a3a1a", "1a2a4a", "2a1a4a", "4a3a1a"][star - 1]
    return f"https://placehold.co/60x60/{bg}/e8c872?text={text}"


def item_to_catalog_entry(it: dict) -> dict:
    gear_line = it.get("GearLine", "standard")
    stats = []
    if gear_line == "water" and it.get("FlatStats"):
        for stat_slot, affix, _group, value, note in it["FlatStats"]:
            stats.append({
                "slot": stat_slot,
                "affix": affix,
                "value": value,
                "note": note,
            })
    else:
        for stat_slot, affix, _group, value, note in fixed_stat_slots(it["Slot"], it["Class"], it["IP"]):
            if stat_slot <= it["StatCount"]:
                stats.append({
                    "slot": stat_slot,
                    "affix": affix,
                    "value": value,
                    "note": note,
                })
    line = CLASS_LINE.get(it["Class"], {})
    name = it["Name"]
    if gear_line == "water":
        base_name = name.split(" ", 1)[1] if " " in name else name
        quality = it.get("Quality", it.get("MasterworkName", "Fixed"))
    else:
        base_name = name.split(" ", 2)[-1] if len(name.split(" ")) >= 3 else name
        quality = it.get("MasterworkName", "")
    return {
        "id": it["ItemId"],
        "category": SLOT_TO_CATEGORY[it["Slot"]],
        "name": name,
        "baseName": base_name,
        "slot": it["Slot"],
        "displaySlot": it["WeaponType"] if it["Slot"] in ("Weapon", "Off-hand") else it["Slot"],
        "class": it["Class"],
        "classLock": it["ClassLock"],
        "starRank": it["StarRank"],
        "stars": it["Stars"],
        "starName": it["StarName"],
        "element": it.get("Element", ""),
        "gearLine": gear_line,
        "quality": quality,
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
        "iconUrl": placeholder_url(it["Slot"], it["Class"], it["StarRank"], gear_line),
        "armorLine": line.get("armor", "—"),
    }


def main() -> None:
    items = build_items() + build_water_items()
    catalog = [item_to_catalog_entry(it) for it in items]

    meta = {
        "stars": [{"rank": s[0], "name": s[1], "element": s[2], "zone": s[4]} for s in STAR_META],
        "waterStars": [
            {"rank": t[5], "level": t[1], "quality": t[2], "name": {2: "Reefstone", 4: "Depthite", 6: "Kelpforge", 8: "Leviathium", 9: "Thalassium"}[t[5]], "element": "Water", "zone": TIER_ZONE[t[5]][1]}
            for t in WATER_QUALITY_TIERS
        ],
        "waterQualities": [
            {"tier": t[0], "level": t[1], "quality": t[2], "rarity": t[3], "statSlots": stat_count(t[4])}
            for t in WATER_QUALITY_TIERS
        ],
        "gearLines": [
            {"id": "standard", "label": "Star metals"},
            {"id": "water", "label": "Aqua armor"},
        ],
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
