import React from "react";
import { Loader2 } from "lucide-react";
import { DASH_PANEL, DASH_PANEL_BODY, DASH_PANEL_HEADER } from "./dashboardStyles";
import { useDashboardProjectHealth } from "../hooks/useDashboardData";

const rows = [
  { key: "on_track", label: "On track", color: "bg-emerald-500", text: "text-emerald-700" },
  { key: "at_risk", label: "At risk", color: "bg-amber-400", text: "text-amber-700" },
  { key: "delayed", label: "Delayed", color: "bg-red-500", text: "text-red-700" },
];

export default function ProjectHealthCard() {
  const { data, loading } = useDashboardProjectHealth();
  const max = Math.max(data?.on_track || 0, data?.at_risk || 0, data?.delayed || 0, 1);

  return (
    <div className={DASH_PANEL + " h-full flex flex-col"}>
      <div className={DASH_PANEL_HEADER + " flex items-center justify-between"}>
        <h2 className="text-xs font-semibold text-slate-900">Project health</h2>
      </div>
      <div className={DASH_PANEL_BODY + " space-y-2 py-2 flex-1"}>
        {loading && !data ? (
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        ) : (
          rows.map(({ key, label, color, text }) => {
            const count = data?.[key] ?? 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={text + " font-medium"}>{label}</span>
                  <span className="font-semibold text-slate-800">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={"h-full rounded-full " + color}
                    style={{ width: `${Math.max(8, (count / max) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
