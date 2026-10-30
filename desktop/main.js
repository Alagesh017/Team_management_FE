const path = require("path");
const { BrowserWindow, ipcMain } = require("electron");
const { loadDesktopEnv } = require("./loadEnv");
const { getMonitorAgentSrcPath } = require("./paths");
const { resolveWebAppTarget } = require("./webAppTarget");
const { startBundledWebServer } = require("./bundledWebServer");
const {
  loadAuthSessionFile,
  saveAuthSessionFile,
  clearAuthSessionFile,
} = require("./authSessionFile");

loadDesktopEnv();

function registerDesktopAuthIpc() {
  ipcMain.handle("desktop:loadAuthSession", () => loadAuthSessionFile());
  ipcMain.handle("desktop:saveAuthSession", (_event, user) => {
    if (user && typeof user === "object") {
      saveAuthSessionFile(user);
    } else {
      clearAuthSessionFile();
    }
    return { ok: true };
  });
}

registerDesktopAuthIpc();

const { startMonitorHost, getState } = require(path.join(getMonitorAgentSrcPath(), "monitorHost"));

async function loadWebApp(win) {
  let target;
  try {
    target = await resolveWebAppTarget();
  } catch (e) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Team Manager</title>
<style>body{font-family:Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;color:#e2e8f0}
.box{max-width:480px;padding:2rem}code{background:#1e293b;padding:2px 6px;border-radius:4px}</style></head>
<body><div class="box"><h1>Web app not built</h1><p>${e.message}</p></div></body></html>`;
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    return;
  }

  if (target.mode === "bundle") {
    const url = await startBundledWebServer(target.webRoot);
    win.loadURL(url);
    return;
  }

  const remoteUrl = target.url;
  let attempts = 0;
  const maxAttempts = 90;

  const showWaitingPage = (message) => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Team Manager</title>
<style>body{font-family:Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;color:#e2e8f0}
.box{max-width:420px;padding:2rem;text-align:center}h1{font-size:1.25rem;margin:0 0 .75rem}p{color:#94a3b8;font-size:.9rem;line-height:1.5}</style></head>
<body><div class="box"><h1>Waiting for web app…</h1><p>${message}</p></div></body></html>`;
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  };

  const tryLoad = () => {
    attempts += 1;
    win.loadURL(remoteUrl).catch(() => {});
  };

  win.webContents.on("did-fail-load", (_event, errorCode, _desc, _url, isMainFrame) => {
    if (!isMainFrame) return;
    if (errorCode !== -102 && errorCode !== -105 && errorCode !== -106) return;
    if (attempts >= maxAttempts) {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Team Manager</title>
<style>body{font-family:Segoe UI,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;color:#e2e8f0}
.box{max-width:480px;padding:2rem}code{background:#1e293b;padding:2px 6px;border-radius:4px;font-size:.85rem}ol{text-align:left;color:#94a3b8;line-height:1.6}</style></head>
<body><div class="box"><h1>Could not connect</h1>
<p>Target: <code>${remoteUrl}</code></p>
<ol><li>Use bundled app: <code>npm run desktop:app</code></li>
<li>Or dev: <code>npm run desktop:dev</code></li></ol></div></body></html>`;
      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      return;
    }
    showWaitingPage(`Connecting to ${remoteUrl} (${attempts}/${maxAttempts})…`);
    setTimeout(tryLoad, 1000);
  });

  tryLoad();
}

function createTeamManagerWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    show: true,
    title: "Team Manager",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      partition: "persist:team-manager",
    },
  });

  loadWebApp(win);

  win.on("close", (e) => {
    if (getState().monitoring) {
      e.preventDefault();
      win.hide();
    }
  });

  return win;
}

startMonitorHost({
  createWindow: createTeamManagerWindow,
  trayTooltip: "Team Manager",
  requestSingleInstanceLock: true,
});
