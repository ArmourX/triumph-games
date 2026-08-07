# Triumph Guides

A static guide hub for Triumph Games titles — **Legends of Elumia**, **Battlerise**, and **ArmourX**.

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Main hub — games, features, community |
| `elumia.html` | Legends of Elumia wiki overview |
| `battlerise.html` | BattleRise wiki overview |
| `armourx.html` | ArmourX wiki overview |

Each game also has sub-pages:

- **Elumia:** `elumia-characters.html`, `elumia-classes.html`, `elumia-guides.html`, `elumia-tier-list.html`
- **Battlerise:** `battlerise-champions.html`, `battlerise-artifacts.html`, `battlerise-guides.html`, `battlerise-tier-list.html`, plus per-champion pages (`battlerise-champion-invictus.html`, etc.)

## BattleRise data

Champion and artifact data is synced from **megalords.com** (public API) with images extracted from **bundles.sourceofmana.com**:

```bash
python scripts/fetch-battlerise-images.py
```

This fetches `/api/character/` and `/api/gear/`, downloads Unity asset bundles (tutorial, portrait atlases, card art), extracts PNG sprites, and regenerates:

- `js/battlerise-data.js`
- `assets/battlerise/` — champion portraits and artifact images
- `battlerise-champion-*.html` — champion detail pages

Requires `UnityPy` and `attrs>=23.2.0`.
- **ArmourX:** `armourx-warriors.html`, `armourx-armor.html`, `armourx-guides.html`, `armourx-tier-list.html`

## Run locally

Open `index.html` in your browser, or:

```bash
npx serve .
```

## License

Not affiliated with Triumph Games or any game publishers.
