import React from "react";
import { Building2, Calendar, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../common/components/ui/select";
import { DashboardDateRange } from "./DashboardDateRange";
import { RANGE_OPTIONS, useDashboardFilters } from "../contexts/DashboardFiltersContext";

export default function DashboardToolbar({ projects = [], subtitle }) {
  const {
    projectId,
    setProjectId,
    range,
    setRange,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
  } = useDashboardFilters();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-xs text-slate-500">
          {subtitle || "Track projects, tasks, and team progress at a glance."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs bg-white border-slate-200 rounded-lg">
            <Building2 className="h-4 w-4 text-slate-400 mr-1 shrink-0" />
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
          <SelectTrigger className="h-9 w-full sm:w-[130px] text-xs bg-white border-slate-200 rounded-lg">
            <Calendar className="h-4 w-4 text-slate-400 mr-1 shrink-0" />
            <SelectValue />
            <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-auto" />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {range === "custom" && (
          <DashboardDateRange
            start={customStart}
            end={customEnd}
            onStartChange={setCustomStart}
            onEndChange={setCustomEnd}
          />
        )}
      </div>
    </div>
  );
}
