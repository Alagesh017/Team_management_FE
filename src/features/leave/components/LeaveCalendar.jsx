import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, PartyPopper } from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { cn, formatDate } from "../../../core/utils/utils";

const WEEK_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const dayCellClasses = (day, isToday, isSelected) => {
  const kind = day?.kind;
  const isHoliday = Boolean(day?.holiday_name);
  const base =
    "relative flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl text-sm font-medium transition-all";

  if (isSelected) {
    return cn(
      base,
      "ring-2 ring-indigo-500 ring-offset-2 shadow-md z-[1]",
      isHoliday ? "bg-indigo-100 text-indigo-900" : "bg-white text-slate-900"
    );
  }

  if (isToday) {
    return cn(base, "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white shadow-sm");
  }

  switch (kind) {
    case "weekend":
      return cn(base, "bg-slate-100/80 text-slate-400");
    case "holiday":
      return cn(
        base,
        "bg-indigo-50 text-indigo-800 shadow-inner border border-indigo-100 cursor-pointer hover:bg-indigo-100/90"
      );
    case "religious":
      return cn(base, "bg-amber-100 text-amber-900 border border-amber-200/80 shadow-sm");
    case "half_leave":
      return cn(base, "border border-red-200/80 text-red-900 shadow-sm overflow-hidden");
    case "leave_full":
      return cn(base, "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md");
    case "permission":
      return cn(base, "bg-rose-50 text-rose-800 border border-dashed border-rose-200");
    default:
      return cn(base, "bg-white text-slate-700 hover:bg-slate-50/80 border border-transparent");
  }
};

const halfDayStyle = {
  background:
    "linear-gradient(165deg, #fecaca 0%, #fecaca 48%, #ffffff 48%, #ffffff 100%)",
};

const LEAVE_KIND_LABELS = {
  leave_full: "Full day leave",
  half_leave: "Half day leave",
  religious: "Religious leave",
  permission: "Permission",
};

const LEGEND = [
  { key: "weekend", label: "Weekend", className: "bg-slate-200" },
  { key: "leave", label: "Leave", className: "bg-red-500" },
  { key: "half", label: "Half day", className: "", style: halfDayStyle },
  { key: "religious", label: "Religious", className: "bg-amber-300" },
  { key: "holiday", label: "Holiday", className: "bg-indigo-200" },
  { key: "permission", label: "Permission", className: "bg-rose-100 border border-rose-200" },
];

const LeaveCalendar = ({ year, month, calendarDays = [], onMonthChange, loading }) => {
  const today = todayIso();
  const [selectedDay, setSelectedDay] = useState(null);

  const { cells, monthLabel } = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const byDate = Object.fromEntries((calendarDays || []).map((d) => [d.date, d]));
    const grid = [];
    for (let i = 0; i < startPad; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      grid.push(byDate[iso] || { date: iso, weekday: new Date(year, month - 1, d).getDay() });
    }
    const label = first.toLocaleString("en-US", { month: "long", year: "numeric" });
    return { cells: grid, monthLabel: label };
  }, [year, month, calendarDays]);

  const prev = () => {
    setSelectedDay(null);
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  };
  const next = () => {
    setSelectedDay(null);
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  };

  const handleDayClick = (day) => {
    if (!day?.holiday_name) return;
    setSelectedDay((prev) => (prev?.date === day.date ? null : day));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white/80 px-5 py-4 backdrop-blur-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Your month
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">{monthLabel}</h3>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-0.5 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={prev}
            disabled={loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={next}
            disabled={loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {WEEK_LABELS.map((w) => (
            <div
              key={w}
              className="py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >
              {w}
            </div>
          ))}
        </div>

        <div
          className={cn(
            "grid grid-cols-7 gap-1.5",
            loading && "pointer-events-none opacity-60"
          )}
        >
          {cells.map((day, idx) => {
            if (!day) {
              return <div key={`pad-${idx}`} className="min-h-[3.25rem]" aria-hidden />;
            }
            const num = parseInt(day.date.split("-")[2], 10);
            const isToday = day.date === today;
            const isHalf = day.kind === "half_leave";
            const isHoliday = Boolean(day.holiday_name);
            const isSelected = selectedDay?.date === day.date;
            const tip = day.holiday_name
              ? `${day.holiday_name} — click for details`
              : day.kind
                ? day.kind.replace(/_/g, " ")
                : "";

            const CellTag = isHoliday ? "button" : "div";

            return (
              <CellTag
                key={day.date}
                type={isHoliday ? "button" : undefined}
                title={tip}
                onClick={isHoliday ? () => handleDayClick(day) : undefined}
                className={cn(
                  dayCellClasses(day, isToday, isSelected),
                  isHoliday && "cursor-pointer",
                  isHoliday && !isSelected && day.kind !== "holiday" && "ring-1 ring-indigo-200"
                )}
                style={isHalf ? halfDayStyle : undefined}
              >
                <span className={cn(isToday && !day.kind && "font-bold text-indigo-600")}>
                  {num}
                </span>
                {isHoliday ? (
                  <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                ) : day.kind && day.kind !== "weekend" ? (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-current opacity-60" />
                ) : null}
              </CellTag>
            );
          })}
        </div>

        {selectedDay?.holiday_name ? (
          <div className="mt-3 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <PartyPopper className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                    Festival / company holiday
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-slate-900">
                    {selectedDay.holiday_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{formatDate(selectedDay.date)}</p>
                  {selectedDay.kind && LEAVE_KIND_LABELS[selectedDay.kind] ? (
                    <p className="mt-2 text-xs text-slate-500">
                      You also have: {LEAVE_KIND_LABELS[selectedDay.kind]} on this date
                    </p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-slate-500"
                onClick={() => setSelectedDay(null)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-white/90 px-3 py-2.5">
          {LEGEND.map((item) => (
            <span
              key={item.key}
              className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600"
            >
              <span
                className={cn("h-2.5 w-2.5 shrink-0 rounded-full", item.className)}
                style={item.style}
              />
              {item.label}
            </span>
          ))}
          <span className="text-[10px] text-slate-400 md:ml-auto">
            Tap indigo holiday dates for details
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendar;