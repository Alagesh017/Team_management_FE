# Team Manager Desktop (Electron)

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

Output: `desktop/installer-output/TeamManager-Setup-1.0.0.exe`

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

  desktop/README.md
