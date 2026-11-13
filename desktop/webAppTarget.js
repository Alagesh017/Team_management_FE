const fs = require("fs");
const path = require("path");
const { normalizeWebAppUrl } = require("./webAppUrl");
const { isPackagedApp, getBundledWebRoot, hasBundledWebApp } = require("./paths");

function readDesktopEnvValue(key) {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return "";
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const k = trimmed.slice(0, eq).trim();
    if (k !== key) continue;
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    return val;
  }
  return "";
}

/**
 * @returns {Promise<{ mode: 'bundle', webRoot: string } | { mode: 'remote', url: string }>}
 */
async function resolveWebAppTarget() {
  const fileWebAppUrl = readDesktopEnvValue("WEB_APP_URL").trim();
  const fromEnv = (process.env.WEB_APP_URL || process.env.VITE_DEV_SERVER_URL || "").trim();

  // Packaged builds always load the bundled UI unless app-config explicitly sets an http(s) URL.
  const configuredUrl = isPackagedApp()
    ? fromEnv || fileWebAppUrl || "embedded"
    : fileWebAppUrl || fromEnv;

  const useBundle =
    configuredUrl === "embedded" ||
    configuredUrl === "bundle" ||
    configuredUrl === "local" ||
    (isPackagedApp() && !configuredUrl.startsWith("http"));

  if (useBundle) {
    const webRoot = getBundledWebRoot();
    if (!webRoot) {
      throw new Error(
        "Bundled web app missing. Run: npm run build:desktop (from Task_management folder), then try again."
      );
    }
    if (!isPackagedApp()) {
      console.log("[desktop] Loading bundled UI from:", webRoot);
    }
    return { mode: "bundle", webRoot };
  }

  if (configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")) {
    if (!isPackagedApp()) {
      console.warn("[desktop] Loading REMOTE web app (not your local build):", configuredUrl);
    }
    return { mode: "remote", url: normalizeWebAppUrl(configuredUrl) };
  }

  if (hasBundledWebApp()) {
    const webRoot = getBundledWebRoot();
    if (!isPackagedApp()) {
      console.log("[desktop] Fallback bundled UI from:", webRoot);
    }
    return { mode: "bundle", webRoot };
  }

  return { mode: "remote", url: normalizeWebAppUrl("http://127.0.0.1:5173") };
}

module.exports = { resolveWebAppTarget };
