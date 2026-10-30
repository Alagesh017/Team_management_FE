const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("teamManagerDesktop", {
  isDesktop: true,
});

contextBridge.exposeInMainWorld("desktopAuth", {
  loadSession: () => ipcRenderer.invoke("desktop:loadAuthSession"),
  saveSession: (user) => ipcRenderer.invoke("desktop:saveAuthSession", user),
  clearSession: () => ipcRenderer.invoke("desktop:saveAuthSession", null),
});

contextBridge.exposeInMainWorld("monitorAgent", {
  getState: () => ipcRenderer.invoke("agent:getState"),
  startMonitoring: (opts) => ipcRenderer.invoke("agent:startMonitoring", opts),
  stopMonitoring: () => ipcRenderer.invoke("agent:stopMonitoring"),
  startBreak: () => ipcRenderer.invoke("agent:startBreak"),
  endBreak: () => ipcRenderer.invoke("agent:endBreak"),
  pairDevice: (pairingCode) => ipcRenderer.invoke("agent:pairDevice", pairingCode),
  unpairDevice: () => ipcRenderer.invoke("agent:unpairDevice"),
  onStateUpdate: (cb) => {
    const listener = (_e, state) => cb(state);
    ipcRenderer.on("agent:state", listener);
    return () => ipcRenderer.removeListener("agent:state", listener);
  },
});
