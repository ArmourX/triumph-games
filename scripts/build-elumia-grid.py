from pathlib import Path

src = Path(r"C:\Users\dynam\Documents\GitHub\CryptolandWarrior\Grid.html").read_text(encoding="utf-8")
root = Path(r"C:\Users\dynam\Documents\GitHub\triumph-games")

css_start = src.find("<style>") + 7
css_end = src.find("</style>")
css = src[css_start:css_end].strip()
css = css.split("@import", 1)[0].strip()
extra = """

.lattice-back{pointer-events:auto;font-family:var(--dispFont);font-size:11px;color:var(--accentBright);text-decoration:none;margin-right:10px;opacity:.85}
.lattice-back:hover{opacity:1;text-decoration:underline}
"""
(root / "elumia-lattice.css").write_text(css + extra, encoding="utf-8")

script_start = src.find("<script>") + 8
script_end = src.rfind("</script>")
(root / "js" / "elumia-lattice.js").write_text(src[script_start:script_end].strip() + "\n", encoding="utf-8")

body_start = src.find("<body>") + 6
body_end = src.find("<script>")
body = src[body_start:body_end].strip()
body = body.replace(
    '<div class="brand">LEGENDS OF ELUMIA<small>CONSTELLATION · SPHERE GRID</small></div>',
    '<a href="elumia.html" class="lattice-back">&larr; Wiki</a><div class="brand">LEGENDS OF ELUMIA<small>CONSTELLATION · SPHERE GRID</small></div>',
)

html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="js/site-theme-init.js"></script>
  <title>Sphere Grid | Legends of Elumia</title>
  <meta name="description" content="Interactive constellation sphere grid prototype for Legends of Elumia classes.">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="elumia-grid-gate.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Spectral:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="elumia-lattice.css">
</head>
<body class="elumia-grid-page">
  <div id="elumia-grid-gate" class="elg-gate">
    <div class="elg-gate-card">
      <p class="elg-gate-kicker">Legends of Elumia</p>
      <h1 class="elg-gate-title">Constellation grid</h1>
      <p class="elg-gate-copy">Enter the preview password to access the interactive sphere grid prototype.</p>
      <form id="elumia-grid-gate-form" class="elg-gate-form" autocomplete="off">
        <label class="elg-gate-label" for="elumia-grid-gate-password">Password</label>
        <input id="elumia-grid-gate-password" class="elg-gate-input" type="password" name="elumia-grid-key" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Enter password" required>
        <p id="elumia-grid-gate-error" class="elg-gate-error" aria-live="polite"></p>
        <button type="submit" class="btn btn-primary elg-gate-submit">Unlock</button>
      </form>
      <p class="elg-gate-foot"><a href="elumia.html">&larr; Back to Elumia wiki</a></p>
    </div>
  </div>

  <div id="elumia-grid-app" class="elumia-grid-app">
"""
html += body + """
  </div>
  <script src="js/elumia-grid-gate.js"></script>
</body>
</html>
"""
(root / "elumia-grid.html").write_text(html, encoding="utf-8")
print("ok", (root / "js" / "elumia-lattice.js").stat().st_size)
