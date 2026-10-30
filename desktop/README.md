# Dce task manager (Desktop / Electron)

The **full React web app** is built into the installer (`dist-desktop` → bundled in the `.exe`).  
Monitoring still talks to your **API** (`MONITOR_API_URL` / `VITE_API_URL`). Users need network for login and data — only the UI runs locally.

## One-time setup

```bash
cd Task_management
npm install
npm run desktop:install
```

Edit **`desktop/.env.production`** before building the installer (`MONITOR_API_URL` must match production API).

Edit **`.env.desktop`** before building if API keys / URLs change (used by `npm run build:desktop`).

---

## Run as desktop app (bundled UI — what you want)

Build the web UI for desktop, then open Electron:

```bash
cd Task_management
npm run desktop:app
```

Uses `desktop/.env` → `WEB_APP_URL=embedded` (full app inside Electron).

---

## Build Windows installer (.exe)

Builds the web app **and** packages everything:

```bash
cd Task_management
npm run desktop:dist
```

Output: `desktop/installer-output/DceTaskManager-Setup-1.0.0.exe`

(Old builds used `desktop/release/` — you can delete that folder after quitting Team Manager.)

If **`installer-output`** is locked, the build automatically uses `installer-output-<timestamp>` instead.

Install on any PC — **no Vite, no browser tab**, full Team Manager UI + activity monitor.

---

## Dev with hot reload (optional)

```bash
npm run desktop:dev
```

Uses live Vite at `http://127.0.0.1:5173/taskmanagement/` (not the bundled build).

---

## Config

| File | Purpose |
|------|---------|
| `.env.desktop` | Vite env when running `build:desktop` |
| `desktop/.env` | `WEB_APP_URL=embedded` (default) or dev URL |
| `desktop/.env.production` | API settings baked into installer |

**Microsoft login:** redirect URI is still the hosted URL in `.env.desktop`. Google / email login work normally in the desktop shell.

## Tray

While monitoring, closing the window hides to the tray.

## Stay signed in

Login is saved in **persistent storage** (fixed local server port + Electron `persist:team-manager` partition).  
On startup the app **restores your session** and **refreshes tokens** automatically. You only see login again after **Logout** or when the refresh token expires (about 7 days without opening the app).

---

## Auto-update (GitHub Releases)

The packaged app checks **GitHub Releases** for a newer version (about 20s after launch, then every 12 hours). When an update is downloaded, you get a **Restart now** dialog.

Config lives in `desktop/package.json` → `build.publish` (currently `Alagesh017/Team_management_FE`). Change `owner` / `repo` if you use a different releases repo.

### Important: public releases

Clients download updates **without** a GitHub login. That only works reliably if the release assets are on a **public** repo (or a dedicated public repo that only holds installers).

Private repos block anonymous downloads — use a public releases repo if your main code repo is private.

### First time (one manual install)

Users who never had the app must install once from the `.exe`. After that, updates can arrive automatically.

Ship a build that includes `autoUpdater.js` (this repo), then publish **1.0.0** (or your current version).

### Publish a new version

1. Bump **`desktop/package.json` → `version`** (e.g. `1.0.0` → `1.0.1`).
2. Commit and push (optional but keeps tags sane).
3. Create a [GitHub personal access token](https://github.com/settings/tokens) with **`repo`** scope (classic) or **Contents: Read and write** on this repository (fine-grained).
4. In PowerShell (one-time per session):

   ```powershell
   cd d:\Task_management\Task_management
   $env:GH_TOKEN = "ghp_your_token_here"
   npm run desktop:publish
   ```

   This runs `build:desktop`, builds the NSIS installer, and uploads to GitHub:

   - Tag: `v1.0.1` (must match `version` with a `v` prefix)
   - Assets: `DceTaskManager-Setup-1.0.1.exe`, `latest.yml`, `.blockmap`

5. On GitHub → **Releases**, confirm the new release is **Published** (not draft).

### Local build only (no upload)

```bash
npm run desktop:dist
```

Upload the files from `installer-output/` to a GitHub Release manually if you prefer not to use `GH_TOKEN` on your machine.

### Verify

1. Install an older version from a release.
2. Publish a higher version.
3. Open the old app → wait ~20s → it should download and prompt to restart.

Updater logs go to the terminal if you launch from a shortcut with logging, or use DevTools only in dev — packaged apps log `[updater]` via `console` (view with `electron-log` later if needed).

### Code signing (recommended)

Unsigned builds may update but Windows SmartScreen can block installs. Sign the NSIS `.exe` in CI or locally (`CSC_LINK` / `CSC_KEY_PASSWORD`) before rolling out to many PCs.

  desktop/README.md
