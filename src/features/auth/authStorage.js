const USER_STORAGE_KEY = "user";
const LAST_PATH_KEY = "auth_last_path";

function desktopAuthApi() {
  if (typeof window === "undefined") return null;
  return window.desktopAuth || null;
}

export async function hydrateAuthFromDesktopDisk() {
  const api = desktopAuthApi();
  if (!api?.loadSession) return null;
  try {
    const fromDisk = await api.loadSession();
    if (!fromDisk || typeof fromDisk !== "object") return null;
    const { lastPath, ...user } = fromDisk;
    if (lastPath) {
      localStorage.setItem(LAST_PATH_KEY, lastPath);
    }
    if (user.userId || user.accessToken) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  } catch {
    return null;
  }
}

function mirrorToDesktopDisk(user) {
  const api = desktopAuthApi();
  if (!api?.saveSession) return;
  const lastPath = localStorage.getItem(LAST_PATH_KEY) || "";
  api.saveSession({ ...user, lastPath }).catch(() => {});
}

function clearDesktopDisk() {
  const api = desktopAuthApi();
  if (!api?.clearSession) return;
  api.clearSession().catch(() => {});
}

export function saveAuthLastPath(path) {
  if (!path || path === "/" || path.startsWith("/register")) return;
  localStorage.setItem(LAST_PATH_KEY, path);
  const user = loadStoredUser();
  if (user) mirrorToDesktopDisk(user);
}

export function getAuthLastPath() {
  const path = localStorage.getItem(LAST_PATH_KEY);
  if (path && path !== "/") return path;
  return "/dashboard";
}

export function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  mirrorToDesktopDisk(user);
}

export function clearStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(LAST_PATH_KEY);
  clearDesktopDisk();
}

export function updateStoredTokens(accessToken, refreshToken) {
  const user = loadStoredUser();
  if (!user) return null;
  const next = {
    ...user,
    accessToken,
    refreshToken: refreshToken ?? user.refreshToken,
  };
  saveStoredUser(next);
  return next;
}

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";
export const AUTH_TOKENS_REFRESHED_EVENT = "auth:tokens-refreshed";

export function notifyTokensRefreshed(user) {
  window.dispatchEvent(
    new CustomEvent(AUTH_TOKENS_REFRESHED_EVENT, { detail: user })
  );
}

export function notifySessionExpired() {
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

function isDefinitiveAuthFailure(error) {
  const status = error?.response?.status;
  const msg = String(error?.response?.data?.message || error?.message || "").toLowerCase();
  if (status === 401 || status === 403) {
    return (
      msg.includes("invalid refresh") ||
      msg.includes("refresh token") ||
      msg.includes("not found") ||
      msg.includes("expired") ||
      msg.includes("unauthorized")
    );
  }
  return false;
}

export { isDefinitiveAuthFailure };
