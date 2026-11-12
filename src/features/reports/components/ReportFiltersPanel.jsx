import React from "react";
import { Search } from "lucide-react";
import ReportDateRange from "./ReportDateRange";
import { cn } from "../../../core/utils/utils";

const QUICK_RANGES = [
  { id: "today", label: "Today" },
  { id: "day", label: "One day" },
  { id: "thisweek", label: "Week" },
  { id: "thismonth", label: "Month" },
  { id: "custom", label: "Range" },
];

const labelClass = "text-[10px] font-semibold uppercase text-slate-400 mb-1 block";
const selectClass =
  "h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function ReportFiltersPanel({
  quickDate,
  onQuickDate,
  dateRange,
  onSingleDayChange,
  onStartChange,
  onEndChange,
  dateField,
  onDateFieldChange,
  search,
  onSearchChange,
  projectId,
  onProjectChange,
  projects,
  userKey,
  onUserChange,
  userOptions,
  peopleScopeHint,
  status,
  onStatusChange,
  statuses,
  priority,
  onPriorityChange,
  workflow,
  onWorkflowChange,
  exportMode,
  onExportModeChange,
  previewView,
  onPreviewViewChange,
  taskCount,
}) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-sm p-2.5 h-full flex flex-col gap-2.5 overflow-y-auto">
      <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2 space-y-2">
        <span className={labelClass}>Date filter</span>
        <select
          value={dateField}
          onChange={(e) => onDateFieldChange(e.target.value)}
          className={selectClass}
        >
          <option value="span">Active in period (start → due, recommended)</option>
          <option value="start">Start date in period only</option>
          <option value="due">Due date in period only</option>
          <option value="either">Start or due in period</option>
        </select>
        {dateField === "span" ? (
          <p className="text-[9px] text-slate-500 leading-snug mt-1">
            Multi-day tasks appear on every day from start through due. Hours are split across those days.
          </p>
        ) : null}

        <span className={cn(labelClass, "mt-1")}>Period</span>
        <div className="flex flex-wrap gap-1">
          {QUICK_RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onQuickDate(r.id)}
              className={cn(
                "px-2 py-1 rounded-md text-[10px] font-medium border transition-colors",
                quickDate === r.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <ReportDateRange
          mode={quickDate === "day" ? "day" : "range"}
          start={dateRange.start}
          end={dateRange.end}
          onSingleDayChange={onSingleDayChange}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
        />

        {dateRange.start && dateRange.end ? (
          <p className="text-[9px] text-slate-500 leading-snug">
            {dateField === "span"
              ? dateRange.start === dateRange.end
                ? `Tasks active on ${dateRange.start} (start–due covers this day)`
                : `Tasks overlapping ${dateRange.start} → ${dateRange.end}`
              : dateRange.start === dateRange.end
                ? `Showing tasks for ${dateRange.start}`
                : `${dateRange.start} → ${dateRange.end}`}
          </p>
        ) : quickDate === "custom" || quickDate === "day" ? (
          <p className="text-[9px] text-amber-700">Choose date(s) to filter results.</p>
        ) : null}
      </div>

      <div>
        <span className={labelClass}>Search</span>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Task title…"
            className="h-8 w-full rounded-md border border-slate-200 pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Project</span>
        <select value={projectId} onChange={(e) => onProjectChange(e.target.value)} className={selectClass}>
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={labelClass}>Person</span>
        {peopleScopeHint ? (
          <p className="text-[9px] text-indigo-600 mb-1 leading-snug">{peopleScopeHint}</p>
        ) : null}
        <select value={userKey} onChange={(e) => onUserChange(e.target.value)} className={selectClass}>
          <option value="all">All people</option>
          {userOptions.map((u) => (
            <option key={u.key} value={u.key}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={labelClass}>Status</span>
        <select value={status} onChange={(e) => onStatusChange(e.target.value)} className={selectClass}>
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={labelClass}>Priority</span>
        <select value={priority} onChange={(e) => onPriorityChange(e.target.value)} className={selectClass}>
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div>
        <span className={labelClass}>Workflow</span>
        <select value={workflow} onChange={(e) => onWorkflowChange(e.target.value)} className={selectClass}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="hold">On hold</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="border-t border-slate-100 pt-2 space-y-2 mt-auto">
        <div>
          <span className={labelClass}>Preview</span>
          <select
            value={previewView}
            onChange={(e) => onPreviewViewChange(e.target.value)}
            className={selectClass}
          >
            <option value="grouped">By project & assignee</option>
            <option value="flat">Flat list</option>
          </select>
        </div>
        <div>
          <span className={labelClass}>Excel layout</span>
          <select value={exportMode} onChange={(e) => onExportModeChange(e.target.value)} className={selectClass}>
            <option value="overall">Multi-sheet</option>
            <option value="single">Single sheet</option>
          </select>
        </div>
        <p className="text-[10px] text-slate-500">
          <span className="font-bold text-slate-900 tabular-nums">{taskCount}</span> tasks match
        </p>
        <p className="text-[9px] text-slate-400">Filters apply instantly</p>
      </div>
    </div>
  );
}
