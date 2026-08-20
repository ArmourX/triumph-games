"""Build js/elumia-item-icons.js manifest from assets/elumia/item-icons/*.png"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ICON_DIR = ROOT / "assets" / "elumia" / "item-icons"
OUT = ROOT / "js" / "elumia-item-icons.js"


def label_from_stem(stem: str) -> str:
    parts = stem.split("_", 1)
    slug = parts[1] if len(parts) > 1 else stem
    return re.sub(r"\s+", " ", slug.replace("_", " ")).strip().title()


def main():
    if not ICON_DIR.is_dir():
        print(f"Missing icon directory: {ICON_DIR}", file=sys.stderr)
        sys.exit(1)
    icons = []
    for path in sorted(ICON_DIR.glob("*.png")):
        stem = path.stem
        icons.append({
            "id": stem,
            "label": label_from_stem(stem),
            "url": f"/assets/elumia/item-icons/{path.name}",
        })
    OUT.write_text(
        "/* Auto-generated item icon manifest */\n"
        "window.ElumiaItemIcons = "
        + json.dumps(icons, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(icons)} icons to {OUT}")


if __name__ == "__main__":
    main()
