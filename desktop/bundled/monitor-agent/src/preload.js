const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("monitorAgent", {
  getState: () => ipcRenderer.invoke("agent:getState"),
  startMonitoring: (opts) => ipcRenderer.invoke("agent:startMonitoring", opts),
  stopMonitoring: () => ipcRenderer.invoke("agent:stopMonitoring"),
  startBreak: () => ipcRenderer.invoke("agent:startBreak"),
  endBreak: () => ipcRenderer.invoke("agent:endBreak"),
  pairDevice: (pairingCode) => ipcRenderer.invoke("agent:pairDevice", pairingCode),
  onStateUpdate: (cb) => {
    const listener = (_e, state) => cb(state);
    ipcRenderer.on("agent:state", listener);
    return () => ipcRenderer.removeListener("agent:state", listener);
  },
});
