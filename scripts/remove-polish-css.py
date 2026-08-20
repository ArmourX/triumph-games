"""Remove deprecated polish/theme CSS from HTML pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REMOVE = [
    '  <link rel="stylesheet" href="triumph-polish.css">\n',
    '  <link rel="stylesheet" href="triumph-themes.css">\n',
]

for path in ROOT.glob("*.html"):
    text = path.read_text(encoding="utf-8")
    orig = text
    for chunk in REMOVE:
        text = text.replace(chunk, "")
    if text != orig:
        path.write_text(text, encoding="utf-8")
        print("cleaned", path.name)

print("Done.")
