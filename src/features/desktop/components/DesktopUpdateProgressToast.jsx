export function DesktopUpdateProgressToast({ state }) {
  if (state.phase !== "downloading" && state.phase !== "ready") {
    return null;
  }

  const pct = Math.min(100, Math.max(0, Math.round(state.percent || 0)));

  return (
    <div
      className="fixed bottom-4 right-4 z-[2000] w-[min(100vw-2rem,320px)] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-bold text-slate-900">
        {state.phase === "ready" ? "Installing update…" : "Downloading update"}
      </p>
      {state.availableVersion ? (
        <p className="text-xs text-slate-500 mt-0.5">Version {state.availableVersion}</p>
      ) : null}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs font-medium text-slate-600 mt-2 tabular-nums">{pct}%</p>
    </div>
  );
}
