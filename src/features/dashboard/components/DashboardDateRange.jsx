import React from "react";
import { Input } from "../../../common/components/ui/input";
import { cn } from "../../../core/utils/utils";

/** Paired start/end date fields (dashboard custom range). */
export function DashboardDateField({ value, onChange, "aria-label": ariaLabel, className }) {
  return (
    <div
      className={cn(
        "relative flex h-9 w-[132px] shrink-0 items-center rounded-lg border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      <Input
        type="date"
        aria-label={ariaLabel}
        value={value || ""}
        onChange={onChange}
        className="h-full w-full border-0 bg-transparent px-2.5 text-xs shadow-none focus-visible:ring-0 [color-scheme:light]"
      />
    </div>
  );
}

export function DashboardDateRange({ start, end, onStartChange, onEndChange, className }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <DashboardDateField
        aria-label="Start date"
        value={start}
        onChange={(e) => onStartChange(e.target.value)}
      />
      <span className="text-[10px] text-slate-400 shrink-0" aria-hidden>
        to
      </span>
      <DashboardDateField
        aria-label="End date"
        value={end}
        onChange={(e) => onEndChange(e.target.value)}
      />
    </div>
  );
}
