const { app, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");

const log = {
  info: (...args) => console.log("[updater]", ...args),
  warn: (...args) => console.warn("[updater]", ...args),
  error: (...args) => console.error("[updater]", ...args),
};

/** GitHub Releases auto-update (electron-builder publish provider). */
function initAutoUpdater() {
  if (!app.isPackaged) {
    return;
  }

  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on("checking-for-update", () => {
    log.info("[updater] Checking for updates…");
  });

  autoUpdater.on("update-available", (info) => {
    log.info("[updater] Update available:", info.version);
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("[updater] Up to date:", info.version);
  });

  autoUpdater.on("error", (err) => {
    log.error("[updater]", err);
  });

  autoUpdater.on("download-progress", (progress) => {
    log.info(
      `[updater] Download ${Math.round(progress.percent)}% (${progress.transferred}/${progress.total})`
    );
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info("[updater] Downloaded:", info.version);
    dialog
      .showMessageBox({
        type: "info",
        title: "Update ready",
        message: `Dce task manager ${info.version} has been downloaded.`,
        detail: "Restart the app to install the update.",
        buttons: ["Restart now", "Later"],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      })
      .catch((e) => log.error("[updater] dialog failed", e));
  });

  const check = () => {
    autoUpdater.checkForUpdates().catch((e) => log.error("[updater] check failed", e));
  };

  app.whenReady().then(() => {
    setTimeout(check, 20_000);
    setInterval(check, 12 * 60 * 60 * 1000);
  });
}

module.exports = { initAutoUpdater };
