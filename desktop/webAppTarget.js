const { normalizeWebAppUrl } = require("./webAppUrl");
const { isPackagedApp, getBundledWebRoot, hasBundledWebApp } = require("./paths");

/**
 * @returns {Promise<{ mode: 'bundle' } | { mode: 'remote', url: string }>}
 */
async function resolveWebAppTarget() {
  const fromEnv = (process.env.WEB_APP_URL || process.env.VITE_DEV_SERVER_URL || "").trim();
  const useBundle =
    fromEnv === "embedded" ||
    fromEnv === "bundle" ||
    fromEnv === "local" ||
    (isPackagedApp() && !fromEnv.startsWith("http"));

  if (useBundle) {
    const webRoot = getBundledWebRoot();
    if (!webRoot) {
      throw new Error(
        "Bundled web app missing. Run: npm run build:desktop (from Task_management folder), then try again."
      );
    }
    return { mode: "bundle", webRoot };
  }

  if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) {
    return { mode: "remote", url: normalizeWebAppUrl(fromEnv) };
  }

  if (hasBundledWebApp()) {
    return { mode: "bundle", webRoot: getBundledWebRoot() };
  }

  return { mode: "remote", url: normalizeWebAppUrl("http://127.0.0.1:5173") };
}

module.exports = { resolveWebAppTarget };
