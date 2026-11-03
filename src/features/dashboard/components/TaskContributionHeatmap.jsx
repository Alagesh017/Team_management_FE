import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../common/components/ui/select";
import { DASH_PANEL, DASH_PANEL_BODY, DASH_PANEL_HEADER } from "./dashboardStyles";
import { useDashboardCompletions } from "../hooks/useDashboardData";
import { useDashboardFilters } from "../contexts/DashboardFiltersContext";

const LEVELS = ["bg-blue-100", "bg-blue-300", "bg-blue-500", "bg-blue-700", "bg-blue-900"];

function levelForCount(count, max) {
  if (!count || count <= 0) return -1;
  if (max <= 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 0;
  if (ratio <= 0.5) return 1;
  if (ratio <= 0.75) return 2;
  return 3;
}

function buildWeeks(year, countsByDate) {
  const jan1 = new Date(year, 0, 1);
  const start = new Date(jan1);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const weeks = [];
  let cursor = new Date(start);
  while (weeks.length < 53) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key = cursor.toISOString().slice(0, 10);
      week.push({
        date: key,
        count: countsByDate[key] || 0,
        inYear: cursor.getFullYear() === year,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (weeks.length >= 53 && cursor.getFullYear() > year) break;
  }
  return weeks.slice(0, 53);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function TaskContributionHeatmap() {
  const { completionParams, completionYear, setCompletionYear } = useDashboardFilters();
  const { data, loading, error } = useDashboardCompletions(completionParams);
  const countsByDate = data?.counts_by_date || {};
  const year = data?.year || completionYear;

  const { weeks, maxCount } = useMemo(() => {
    const w = buildWeeks(year, countsByDate);
    let max = 0;
    Object.values(countsByDate).forEach((c) => {
      if (c > max) max = c;
    });
    return { weeks: w, maxCount: max };
  }, [year, countsByDate]);

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2];
  }, []);

  return (
    <div className={DASH_PANEL + " w-full"}>
      <div className={DASH_PANEL_HEADER + " flex flex-row items-center justify-between gap-2"}>
        <div>
          <h2 className="text-xs font-semibold text-slate-900">Task completion</h2>
          <p className="text-[10px] text-slate-500 leading-tight">Completed by day</p>
        </div>
        <Select value={String(completionYear)} onValueChange={(v) => setCompletionYear(Number(v))}>
          <SelectTrigger className="w-[88px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={DASH_PANEL_BODY}>
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        )}
        {error && !loading && <p className="text-xs text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="w-full overflow-x-auto overscroll-x-contain touch-pan-x -mx-1 px-1 sm:mx-0 sm:px-0">
            <div className="flex gap-1 text-[9px] text-slate-400 mb-1 pl-8 min-w-[680px]">
              {MONTHS.map((m) => (
                <span key={m} className="flex-1">
                  {m}
                </span>
              ))}
            </div>
            <div className="flex gap-[3px] min-w-[680px]">
              <div className="flex flex-col gap-[3px] text-[9px] text-slate-400 pr-1 justify-around shrink-0">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>
              <div className="flex gap-[3px] flex-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px] flex-1 min-w-0">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        title={`${day.date}: ${day.count} completed`}
                        className={`aspect-square w-full max-w-[11px] rounded-[2px] mx-auto ${
                          !day.inYear
                            ? "opacity-0"
                            : day.count <= 0
                              ? "bg-slate-100"
                              : LEVELS[levelForCount(day.count, maxCount)]
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-500">
              <span>Low</span>
              <div className="h-2.5 w-2.5 rounded-[2px] bg-slate-100" />
              {LEVELS.map((c, i) => (
                <div key={i} className={`h-2.5 w-2.5 rounded-[2px] ${c}`} />
              ))}
              <span>High</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
