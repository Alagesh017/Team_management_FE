import { isTeamManagerDesktop } from "../monitor/desktopBridge";

export function canClearDesktopAppData() {
  return (
    isTeamManagerDesktop() &&
    typeof window.teamManagerDesktop?.clearAppData === "function"
  );
}

export async function clearDesktopAppData() {
  if (!canClearDesktopAppData()) {
    return { ok: false, error: "Not available outside the desktop app" };
  }
  return window.teamManagerDesktop.clearAppData();
}
