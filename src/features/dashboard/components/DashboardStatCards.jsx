import React from "react";
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  PauseCircle,
  Timer,
  Hourglass,
} from "lucide-react";
import { DASH_PANEL, DASH_PANEL_BODY } from "./dashboardStyles";
import { useDashboardProjectSummary } from "../hooks/useDashboardData";
import { RANGE_OPTIONS, useDashboardFilters } from "../contexts/DashboardFiltersContext";
import { cn } from "../../../core/utils/utils";

const cards = [
  {
    key: "total",
    label: "Total",
    icon: ClipboardList,
    iconWrap: "bg-blue-500 text-white",
    blob: "from-blue-400/20 to-blue-600/5",
    valueKey: "total",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    iconWrap: "bg-emerald-500 text-white",
    blob: "from-emerald-400/20 to-emerald-600/5",
    valueKey: "completed",
  },
  {
    key: "in_progress",
    label: "In progress",
    icon: Timer,
    iconWrap: "bg-violet-500 text-white",
    blob: "from-violet-400/20 to-violet-600/5",
    valueKey: "in_progress",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Hourglass,
    iconWrap: "bg-amber-500 text-white",
    blob: "from-amber-400/20 to-amber-600/5",
    valueKey: "pending",
  },
  {
    key: "hold",
    label: "On hold",
    icon: PauseCircle,
    iconWrap: "bg-orange-500 text-white",
    blob: "from-orange-400/20 to-orange-600/5",
    valueKey: "hold",
  },
];

export default function DashboardStatCards() {
  const { summaryParams, range } = useDashboardFilters();
  const { data, loading } = useDashboardProjectSummary(summaryParams);
  const totals = data?.totals || {};
  const periodLabel =
    data?.filters?.start && data?.filters?.end
      ? data.filters.start === data.filters.end
        ? data.filters.start
        : `${data.filters.start} → ${data.filters.end}`
      : RANGE_OPTIONS.find((o) => o.value === range)?.label || "Selected period";

  return (
    <div className="space-y-1">
      <p className="text-[10px] text-slate-500 px-0.5">
        Task counts for schedule overlapping <span className="font-semibold text-slate-600">{periodLabel}</span>
      </p>
      <div className="overflow-x-auto overscroll-x-contain touch-pan-x xl:overflow-visible -mx-1 px-1 xl:mx-0 xl:px-0">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 min-w-[440px] xl:min-w-0">
        {cards.map(({ key, label, icon: Icon, iconWrap, blob, valueKey }) => (
          <div key={key} className={cn(DASH_PANEL, "relative overflow-hidden")}>
            <div
              className={cn(
                "pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-gradient-to-br opacity-80",
                blob
              )}
              aria-hidden
            />
            <div className={cn(DASH_PANEL_BODY, "relative flex items-center gap-2 py-2.5")}>
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm",
                  iconWrap
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                {loading && !data ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                ) : (
                  <p className="text-xl font-bold text-slate-900 leading-none tabular-nums">
                    {totals[valueKey] ?? 0}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
