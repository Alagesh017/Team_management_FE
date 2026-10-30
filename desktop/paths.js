const path = require("path");
const fs = require("fs");
const { app } = require("electron");

function isPackagedApp() {
  try {
    return app.isPackaged;
  } catch (_) {
    return false;
  }
}

function getMonitorAgentRoot() {
  if (isPackagedApp()) {
    return path.join(process.resourcesPath, "monitor-agent");
  }
  return path.join(__dirname, "..", "..", "employee-monitor-agent");
}

function getMonitorAgentSrcPath() {
  return path.join(getMonitorAgentRoot(), "src");
}

/** Folder produced by `npm run build:desktop` (Vite outDir: dist-desktop). */
function getBundledWebRoot() {
  if (isPackagedApp()) {
    return path.join(process.resourcesPath, "web-app");
  }
  const desktopBuild = path.join(__dirname, "..", "dist-desktop");
  if (fs.existsSync(path.join(desktopBuild, "index.html"))) {
    return desktopBuild;
  }
  return null;
}

function hasBundledWebApp() {
  const root = getBundledWebRoot();
  return Boolean(root && fs.existsSync(path.join(root, "index.html")));
}

module.exports = {
  getMonitorAgentRoot,
  getMonitorAgentSrcPath,
  isPackagedApp,
  getBundledWebRoot,
  hasBundledWebApp,
};
