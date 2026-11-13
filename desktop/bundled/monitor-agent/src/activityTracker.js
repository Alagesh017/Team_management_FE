const { powerMonitor } = require("electron");
const { getConfig } = require("../config.default");
const { getWindowsIdleSeconds } = require("./windowsIdle");

class ActivityTracker {
  constructor() {
    this.lastTickAt = Date.now();
    this.lastState = "unknown";
    this.onBreak = false;
    this.isLocked = false;
    this.pending = { active: 0, idle: 0, break: 0 };
    this.sessionTotals = { active: 0, idle: 0, break: 0 };
    this.currentClientState = "unknown";
    this.lastSystemIdleSeconds = 0;
  }

  setSessionTotals(store = {}) {
    this.sessionTotals = {
      active: Math.max(0, Number(store.active) || 0),
      idle: Math.max(0, Number(store.idle) || 0),
      break: Math.max(0, Number(store.break) || 0),
    };
    this.pending = { active: 0, idle: 0, break: 0 };
    this.lastTickAt = Date.now();
  }

  refreshLiveStatus() {
    const idleThresholdSeconds = getConfig().idleThresholdSeconds;
    const idleSec = this.getSystemIdleSecondsAccurate();
    const clientState = this.resolveClientState(idleThresholdSeconds);
    this.currentClientState = clientState;
    this.lastState = clientState;
    const secondsUntilIdle = Math.max(0, idleThresholdSeconds - idleSec);
    return {
      client_state: clientState,
      system_idle_seconds: idleSec,
      seconds_until_idle: secondsUntilIdle,
      session_active_seconds: this.sessionTotals.active,
      session_idle_seconds: this.sessionTotals.idle,
      session_break_seconds: this.sessionTotals.break,
      idle_threshold_seconds: idleThresholdSeconds,
    };
  }

  bindPowerEvents() {
    powerMonitor.on("lock-screen", () => {
      this.isLocked = true;
    });
    powerMonitor.on("unlock-screen", () => {
      this.isLocked = false;
    });
    powerMonitor.on("suspend", () => {
      this.lastState = "offline";
      this.currentClientState = "offline";
    });
    powerMonitor.on("resume", () => {
      this.lastState = "unknown";
    });
  }

  getSystemIdleSecondsAccurate() {
    let idleSec = 0;
    try {
      idleSec = Math.max(0, Math.floor(powerMonitor.getSystemIdleTime() || 0));
    } catch (_) {
      idleSec = 0;
    }
    if (idleSec === 0 && process.platform === "win32") {
      const win = getWindowsIdleSeconds();
      if (win !== null && win > 0) idleSec = win;
    }
    this.lastSystemIdleSeconds = idleSec;
    return idleSec;
  }

  resolveClientState(idleThresholdSeconds) {
    if (this.lastState === "offline") return "offline";
    if (this.onBreak) return "break";
    if (this.isLocked) return "locked";

    try {
      if (typeof powerMonitor.getSystemIdleState === "function") {
        const st = powerMonitor.getSystemIdleState(idleThresholdSeconds);
        if (st === "idle" || st === "active" || st === "locked") {
          if (st === "locked") this.isLocked = true;
          return st;
        }
      }
    } catch (_) {
      /* fall through */
    }

    const idleSec = this.getSystemIdleSecondsAccurate();
    return idleSec >= idleThresholdSeconds ? "idle" : "active";
  }

  /** Accumulate seconds since last slice (call every ~10s while monitoring). */
  accumulatePeriod() {
    const now = Date.now();
    const elapsedSec = Math.max(0, Math.floor((now - this.lastTickAt) / 1000));
    if (elapsedSec === 0) return null;
    this.lastTickAt = now;

    const threshold = getConfig().idleThresholdSeconds;
    const clientState = this.resolveClientState(threshold);
    this.currentClientState = clientState;
    this.lastState = clientState;

    let activeDelta = 0;
    let idleDelta = 0;
    let breakDelta = 0;

    if (clientState === "offline") {
      /* no tracked time while suspended */
    } else if (clientState === "break") {
      breakDelta = elapsedSec;
    } else if (clientState === "locked" || clientState === "idle") {
      idleDelta = elapsedSec;
    } else {
      activeDelta = elapsedSec;
    }

    this.pending.active += activeDelta;
    this.pending.idle += idleDelta;
    this.pending.break += breakDelta;
    this.sessionTotals.active += activeDelta;
    this.sessionTotals.idle += idleDelta;
    this.sessionTotals.break += breakDelta;

    return {
      active_seconds_delta: activeDelta,
      idle_seconds_delta: idleDelta,
      break_seconds_delta: breakDelta,
      client_state: clientState,
      system_idle_seconds: this.lastSystemIdleSeconds,
      elapsedSec,
    };
  }

  consumePendingForHeartbeat() {
    this.accumulatePeriod();
    const payload = {
      active_seconds_delta: this.pending.active,
      idle_seconds_delta: this.pending.idle,
      break_seconds_delta: this.pending.break,
      client_state: this.currentClientState,
      system_idle_seconds: this.lastSystemIdleSeconds,
    };
    this.pending = { active: 0, idle: 0, break: 0 };
    return payload;
  }

  /** @deprecated use accumulatePeriod + consumePendingForHeartbeat */
  tick() {
    const slice = this.accumulatePeriod();
    if (!slice) {
      return {
        active_seconds_delta: 0,
        idle_seconds_delta: 0,
        break_seconds_delta: 0,
        client_state: this.currentClientState,
      };
    }
    return slice;
  }
}

module.exports = { ActivityTracker };
