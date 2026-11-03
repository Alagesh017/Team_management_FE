import React from "react";
import { cn } from "../../../core/utils/utils";

const inputClass =
  "h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 [color-scheme:light]";

function DateField({ id, label, value, onChange, min, max, disabled }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[10px] font-medium text-slate-600">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value || ""}
        min={min || undefined}
        max={max || undefined}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, disabled && "opacity-60 cursor-not-allowed bg-slate-50")}
      />
    </div>
  );
}

/** Reports sidebar: single day or start/end range with min end ≥ start. */
export default function ReportDateRange({
  mode,
  start,
  end,
  onSingleDayChange,
  onStartChange,
  onEndChange,
}) {
  if (mode === "day") {
    const dayValue = start && end && start === end ? start : start || end || "";
    return (
      <DateField
        id="report-single-day"
        label="On this day"
        value={dayValue}
        onChange={onSingleDayChange}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      <DateField
        id="report-start-date"
        label="From"
        value={start}
        onChange={onStartChange}
        max={end || undefined}
      />
      <DateField
        id="report-end-date"
        label="To"
        value={end}
        min={start || undefined}
        onChange={onEndChange}
      />
      {start && end && end < start ? (
        <p className="text-[10px] text-amber-700 font-medium">End date adjusted to match start.</p>
      ) : null}
    </div>
  );
}
