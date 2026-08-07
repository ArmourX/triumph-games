"""Patch Triumph Guides HTML pages with community scripts and editable sections."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS_TAG = '  <link rel="stylesheet" href="triumph-community.css">\n'
JS_TAGS = '  <script src="js/triumph-community.js"></script>\n  <script src="js/triumph-edits.js"></script>\n'

HUB_EDITS = {
    "battlerise.html": ("battlerise", "overview", "BattleRise Wiki", "intro"),
    "elumia.html": ("elumia", "overview", "Legends of Elumia Wiki", "intro"),
    "armourx.html": ("armourx", "overview", "ArmourX Wiki", "intro"),
}


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    if "triumph-community.css" not in text and "</head>" in text:
        text = text.replace("</head>", CSS_TAG + "</head>", 1)

    if "triumph-community.js" not in text and "</body>" in text:
        text = text.replace("</body>", JS_TAGS + "</body>", 1)
    elif "triumph-edits.js" not in text and "triumph-community.js" in text:
        text = text.replace(
            '  <script src="js/triumph-community.js"></script>\n',
            JS_TAGS,
            1,
        )

    name = path.name
    if name in HUB_EDITS:
        game, page_id, title, field = HUB_EDITS[name]
        if "data-editable" not in text and 'class="container hub-desc"' in text:
            text = text.replace(
                '<section class="container hub-desc">\n      <p>',
                (
                    f'<section class="container hub-desc">\n'
                    f'      <div data-editable data-edit-game="{game}" data-edit-page="{page_id}" '
                    f'data-edit-field="{field}" data-edit-title="{title}" data-edit-label="Overview intro">\n'
                    f"      <p>"
                ),
                1,
            )
            text = text.replace(
                "</section>\n\n    <div class=\"container hub-layout\">",
                "      </div>\n    </section>\n\n    <div class=\"container hub-layout\">",
                1,
            )

    if name == "battlerise-artifacts.html":
        if "triumph-community.css" not in original:
            pass  # already added above
        if "battlerise-champion.css" not in text:
            text = text.replace(
                '  <link rel="stylesheet" href="hub.css">\n',
                '  <link rel="stylesheet" href="hub.css">\n  <link rel="stylesheet" href="battlerise-champion.css">\n',
                1,
            )

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main():
    html_files = list(ROOT.glob("*.html"))
    changed = 0
    for path in html_files:
        if patch_file(path):
            print("patched", path.name)
            changed += 1
    print(f"Done: {changed} files updated")


if __name__ == "__main__":
    main()
