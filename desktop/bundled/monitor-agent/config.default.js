const fs = require("fs");
const path = require("path");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
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
    process.env[key] = val;
  }
}

function envInt(key, fallback) {
  const v = process.env[key];
  if (v === undefined || v === "") return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

function envBool(key, fallback) {
  const v = process.env[key];
  if (v === undefined || v === "") return fallback;
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
}

function getConfig() {
  loadEnvFile();
  return {
    apiBaseUrl: process.env.MONITOR_API_URL || "http://127.0.0.1:5050/api/v1",
    heartbeatIntervalMs: envInt("MONITOR_HEARTBEAT_INTERVAL_MS", 45000),
    activityPollMs: envInt("MONITOR_ACTIVITY_POLL_MS", 1000),
    idleThresholdSeconds: envInt("MONITOR_IDLE_THRESHOLD_SECONDS", 300),
    localUnpairPort: envInt("MONITOR_LOCAL_UNPAIR_PORT", 18765),
    captureForegroundApps: envBool("MONITOR_CAPTURE_FOREGROUND_APPS", true),
    protocolScheme: process.env.MONITOR_PROTOCOL_SCHEME || "educermonitor",
  };
}

module.exports = { getConfig, loadEnvFile };
