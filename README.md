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

For static pages only:

```bash
npx serve .
```

For the full site with login, edits, guides, and articles (API + database):

```bash
npm install
cp .env.example .env.local   # fill in Turso, JWT_SECRET, BLOB token
npm run db:init              # create tables (once)
npx vercel dev               # serves site + /api routes
```

### Backend environment variables (Vercel → Settings → Environment Variables)

| Variable | Purpose |
|----------|---------|
| `TURSO_DATABASE_URL` | Turso/libSQL database URL ([turso.tech](https://turso.tech)) |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `JWT_SECRET` | Random string for session tokens (min 16 chars) |
| `BLOB_READ_WRITE_TOKEN` | Added automatically when you connect a [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store to the project (Storage → Create → Blob). Required for guide/article image uploads. |

### What users can edit

- **Allowed:** wiki text (intros, champion overviews, lore), community ratings, guides & articles (text + uploaded images)
- **Locked:** champion portraits, artifact images, and all `battlerise-data.js` catalog data (synced from megalords.com only)

Admin account: sign up with username `admin` (first registration) for the review queue at `admin.html`.

## License

Not affiliated with Triumph Games or any game publishers.
