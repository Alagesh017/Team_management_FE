const { app, ipcMain } = require("electron");

const log = {
  info: (...args) => console.log("[updater]", ...args),
  warn: (...args) => console.warn("[updater]", ...args),
  error: (...args) => console.error("[updater]", ...args),
};

/** @type {import("electron").BrowserWindow | null} */
let mainWindow = null;

/** @type {import("electron-updater").AppUpdater | null} */
let autoUpdater = null;

const state = {
  phase: "idle",
  currentVersion: app.getVersion(),
  availableVersion: null,
  percent: 0,
  transferred: 0,
  total: 0,
  message: null,
};

function broadcastState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("desktop:updater-state", { ...state });
  }
}

function setPhase(phase, patch = {}) {
  Object.assign(state, patch, { phase });
  broadcastState();
}

function getPublicState() {
  return { ...state };
}

function attachUpdaterEvents() {
  if (!autoUpdater) return;

  autoUpdater.on("checking-for-update", () => {
    setPhase("checking", { message: "Checking for updates…" });
  });

  autoUpdater.on("update-not-available", (info) => {
    setPhase("not-available", {
      availableVersion: info?.version ?? null,
      message: "You're on the latest version.",
    });
  });

  autoUpdater.on("update-available", (info) => {
    setPhase("available", {
      availableVersion: info.version,
      message: `Version ${info.version} is available.`,
      percent: 0,
      transferred: 0,
      total: 0,
    });
  });

  autoUpdater.on("error", (err) => {
    log.error(err);
    setPhase("error", {
      message: err?.message || String(err),
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    setPhase("downloading", {
      percent: progress.percent ?? 0,
      transferred: progress.transferred ?? 0,
      total: progress.total ?? 0,
      message: "Downloading update…",
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    setPhase("ready", {
      availableVersion: info.version,
      percent: 100,
      message: "Installing update…",
    });
    setTimeout(() => {
      try {
        autoUpdater.quitAndInstall(false, true);
      } catch (e) {
        log.error("quitAndInstall failed", e);
        setPhase("error", { message: e?.message || "Install failed" });
      }
    }, 800);
  });
}

function registerUpdaterIpc() {
  ipcMain.handle("desktop:updaterGetState", () => getPublicState());

  ipcMain.handle("desktop:updaterCheck", async () => {
    if (!app.isPackaged || !autoUpdater) {
      return getPublicState();
    }
    if (state.phase === "downloading" || state.phase === "ready") {
      return getPublicState();
    }
    try {
      await autoUpdater.checkForUpdates();
    } catch (e) {
      log.error("check failed", e);
      setPhase("error", { message: e?.message || "Update check failed" });
    }
    return getPublicState();
  });

  ipcMain.handle("desktop:updaterDownload", async () => {
    if (!app.isPackaged || !autoUpdater) {
      return getPublicState();
    }
    if (state.phase !== "available") {
      return getPublicState();
    }
    try {
      setPhase("downloading", {
        percent: 0,
        transferred: 0,
        total: 0,
        message: "Starting download…",
      });
      await autoUpdater.downloadUpdate();
    } catch (e) {
      log.error("download failed", e);
      setPhase("error", { message: e?.message || "Download failed" });
    }
    return getPublicState();
  });

  ipcMain.handle("desktop:updaterInstall", () => {
    if (!autoUpdater || state.phase !== "ready") {
      return getPublicState();
    }
    autoUpdater.quitAndInstall(false, true);
    return getPublicState();
  });
}

function setUpdaterWindow(win) {
  mainWindow = win;
  broadcastState();
}

/** Manual updates only — no background check or auto-download. */
function initAutoUpdater() {
  state.currentVersion = app.getVersion();
  registerUpdaterIpc();

  if (!app.isPackaged) {
    setPhase("idle", { message: null });
    return;
  }

  try {
    ({ autoUpdater } = require("electron-updater"));
  } catch (err) {
    log.error("electron-updater missing from installer", err);
    setPhase("error", { message: "Updater is not available in this build." });
    return;
  }

  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  attachUpdaterEvents();
  setPhase("idle", { message: null });
}

module.exports = { initAutoUpdater, setUpdaterWindow };
