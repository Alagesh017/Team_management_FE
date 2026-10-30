import React from "react";
import { Edit, Trash2 } from "lucide-react";

export function formatMonitorClock(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  if (h > 0) return `${h}h ${mm}m ${ss}s`;
  return `${mm}m ${ss}s`;
}

function activityClass(stateName) {
  const s = (stateName || "unknown").toLowerCase();
  if (s === "active") return "bg-emerald-100 text-emerald-800";
  if (s === "idle" || s === "locked") return "bg-amber-100 text-amber-900";
  if (s === "break") return "bg-sky-100 text-sky-800";
  return "bg-slate-100 text-slate-600";
}

/**
 * Live monitoring UI (same signals as the old standalone agent window).
 */
export default function BuiltInMonitorPanel({
  agentState,
  onStart,
  onStop,
  onStartBreak,
  onEndBreak,
  onReset,
  busy,
}) {
  const s = agentState || {};

  const monitoring = Boolean(s.monitoring);
  const act = monitoring ? s.liveActivityState || "unknown" : "—";
  const threshold = s.idleThresholdSeconds ?? 30;

  let countdown = null;
  if (monitoring) {
    const actLower = (act || "").toLowerCase();
    if (actLower === "active" && typeof s.secondsUntilIdle === "number") {
      countdown =
        s.secondsUntilIdle <= 0
          ? "No input detected — switching to idle…"
          : `Idle in ${s.secondsUntilIdle}s (no input for ${threshold}s)`;
    } else if (actLower === "idle" || actLower === "locked") {
      countdown = `Idle — no input for ${s.systemIdleSeconds ?? 0}s`;
    } else if (actLower === "break") {
      countdown = "On break — activity not counted as work";
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-slate-600 to-slate-400" />
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Connection</span>
          <span
            className={`rounded-full px-2 py-0.5 font-semibold capitalize ${
              s.connection === "connected" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
            }`}
          >
            {s.connection || "disconnected"}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Monitoring</span>
          <span
            className={`rounded-full px-2 py-0.5 font-semibold capitalize ${
              monitoring ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
            }`}
          >
            {monitoring ? "running" : "stopped"}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Activity</span>
          <span className={`rounded-full px-2 py-0.5 font-semibold capitalize ${activityClass(act)}`}>
            {act}
          </span>
        </div>

        {countdown && (
          <p className="text-xs rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            {countdown}
          </p>
        )}

        {(s.devicePaired || monitoring) && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 px-2 py-2 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-700">Active</p>
              <p className="text-sm font-bold tabular-nums text-emerald-900 mt-0.5">
                {formatMonitorClock(s.sessionActiveSeconds)}
              </p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/80 px-2 py-2 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wide text-amber-800">Idle</p>
              <p className="text-sm font-bold tabular-nums text-amber-900 mt-0.5">
                {formatMonitorClock(s.sessionIdleSeconds)}
              </p>
            </div>
            <div className="rounded-lg border border-sky-100 bg-sky-50/80 px-2 py-2 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wide text-sky-800">Break</p>
              <p className="text-sm font-bold tabular-nums text-sky-900 mt-0.5">
                {formatMonitorClock(s.sessionBreakSeconds)}
              </p>
            </div>
          </div>
        )}

        {s.error && <p className="text-xs text-red-600">{s.error}</p>}

        <div className="flex flex-wrap gap-2">
          {!monitoring ? (
            <button
              type="button"
              disabled={busy}
              onClick={onStart}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Start monitoring
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={onStop}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Stop monitoring
            </button>
          )}
          <button
            type="button"
            disabled={busy || !monitoring || s.onBreak}
            onClick={onStartBreak}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Start break
          </button>
          <button
            type="button"
            disabled={busy || !s.onBreak}
            onClick={onEndBreak}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            End break
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onReset}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            Reset device
          </button>
        </div>

        <p className="text-[10px] text-slate-500 leading-relaxed">
          Built into Dce task manager — no external agent. Session timers update every second; the server syncs on a
          heartbeat.
        </p>
      </div>
    </div>
  );
}
