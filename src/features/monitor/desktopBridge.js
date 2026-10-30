/** True when running inside the Team Manager Electron shell (built-in monitor). */
export function isTeamManagerDesktop() {
  return typeof window !== "undefined" && Boolean(window.teamManagerDesktop?.isDesktop);
}

export function getMonitorAgentBridge() {
  if (typeof window === "undefined" || !window.monitorAgent) return null;
  return window.monitorAgent;
}
