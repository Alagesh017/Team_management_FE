import { isTeamManagerDesktop } from "../monitor/desktopBridge";

export function getDesktopUpdaterBridge() {
  if (!isTeamManagerDesktop()) return null;
  if (typeof window === "undefined" || !window.desktopUpdater) return null;
  return window.desktopUpdater;
}
