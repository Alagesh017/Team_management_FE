import api from "../../core/interceptors/axiosInterceptor";

const WEB_USER_KEY = "monitor_web_user_id";
const PAIR_CODE_KEY = "monitor_pairing_code";
const PAIR_EXP_KEY = "monitor_pairing_expires";
const PROTOCOL_LOGOUT = "educermonitor://logout";
const DEFAULT_UNPAIR_PORT = 18765;

export function clearMonitorPairingSession() {
  sessionStorage.removeItem(PAIR_CODE_KEY);
  sessionStorage.removeItem(PAIR_EXP_KEY);
}

export function saveMonitorPairingSession(code, expiresAt) {
  if (code) sessionStorage.setItem(PAIR_CODE_KEY, code);
  if (expiresAt) sessionStorage.setItem(PAIR_EXP_KEY, expiresAt);
}

export function loadMonitorPairingSession() {
  return {
    pairingCode: sessionStorage.getItem(PAIR_CODE_KEY) || "",
    expiresAt: sessionStorage.getItem(PAIR_EXP_KEY) || "",
  };
}

function protocolUnpair() {
  [PROTOCOL_LOGOUT, "educermonitor://unpair"].forEach((url) => {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
      setTimeout(() => {
        if (iframe.parentNode) document.body.removeChild(iframe);
      }, 1500);
    } catch (_) {
      /* ignore */
    }
  });
}

/** Tell desktop agent to clear pairing immediately (local HTTP + custom URL). */
export function signalMonitorAgentUnpair() {
  const port =
    import.meta.env.VITE_MONITOR_UNPAIR_PORT || String(DEFAULT_UNPAIR_PORT);
  fetch(`http://127.0.0.1:${port}/unpair`, { method: "POST" }).catch(() => {
    /* agent not running */
  });
  protocolUnpair();
}

export async function revokeMonitorDevicesOnServer() {
  const { data } = await api.post("/monitor/devices/revoke-mine");
  return data;
}

async function forceFreshMonitorPairing() {
  clearMonitorPairingSession();
  try {
    await revokeMonitorDevicesOnServer();
  } catch (_) {
    /* token may already be gone on logout edge cases */
  }
  signalMonitorAgentUnpair();
}

/** After every successful login — user must pair the agent again. */
export async function handleMonitorSessionForUser(userId) {
  await forceFreshMonitorPairing();
  localStorage.setItem(WEB_USER_KEY, String(userId));
}

/** On logout — delete/revoke server pairing and clear agent before JWT is removed. */
export async function handleMonitorLogout() {
  await forceFreshMonitorPairing();
  localStorage.removeItem(WEB_USER_KEY);
}
