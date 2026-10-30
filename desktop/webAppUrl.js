/**
 * Dev server URL must include Vite `base` (/taskmanagement/).
 */
function normalizeWebAppUrl(raw) {
  const url = (raw || "").trim() || "http://127.0.0.1:5173/taskmanagement/";
  try {
    const u = new URL(url);
    const isLocal = u.hostname === "127.0.0.1" || u.hostname === "localhost";
    const path = u.pathname.replace(/\/+$/, "") || "";
    if (isLocal && (path === "" || path === "/")) {
      u.pathname = "/taskmanagement/";
      return u.toString();
    }
    if (isLocal && !path.startsWith("/taskmanagement")) {
      u.pathname = `/taskmanagement${path.startsWith("/") ? path : `/${path}`}`;
      if (!u.pathname.endsWith("/")) u.pathname += "/";
      return u.toString();
    }
    return u.toString();
  } catch (_) {
    return url;
  }
}

module.exports = { normalizeWebAppUrl };
