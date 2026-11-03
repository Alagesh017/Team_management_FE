import React from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../common/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../common/components/ui/select";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { RANGE_OPTIONS, useDashboardFilters } from "../contexts/DashboardFiltersContext";
import { useDashboardProjectSummary } from "../hooks/useDashboardData";

function StatusBars({ byStatus, maxCount }) {
  if (!byStatus?.length) {
    return <p className="text-xs text-slate-500 py-3 text-center">No tasks in this period.</p>;
  }
  const max = maxCount || Math.max(...byStatus.map((s) => s.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-14 mt-2 px-1">
      {byStatus.map((s) => (
        <div key={s.status_id} className="flex-1 flex flex-col items-center min-w-0">
          <div
            className="w-full max-w-[10px] rounded-sm mx-auto"
            style={{
              height: `${Math.max(6, (s.count / max) * 52)}px`,
              backgroundColor: s.color || "#3b82f6",
            }}
            title={`${s.name}: ${s.count}`}
          />
        </div>
      ))}
    </div>
  );
}

export default function ProjectSummaryWidget({ projects = [] }) {
  const {
    projectId,
    setProjectId,
    range,
    setRange,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    summaryParams,
  } = useDashboardFilters();

  const { data, loading, error } = useDashboardProjectSummary(summaryParams);

  const totals = data?.totals || { total: 0, completed: 0, in_progress: 0, todo: 0, other: 0 };
  const byStatus = data?.by_status || [];
  const filters = data?.filters;

  return (
    <Card className="shadow-sm border-slate-200 h-full">
      <CardHeader className="py-2 px-3 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Project summary</CardTitle>
            <CardDescription className="text-xs">
              {filters?.start === filters?.end ? filters?.start : `${filters?.start} → ${filters?.end}`}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="h-8 w-full sm:w-[160px] text-xs">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="h-8 w-full sm:w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {range === "custom" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Start</Label>
              <Input type="date" className="h-8 text-xs" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            </div>
            <div>
              <Label className="text-[10px]">End</Label>
              <Input type="date" className="h-8 text-xs" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}
        {error && !loading && <p className="text-xs text-red-600">{error}</p>}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-bold text-slate-900">{totals.total}</p>
                <p className="text-[10px] text-slate-500">Total</p>
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{totals.completed}</p>
                <p className="text-[10px] text-slate-500">Completed</p>
              </div>
              <div>
                <p className="text-xl font-bold text-teal-600">{totals.in_progress + totals.todo}</p>
                <p className="text-[10px] text-slate-500">Open</p>
              </div>
            </div>
            <StatusBars byStatus={byStatus} maxCount={totals.total} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {byStatus.map((s) => (
                <span key={s.status_id} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {s.name}: {s.count}
                </span>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
