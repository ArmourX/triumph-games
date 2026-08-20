# QRM — Monster Collect (Unity WebGL)

Browser build of the Unity game in `../unity/MonsterCollect/`, deployed to Vercel at **https://qrm-two.vercel.app**.

This is **not** a JavaScript reimplementation — the playable files come from Unity’s WebGL export (`index.html`, `Build/`, `TemplateData/`).

## Build locally

Requires Unity **6000.3.22f1** with the WebGL module installed.

1. Open `unity/MonsterCollect` in Unity.
2. Menu: **Monster Collect → Build WebGL for Vercel**
3. Output is written to this folder (`qrm/`).
4. Deploy:

```bash
cd qrm
npx vercel deploy --prod --yes
```

Or run from repo root:

```powershell
.\scripts\build-qrm-webgl.ps1
```

## CI (GitHub Actions)

Workflow `.github/workflows/qrm-webgl.yml` builds WebGL with [game-ci/unity-builder](https://game.ci/) and deploys to Vercel.

Required repository secrets:

| Secret | Purpose |
|--------|---------|
| `UNITY_LICENSE` | Unity activation file contents |
| `VERCEL_TOKEN` | Vercel deploy token |
| `VERCEL_ORG_ID` | From `qrm/.vercel/project.json` org |
| `VERCEL_PROJECT_ID` | From `qrm/.vercel/project.json` |

## Vercel project

- Root directory: `qrm`
- `vercel.json` sets correct MIME types and Brotli `Content-Encoding` for WebGL assets.
