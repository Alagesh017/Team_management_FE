const fs = require("fs");
const path = require("path");
const { getMonitorAgentRoot, isPackagedApp } = require("./paths");

function parseEnvFile(filePath, override = false) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (override || process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = val;
    }
  }
}

/** Load desktop, web, and agent env so MONITOR_API_URL matches VITE_API_URL. */
function loadDesktopEnv() {
  const desktopDir = __dirname;

  if (isPackagedApp()) {
    parseEnvFile(path.join(process.resourcesPath, "app-config.env"), true);
    parseEnvFile(path.join(getMonitorAgentRoot(), ".env"), true);
    return;
  }

  const webRoot = path.join(desktopDir, "..");
  parseEnvFile(path.join(webRoot, ".env"));
  parseEnvFile(path.join(webRoot, ".env.local"));
  parseEnvFile(path.join(desktopDir, ".env"));
  parseEnvFile(path.join(getMonitorAgentRoot(), ".env"));

  if (!process.env.MONITOR_API_URL && process.env.VITE_API_URL) {
    process.env.MONITOR_API_URL = process.env.VITE_API_URL;
  }
}

module.exports = { loadDesktopEnv };
