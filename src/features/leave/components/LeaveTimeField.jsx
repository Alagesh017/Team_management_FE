import React from "react";
import { Clock } from "lucide-react";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { cn } from "../../../core/utils/utils";

export const nowTime24 = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const formatTime12h = (time24) => {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export const parseTimeToMinutes = (time24) => {
  if (!time24 || !/^\d{1,2}:\d{2}$/.test(time24)) return null;
  const [h, m] = time24.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

export const formatMinutesToTime = (totalMinutes) => {
  const clamped = Math.max(0, Math.min(totalMinutes, 23 * 60 + 59));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const addMinutesToTime = (time24, minutesToAdd) => {
  const base = parseTimeToMinutes(time24);
  if (base == null) return time24;
  return formatMinutesToTime(base + minutesToAdd);
};

/** Minimum end time = start + 1 minute (for native input `min` attribute). */
export const minEndTimeAfterStart = (startTime) => {
  const start = parseTimeToMinutes(startTime);
  if (start == null) return undefined;
  if (start >= 23 * 60 + 59) return "23:59";
  return formatMinutesToTime(start + 1);
};

const LeaveTimeField = ({
  id,
  label,
  value,
  onChange,
  min,
  required,
  hint,
  error,
  disabled,
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
    </Label>
    <div className="relative">
      <Clock
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <Input
        id={id}
        type="time"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        step={60}
        required={required}
        disabled={disabled}
        className={cn(
          "h-11 pl-10 text-base tabular-nums",
          "appearance-none",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
          "[&::-webkit-calendar-picker-indicator]:ml-1",
          "[&::-webkit-calendar-picker-indicator]:h-5",
          "[&::-webkit-calendar-picker-indicator]:w-5",
          "[&::-webkit-calendar-picker-indicator]:opacity-70",
          "[&::-webkit-calendar-picker-indicator]:hover:opacity-100",
          error && "border-red-300 focus-visible:ring-red-400"
        )}
      />
    </div>
    {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    {hint && !error ? <p className="text-[11px] text-slate-500">{hint}</p> : null}
  </div>
);

export default LeaveTimeField;