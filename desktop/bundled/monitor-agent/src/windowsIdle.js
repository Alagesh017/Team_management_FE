const { execFile } = require("child_process");
const path = require("path");

let cachedSec = 0;
let cachedAt = 0;
let refreshInFlight = false;
const CACHE_MS = 900;

function parseOutput(out) {
  const ms = parseInt(String(out).trim(), 10);
  if (Number.isNaN(ms) || ms < 0) return null;
  return Math.floor(ms / 1000);
}

function refreshWindowsIdleCache() {
  if (process.platform !== "win32" || refreshInFlight) return;
  refreshInFlight = true;
  const script = path.join(__dirname, "getIdleMs.ps1");
  execFile(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script],
    { encoding: "utf8", timeout: 8000, windowsHide: true },
    (err, stdout) => {
      refreshInFlight = false;
      if (err) return;
      const sec = parseOutput(stdout);
      if (sec !== null) {
        cachedSec = sec;
        cachedAt = Date.now();
      }
    }
  );
}

/** Windows fallback when Electron getSystemIdleTime() returns 0 incorrectly. Cached ~1s. */
function getWindowsIdleSeconds() {
  if (process.platform !== "win32") return null;
  const now = Date.now();
  if (now - cachedAt > CACHE_MS) {
    refreshWindowsIdleCache();
  }
  if (cachedAt === 0) {
    refreshWindowsIdleCache();
    return null;
  }
  return cachedSec;
}

module.exports = { getWindowsIdleSeconds, refreshWindowsIdleCache };
