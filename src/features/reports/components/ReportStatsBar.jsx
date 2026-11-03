import React from "react";

export default function ReportStatsBar({ stats }) {
  if (!stats) return null;
  const topStatuses = Object.entries(stats.byStatus || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
      <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
        <p className="text-[9px] uppercase text-slate-400 font-semibold">Tasks</p>
        <p className="text-lg font-bold text-slate-900 tabular-nums leading-tight">{stats.count}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
        <p className="text-[9px] uppercase text-slate-400 font-semibold">Est. hours</p>
        <p className="text-lg font-bold text-slate-900 tabular-nums leading-tight">{stats.est.toFixed(1)}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
        <p className="text-[9px] uppercase text-slate-400 font-semibold">Act. hours</p>
        <p className="text-lg font-bold text-slate-900 tabular-nums leading-tight">{stats.act.toFixed(1)}</p>
      </div>
      {topStatuses.map(([name, count]) => (
        <div key={name} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 min-w-0">
          <p className="text-[9px] uppercase text-slate-400 font-semibold truncate" title={name}>
            {name}
          </p>
          <p className="text-lg font-bold text-indigo-600 tabular-nums leading-tight">{count}</p>
        </div>
      ))}
    </div>
  );
}
