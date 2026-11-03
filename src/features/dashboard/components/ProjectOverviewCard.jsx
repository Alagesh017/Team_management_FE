import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DASH_PANEL, DASH_PANEL_BODY, DASH_PANEL_HEADER, DASH_TABLE_WRAPPER } from "./dashboardStyles";
import { useDashboardProjectSummary } from "../hooks/useDashboardData";
import { useDashboardFilters } from "../contexts/DashboardFiltersContext";
import { cn } from "../../../core/utils/utils";

const SEGMENT_COLORS = {
  Completed: "#22c55e",
  "In progress": "#3b82f6",
  Pending: "#f59e0b",
  "On hold": "#f97316",
  Todo: "#64748b",
  Other: "#94a3b8",
};

export default function ProjectOverviewCard({ compact = false }) {
  const { summaryParams } = useDashboardFilters();
  const { data, loading } = useDashboardProjectSummary(summaryParams);
  const totals = data?.totals || {
    total: 0,
    completed: 0,
    in_progress: 0,
    pending: 0,
    hold: 0,
    todo: 0,
    other: 0,
    open: 0,
  };

  const chartData = useMemo(() => {
    const rows = [
      { name: "Completed", value: totals.completed || 0 },
      { name: "In progress", value: totals.in_progress || 0 },
      { name: "Pending", value: totals.pending || 0 },
      { name: "On hold", value: totals.hold || 0 },
      { name: "Todo", value: totals.todo || 0 },
      { name: "Other", value: totals.other || 0 },
    ];
    return rows.filter((d) => d.value > 0);
  }, [totals]);

  const total = totals.total || 0;

  return (
    <div className={DASH_PANEL + " flex flex-col"}>
      <div className={DASH_PANEL_HEADER + " flex items-center justify-between gap-2 py-2.5"}>
        <h2 className={compact ? "text-xs font-semibold text-slate-900" : "text-sm font-semibold text-slate-900"}>
          Project overview
        </h2>
        <Link to="/projects" className="text-[10px] sm:text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap">
          View all projects →
        </Link>
      </div>
      <div className={DASH_PANEL_BODY + (compact ? " py-2" : " py-3")}>
        {loading && !data ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : (
          <div className={cn(DASH_TABLE_WRAPPER, "-mx-1 px-1 xl:mx-0 xl:px-0")}>
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-3",
                compact ? "min-w-[280px] xl:min-w-0" : "min-w-[320px] xl:min-w-0"
              )}
            >
              <div
                className={cn(
                  "relative shrink-0 mx-auto sm:mx-0",
                  compact ? "h-[88px] w-[88px]" : "h-[120px] w-[120px]"
                )}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.length ? chartData : [{ name: "Empty", value: 1 }]}
                      innerRadius={compact ? 30 : 42}
                      outerRadius={compact ? 40 : 56}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {(chartData.length ? chartData : [{ name: "Empty", value: 1 }]).map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            chartData.length ? SEGMENT_COLORS[entry.name] || "#e2e8f0" : "#e2e8f0"
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className={compact ? "text-base font-bold text-slate-900" : "text-xl font-bold text-slate-900"}
                  >
                    {total}
                  </span>
                  <span className="text-[10px] text-slate-500">Total tasks</span>
                </div>
              </div>

              <ul className={cn("flex-1 space-y-1 min-w-0 w-full", compact ? "text-xs" : "text-sm")}>
                {(chartData.length
                  ? chartData
                  : [
                      { name: "Completed", value: 0 },
                      { name: "In progress", value: 0 },
                      { name: "Pending", value: 0 },
                    ]
                ).map((row) => {
                  const totalN = totals.total || 0;
                  const pct = totalN ? (((row.value ?? 0) / totalN) * 100).toFixed(1) : 0;
                  const color = SEGMENT_COLORS[row.name] || "#94a3b8";
                  return (
                    <li key={row.name} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        {row.name}
                      </span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {row.value ?? 0}{" "}
                        <span className="text-slate-400 font-normal text-xs">({pct}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
