const USER_STORAGE_KEY = "user";

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
    const existing = localStorage.getItem(USER_STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fromDisk));
    }
    return fromDisk;
  } catch {
    return null;
  }
}

function mirrorToDesktopDisk(user) {
  const api = desktopAuthApi();
  if (!api?.saveSession) return;
  api.saveSession(user).catch(() => {});
}

function clearDesktopDisk() {
  const api = desktopAuthApi();
  if (!api?.clearSession) return;
  api.clearSession().catch(() => {});
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
