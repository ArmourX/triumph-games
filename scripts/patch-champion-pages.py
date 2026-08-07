from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

for f in ROOT.glob("battlerise-champion-*.html"):
    t = f.read_text(encoding="utf-8")
    orig = t
    if "triumph-community.css" not in t:
        t = t.replace(
            '  <link rel="stylesheet" href="battlerise-champion.css">',
            '  <link rel="stylesheet" href="battlerise-champion.css">\n  <link rel="stylesheet" href="triumph-community.css">',
        )
    if "triumph-community.js" not in t:
        t = t.replace(
            '  <script src="js/battlerise-data.js"></script>',
            '  <script src="js/triumph-community.js"></script>\n  <script src="js/battlerise-data.js"></script>',
        )
    if 'id="tg-auth-bar"' not in t:
        t = t.replace(
            '<div id="br-ratings-grid"',
            '<div id="tg-auth-bar"></div><div id="br-ratings-grid"',
        )
    if t != orig:
        f.write_text(t, encoding="utf-8")
        print("patched", f.name)

print("done")
