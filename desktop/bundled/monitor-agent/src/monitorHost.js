const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  nativeImage,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");
const { getConfig } = require("../config.default");
const { ApiClient } = require("./apiClient");
const { ActivityTracker } = require("./activityTracker");
const { EventQueue } = require("./eventQueue");
const { startLocalUnpairServer } = require("./localUnpairServer");
const {
  loadDailyTotals,
  saveDailyTotals,
  ensureCurrentDay,
} = require("./dayTotals");

let mainWindow = null;
let tray = null;
let heartbeatTimer = null;
let activitySliceTimer = null;
let lastReportedActivityState = "unknown";
let heartbeatInFlight = false;
const tracker = new ActivityTracker();
const queue = new EventQueue();

const state = {
  connection: "disconnected",
  monitoring: false,
  onBreak: false,
  sessionId: null,
  lastHeartbeatAt: null,
  liveActivityState: "unknown",
  systemIdleSeconds: 0,
  secondsUntilIdle: 0,
  sessionActiveSeconds: 0,
  sessionIdleSeconds: 0,
  sessionBreakSeconds: 0,
  idleThresholdSeconds: getConfig().idleThresholdSeconds,
  policyText: "Metadata-only monitoring. No keystrokes or screen capture.",
  devicePaired: false,
  pairingRequired: false,
  pairedUserEmail: null,
  error: null,
};

function credentialsPath() {
  return path.join(app.getPath("userData"), "device-credentials.json");
}

function loadCredentials() {
  try {
    const raw = fs.readFileSync(credentialsPath(), "utf8");
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function saveCredentials(creds) {
  fs.writeFileSync(credentialsPath(), JSON.stringify(creds, null, 2));
}

function deleteCredentials() {
  try {
    if (fs.existsSync(credentialsPath())) {
      fs.unlinkSync(credentialsPath());
    }
  } catch (_) {
    /* ignore */
  }
}

function getCredentials() {
  return loadCredentials();
}

const api = new ApiClient(getCredentials);

let dailyTotalsStore = { localDate: "", active: 0, idle: 0, break: 0 };

function bootstrapDailyTotals() {
  dailyTotalsStore = loadDailyTotals();
  tracker.setSessionTotals(dailyTotalsStore);
}

function persistDailyTotalsFromTracker() {
  dailyTotalsStore.active = tracker.sessionTotals.active;
  dailyTotalsStore.idle = tracker.sessionTotals.idle;
  dailyTotalsStore.break = tracker.sessionTotals.break;
  saveDailyTotals(dailyTotalsStore);
}

function onActivityTickDayCheck() {
  if (ensureCurrentDay(dailyTotalsStore)) {
    tracker.setSessionTotals(dailyTotalsStore);
  }
}

function broadcastState() {
  state.sessionActiveSeconds = tracker.sessionTotals.active;
  state.sessionIdleSeconds = tracker.sessionTotals.idle;
  state.sessionBreakSeconds = tracker.sessionTotals.break;
  const payload = {
    ...state,
    devicePaired: Boolean(getCredentials()?.device_token),
    pairedUserEmail: getCredentials()?.user_email || state.pairedUserEmail,
    idleThresholdSeconds: getConfig().idleThresholdSeconds,
  };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("agent:state", payload);
  }
}

function defaultCreateAgentWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 640,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadFile(path.join(__dirname, "../renderer/index.html"));
  win.on("close", (e) => {
    if (state.monitoring) {
      e.preventDefault();
      win.hide();
    }
  });
  return win;
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function resolveTrayIcon(trayIconPath) {
  if (trayIconPath && fs.existsSync(trayIconPath)) {
    let icon = nativeImage.createFromPath(trayIconPath);
    if (process.platform === "win32" && !icon.isEmpty()) {
      icon = icon.resize({ width: 16, height: 16 });
    }
    if (!icon.isEmpty()) return icon;
  }
  return nativeImage.createFromPath(process.execPath);
}

function createTray(trayTooltip, trayIconPath) {
  tray = new Tray(resolveTrayIcon(trayIconPath));
  tray.setToolTip(trayTooltip);
  tray.on("double-click", showMainWindow);
  if (process.platform === "win32") {
    tray.on("click", showMainWindow);
  }
  refreshTrayMenu();
}

function refreshTrayMenu() {
  if (!tray) return;
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Show window", click: () => showMainWindow() },
      {
        label: state.monitoring ? "Stop monitoring" : "Start monitoring",
        click: () => (state.monitoring ? stopMonitoring() : startMonitoring({})),
      },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ])
  );
}

async function flushQueue(sessionId) {
  const pending = queue.drain();
  if (!pending.length) return;
  try {
    await api.postEvents(sessionId, pending);
    state.connection = "connected";
  } catch (e) {
    pending.forEach((p) => queue.push(p));
    state.connection = "reconnecting";
    state.error = e.message;
  }
}

function applyTrackerSnapshot(live) {
  state.liveActivityState = live.client_state;
  state.systemIdleSeconds = live.system_idle_seconds;
  state.secondsUntilIdle = live.seconds_until_idle;
  state.sessionActiveSeconds = live.session_active_seconds;
  state.sessionIdleSeconds = live.session_idle_seconds;
  state.sessionBreakSeconds = live.session_break_seconds;
  state.idleThresholdSeconds = live.idle_threshold_seconds;
}

function startActivitySliceTimer() {
  if (activitySliceTimer) clearInterval(activitySliceTimer);
  const pollMs = getConfig().activityPollMs || 1000;
  activitySliceTimer = setInterval(() => {
    if (!state.monitoring) return;
    onActivityTickDayCheck();
    tracker.accumulatePeriod();
    persistDailyTotalsFromTracker();
    const live = tracker.refreshLiveStatus();
    applyTrackerSnapshot(live);
    const st = live.client_state;
    if (st !== lastReportedActivityState && lastReportedActivityState !== "unknown") {
      sendHeartbeat();
    }
    lastReportedActivityState = st;
    broadcastState();
  }, pollMs);
}

function stopActivitySliceTimer() {
  if (activitySliceTimer) clearInterval(activitySliceTimer);
  activitySliceTimer = null;
}

async function sendHeartbeat() {
  if (!state.monitoring || !state.sessionId || heartbeatInFlight) return;
  heartbeatInFlight = true;
  const tick = tracker.consumePendingForHeartbeat();
  try {
    await api.heartbeat(state.sessionId, {
      active_seconds_delta: tick.active_seconds_delta,
      idle_seconds_delta: tick.idle_seconds_delta,
      break_seconds_delta: tick.break_seconds_delta,
      client_state: tick.client_state,
      system_idle_seconds: tick.system_idle_seconds,
    });
    applyTrackerSnapshot(tracker.refreshLiveStatus());
    state.connection = "connected";
    state.lastHeartbeatAt = new Date().toISOString();
    state.error = null;
    lastReportedActivityState = tick.client_state;
    await flushQueue(state.sessionId);
  } catch (e) {
    state.connection = "reconnecting";
    const msg = e.message || "";
    if (/401|403|not registered|revoked|invalid device/i.test(msg)) {
      heartbeatInFlight = false;
      await clearDevicePairing("This device was unpaired. Enter a new pairing code from the web app.");
      return;
    }
    state.error = msg;
    queue.push({
      event_uuid: randomUUID(),
      event_type: "heartbeat_failed",
      occurred_at: new Date().toISOString(),
      metadata: { message: e.message },
    });
  } finally {
    heartbeatInFlight = false;
  }
  broadcastState();
}

async function startMonitoring(opts = {}) {
  const creds = getCredentials();
  if (!creds?.device_token) {
    state.error = "Pair device first using a code from the web app.";
    broadcastState();
    return { ok: false };
  }
  try {
    const data = await api.startSession(opts.taskId);
    state.sessionId = data.session.id;
    state.monitoring = true;
    state.connection = "connected";
    tracker.onBreak = false;
    bootstrapDailyTotals();
    onActivityTickDayCheck();
    lastReportedActivityState = "unknown";
    try {
      require("./windowsIdle").refreshWindowsIdleCache();
    } catch (_) {
      /* optional */
    }
    state.onBreak = false;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(sendHeartbeat, getConfig().heartbeatIntervalMs);
    startActivitySliceTimer();
    await sendHeartbeat();
    refreshTrayMenu();
    broadcastState();
    return { ok: true };
  } catch (e) {
    state.error = e.message;
    broadcastState();
    return { ok: false, error: e.message };
  }
}

async function clearDevicePairing(userMessage) {
  if (state.monitoring) {
    await stopMonitoring();
  } else {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    stopActivitySliceTimer();
  }
  deleteCredentials();
  state.devicePaired = false;
  state.pairingRequired = true;
  state.pairedUserEmail = null;
  state.error =
    userMessage || "Sign in on the web app, generate a pairing code, and enter it here.";
  refreshTrayMenu();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
  }
  broadcastState();
}

async function stopMonitoring() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
  stopActivitySliceTimer();
  if (state.sessionId) {
    try {
      await api.endSession(state.sessionId);
    } catch (_) {
      /* best effort */
    }
  }
  state.monitoring = false;
  state.sessionId = null;
  lastReportedActivityState = "unknown";
  state.connection = "disconnected";
  refreshTrayMenu();
  broadcastState();
}

function handleProtocolUrl(url) {
  try {
    const u = new URL(url);
    const host = (u.hostname || "").toLowerCase();
    const pathAction = u.pathname.replace(/^\//, "").toLowerCase();
    const action = host || pathAction;
    if (action === "logout" || action === "unpair" || action === "pair-again") {
      clearDevicePairing("Logged out on the web. Generate a new pairing code and enter it here.");
      return;
    }
    if (action === "start") {
      mainWindow?.show();
      broadcastState();
    }
  } catch (_) {
    /* ignore malformed */
  }
}

function registerIpcHandlers() {
  ipcMain.handle("agent:getState", () => ({
    ...state,
    devicePaired: Boolean(getCredentials()?.device_token),
    deviceUuid: getCredentials()?.device_uuid || randomUUID(),
    idleThresholdSeconds: getConfig().idleThresholdSeconds,
    apiBaseUrl: getConfig().apiBaseUrl,
  }));

  ipcMain.handle("agent:unpairDevice", async () => {
    await clearDevicePairing("Pair again with a new code from Activity Monitor in the web app.");
    return { ok: true };
  });

  ipcMain.handle("agent:pairDevice", async (_e, pairingCode) => {
    const normalized = String(pairingCode || "")
      .trim()
      .replace(/[\s-]/g, "")
      .toUpperCase();
    if (!/^[A-F0-9]{6}$/.test(normalized)) {
      const msg =
        "Enter the 6-character code from Activity Monitor (web app → Generate pairing code).";
      state.error = msg;
      broadcastState();
      throw new Error(msg);
    }
    try {
      const device_uuid = getCredentials()?.device_uuid || randomUUID();
      const data = await api.registerDevice({
        pairing_code: normalized,
        device_uuid,
        device_name: require("os").hostname(),
        operating_system: `Windows ${require("os").release()}`,
        agent_version: app.getVersion(),
      });
      saveCredentials({
        device_uuid: data.device_uuid,
        device_token: data.device_token,
        device_id: data.device_id,
        user_id: data.user?.user_id,
        user_email: data.user?.email,
      });
      state.devicePaired = true;
      state.pairingRequired = false;
      state.pairedUserEmail = data.user?.email || null;
      state.error = null;
      broadcastState();
      return { ok: true };
    } catch (e) {
      const base = getConfig().apiBaseUrl;
      let msg = e.message || "Pairing failed";
      if (msg.includes("not found") || msg.includes("Pairing code")) {
        msg += ` Agent API: ${base}. It must match VITE_API_URL in the web app (Task_management/.env).`;
      }
      if (e.message?.includes("fetch failed")) {
        msg = `Cannot reach API at ${base}. Check MONITOR_API_URL in employee-monitor-agent/.env and your network.`;
      }
      state.error = msg;
      broadcastState();
      throw new Error(msg);
    }
  });

  ipcMain.handle("agent:startMonitoring", (_e, opts) => startMonitoring(opts || {}));
  ipcMain.handle("agent:stopMonitoring", () => stopMonitoring());
  ipcMain.handle("agent:startBreak", async () => {
    tracker.onBreak = true;
    state.onBreak = true;
    if (state.sessionId) await api.breakStart(state.sessionId);
    broadcastState();
  });
  ipcMain.handle("agent:endBreak", async () => {
    tracker.onBreak = false;
    state.onBreak = false;
    if (state.sessionId) await api.breakEnd(state.sessionId);
    broadcastState();
  });
}

/**
 * @param {object} options
 * @param {() => import('electron').BrowserWindow} options.createWindow
 * @param {string} [options.trayTooltip]
 * @param {boolean} [options.requestSingleInstanceLock=true]
 */
function startMonitorHost(options = {}) {
  const createWindow = options.createWindow || defaultCreateAgentWindow;
  const trayTooltip = options.trayTooltip || "Employee Monitor Agent";
  const trayIconPath = options.trayIconPath || null;
  const onBeforeFirstWindow = options.onBeforeFirstWindow || null;
  const useSingleInstanceLock = options.requestSingleInstanceLock !== false;

  const runApp = () => {
    app.on("second-instance", (_e, argv) => {
      const protocolArg = argv.find((a) => a.startsWith(`${getConfig().protocolScheme}://`));
      if (protocolArg) handleProtocolUrl(protocolArg);
      showMainWindow();
    });

    app.whenReady().then(async () => {
      if (typeof onBeforeFirstWindow === "function") {
        await onBeforeFirstWindow();
      }
      bootstrapDailyTotals();
      broadcastState();
      setInterval(() => {
        if (onActivityTickDayCheck()) {
          tracker.setSessionTotals(dailyTotalsStore);
        }
        broadcastState();
      }, 60000);
      tracker.bindPowerEvents();
      mainWindow = createWindow();
      createTray(trayTooltip, trayIconPath);
      showMainWindow();
      state.devicePaired = Boolean(getCredentials()?.device_token);
      state.pairedUserEmail = getCredentials()?.user_email || null;
      state.pairingRequired = !state.devicePaired;
      broadcastState();

      app.setAsDefaultProtocolClient(getConfig().protocolScheme);

      startLocalUnpairServer(getConfig().localUnpairPort, (msg) => clearDevicePairing(msg));

      registerIpcHandlers();
    }).catch((err) => {
      console.error("[monitorHost] startup failed:", err);
      state.error = err?.message || String(err);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
      }
    });

    app.on("open-url", (event, url) => {
      event.preventDefault();
      handleProtocolUrl(url);
    });

    app.on("window-all-closed", () => {
      if (!state.monitoring) app.quit();
    });
  };

  if (useSingleInstanceLock) {
    const gotLock = app.requestSingleInstanceLock();
    if (!gotLock) {
      app.quit();
      return;
    }
  }

  runApp();
}

module.exports = {
  startMonitorHost,
  startMonitoring,
  stopMonitoring,
  clearDevicePairing,
  getState: () => state,
};
