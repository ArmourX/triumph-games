# Monster Collect

Unity 6 mobile monster-collecting game built around QR scanning, ranch management, battles, breeding, and sharing.

## Core loop

**Scan → Raise → Battle → Breed → Share**

1. **Scan** — Capture deterministic wild monsters from any QR code, or import an exact shared copy from a friend's QR.
2. **Raise** — Feed, rest, and train your active monster on the Ranch.
3. **Battle** — Turn-based fights that grant EXP, essence, and permanent stat growth.
4. **Breed** — Fuse two owned monsters into a deterministic offspring.
5. **Share** — Generate a QR from any owned monster so friends receive an exact copy.

## Requirements

- Unity **6000.3.x** (Unity 6 LTS)
- Android SDK and/or Xcode for device builds
- Physical device with camera (WebCamTexture is unreliable in emulators)

## Quick start

1. Open `unity/MonsterCollect` in Unity Hub.
2. Run **Monster Collect → Prepare Mobile Build** (URP, landscape, all scenes, build list).
3. Run **Monster Collect → Content Pipeline Window → Generate ALL Default Catalogs** (first-time setup).
4. Open **QRScanScene** and press Play, or build to Android/iOS.

Individual setup menus remain available under **Monster Collect →** if you only need to rebuild one scene.

## Architecture

```
Assets/Scripts/
  Core/           GameBootstrap, GameSettings, analytics, remote config
  QR/             QRScanner, QRResultExtractor, QRCodeGenerator, camera permissions
  Sharing/        MonsterShareCodec — exact monster snapshot encode/decode
  Monster/        MonsterData, Generator, Breeding, Raising, SpeciesCatalog, GameContentRegistry
  Appearance/     Part variants, procedural silhouette resolver
  Data/           MonsterCollectionService (JSON save), ScanLimitService, RanchEnergyService
  Battle/         Turn-based combat, move catalog, species move sets
  Ranch/          Items, inventory, errantry, facilities, customization
  Progression/    Quests, trainer ranks, shop, Monster Book rewards
  Social/         LAN multiplayer, trades, matchmaking stubs, anti-cheat
  UI/             Scene controllers, panels, navigation
  Editor/         Scene builders, content pipeline window, catalog generators
```

### Scenes

| Scene | Purpose |
|-------|---------|
| `QRScanScene` | Camera scan + capture popup |
| `RanchScene` | Collection grid, raising, breeding, share/release |
| `DexScene` | 300-entry catalog (locked/unlocked) |
| `BattleScene` | Setup, HUD, results |

Navigation uses `SceneNavigationBar` with landscape canvas scaling (1920×1080 reference).

## Content pipeline

All major systems are **data-driven** via ScriptableObjects under `Assets/Resources/`:

| Content | Catalog asset | Individual assets | Generator menu |
|---------|---------------|-------------------|----------------|
| Body parts | `MonsterAppearance/MonsterPartCatalog` | `Part Variant` SOs | Generate Default Part Catalog |
| Battle moves | `Battle/BattleMoveCatalog` | `Battle Move` SOs | Generate Default Battle Move Catalog |
| Ranch items | `Ranch/RanchItemCatalog` | `Ranch Item` SOs | Generate Default Ranch Content Catalogs |
| Facilities / errantry / deco | `Ranch/*Catalog` | respective SOs | Generate Default Ranch Content Catalogs |
| Quests / ranks / shop | `Progression/*Catalog` | `Quest`, `Shop Offer`, etc. | Generate Default Progression Catalogs |
| Species & breeding | `Monster/SpeciesCatalog` | `Species Definition` SOs | Generate Default Species Catalogs |
| Live ops tunables | `Config/remote_config.json` | — | edit JSON directly |

### Authoring workflow

1. Open **Monster Collect → Content Pipeline Window**.
2. Use **Generate ALL Default Catalogs** on a fresh clone, or generate one domain at a time.
3. Edit assets via **Assets → Create → Monster Collect/…** or the window's **Create New …** buttons.
4. Click **Validate All Content References** to catch broken item/move IDs in quests and shop.
5. Play — registries load `Resources.Load` first, then fall back to runtime factories if assets are missing.

### Remote config (offline-first)

`Assets/Resources/Config/remote_config.json` controls:

- Rarity roll thresholds (Legendary/Epic/Rare/Uncommon weights)
- Battle reward and energy cost multipliers
- Daily scan limit
- Limited-time events (`activeEvents` array with UTC start/end)

At runtime, `{persistentDataPath}/remote_config_override.json` merges on top (for future CDN downloads via `RemoteConfigService.TryApplyDownloadedJson`).

### Analytics

`GameAnalyticsService` logs events to the console in development (`DebugLogAnalyticsSink`). Register additional sinks for production SDKs.

Tracked events: `scan_success`, `scan_failed`, `battle_start`, `battle_end`, `breeding_complete`, `quest_completed`, `quest_claimed`, `monster_captured`.

Hook point for custom SDKs: implement `IAnalyticsSink` and call `GameAnalyticsService.RegisterSink(...)`.

### Persistence

- Save file: `{persistentDataPath}/monster_ranch.json`
- Ranch cap: **20** monsters
- Daily scan soft limit: **15** (`ScanLimitService`)
- Breeding: **2/day**, 30-minute cooldown, **50 essence** cost
- Battle wins grant **+15 essence**

### QR payload types

| Prefix | Behavior |
|--------|----------|
| Plain text / URL | Deterministic wild monster from hash |
| `MONSTER:CODE` | Normalized capture code |
| `MONSTER:SHARE:{base64}` | Exact monster copy (stats/colors/affinities); raising reset |

Share copies use deterministic import hashes — each player can import a given share QR once.

### Feedback

- **GameFeedbackService** — procedural placeholder tones (no audio assets required)
- **UiCelebrationEffect** — lightweight particle bursts on birth/breed/battle
- Toggle SFX/particles in **Settings** (nav bar → Set)

## Mobile build notes

### Android

- IL2CPP, min SDK 25
- `CAMERA` permission in `Assets/Plugins/Android/AndroidManifest.xml`
- Landscape locked in Player Settings + runtime enforcer
- Safe-area layout for notched devices

### iOS

- Camera usage string injected at build (`IOSCameraUsagePostprocessor`)
- Landscape orientation enforced at runtime

### Performance

- QR decode runs on thread pool; tune interval in Settings (0.3–0.6 s)
- `decodeDownscale = 2` default on scanner
- Procedural monster textures generated per view (no sprite atlas yet)

## Soft launch checklist

1. **Monster Collect → Prepare Release Build** (icons, splash color, SDK, crash API)
2. **Monster Collect → Prepare Mobile Build** (URP, landscape, scenes)
3. **Content Pipeline Window → Generate ALL + Validate**
4. Test on physical Android/iOS device (camera required)
5. See [PLAY.md](PLAY.md) for player-facing how-to

### Release polish features

- First-run **tutorial** (auto-shows on Scan scene; replay in Settings)
- **Accessibility**: text scale, colorblind element symbols, reduced motion
- **Audio**: procedural SFX + ambient music placeholders (toggle in Settings)
- **Haptics** on mobile (Android/iOS vibrate)
- **Analytics** logged to `{persistentDataPath}/analytics_log.jsonl`
- **Crash reports** appended to `{persistentDataPath}/crash_log.txt`
- **Credits** screen in Settings

## Editor menus

| Menu item | Action |
|-----------|--------|
| **Content Pipeline Window** | Hub for generating catalogs, creating assets, validating IDs |
| **Prepare Release Build** | Version, icons, splash, crash API, Android SDK 34 |
| Generate Default Part / Move / Ranch / Progression / Species Catalogs | Per-domain content bootstrap |
| Prepare Mobile Build | Full ship checklist |
| Setup All Scenes | Rebuild all four scenes + landscape + build list |
| Configure URP (Mobile) | URP pipeline + IL2CPP |
| Configure Landscape (Mobile) | Orientation + canvas patch |

## ZXing.Net

Bundled at `Assets/Plugins/ZXing.Net/zxing.dll` — Apache License 2.0.

## License

Game code: Triumph Games. Third-party libraries retain their respective licenses.
