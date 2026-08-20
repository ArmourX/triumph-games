"""Add polish + theme assets to all HTML pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

THEME_INIT = '  <script src="js/site-theme-init.js"></script>\n'
POLISH_CSS = '  <link rel="stylesheet" href="triumph-polish.css">\n'
THEMES_CSS = '  <link rel="stylesheet" href="triumph-themes.css">\n'
SITE_UI = '  <script src="js/site-ui.js"></script>\n'
SITE_THEME = '  <script src="js/site-theme.js"></script>\n'


def patch(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    changed = False

    if "site-theme-init.js" not in text:
        marker = '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        if marker in text:
            text = text.replace(marker, marker + THEME_INIT, 1)
            changed = True

    if "triumph-polish.css" not in text and "styles.css" in text:
        text = text.replace(
            '<link rel="stylesheet" href="styles.css">\n',
            '<link rel="stylesheet" href="styles.css">\n' + POLISH_CSS,
            1,
        )
        changed = True

    if "triumph-themes.css" not in text and "triumph-polish.css" in text:
        text = text.replace(
            '<link rel="stylesheet" href="triumph-polish.css">\n',
            '<link rel="stylesheet" href="triumph-polish.css">\n' + THEMES_CSS,
            1,
        )
        changed = True
    elif "triumph-themes.css" not in text and "styles.css" in text:
        text = text.replace(
            '<link rel="stylesheet" href="styles.css">\n',
            '<link rel="stylesheet" href="styles.css">\n' + THEMES_CSS,
            1,
        )
        changed = True

    if "site-ui.js" not in text:
        if "js/site-config.js" in text:
            text = text.replace(
                '<script src="js/site-config.js"></script>\n',
                '<script src="js/site-config.js"></script>\n' + SITE_UI,
                1,
            )
            changed = True

    if "site-theme.js" not in text:
        if "js/site-ui.js" in text:
            text = text.replace(
                '<script src="js/site-ui.js"></script>\n',
                '<script src="js/site-ui.js"></script>\n' + SITE_THEME,
                1,
            )
            changed = True
        elif "js/site-config.js" in text:
            text = text.replace(
                '<script src="js/site-config.js"></script>\n',
                '<script src="js/site-config.js"></script>\n' + SITE_THEME,
                1,
            )
            changed = True
        elif "</body>" in text:
            text = text.replace("</body>", SITE_THEME + "</body>", 1)
            changed = True

    if changed:
        path.write_text(text, encoding="utf-8")
    return changed


for html in sorted(ROOT.glob("*.html")):
    if patch(html):
        print("patched", html.name)

print("Done.")
