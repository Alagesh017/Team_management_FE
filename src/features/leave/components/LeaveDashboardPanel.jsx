import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { Calendar, CalendarCheck, Moon, Sparkles } from "lucide-react";
import LeaveCalendar from "./LeaveCalendar";

const StatCard = ({ title, value, sub, icon: Icon, iconClass = "text-slate-600", accent }) => (
  <Card className="border-slate-200/80 shadow-sm bg-white">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
      <CardTitle className="text-xs font-medium text-slate-500">{title}</CardTitle>
      <div className={`rounded-lg bg-slate-50 p-1.5 ${accent || ""}`}>
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </div>
    </CardHeader>
    <CardContent className="px-4 pb-4 pt-0">
      <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </CardContent>
  </Card>
);

const LeaveDashboardPanel = ({
  dashboard,
  loading,
  year,
  month,
  onMonthChange,
  personLabel,
  adminPolicyLink,
}) => {
  const policy = dashboard?.policy;
  const usage = dashboard?.usage;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
      <div className="min-w-0">
        <LeaveCalendar
          year={year}
          month={month}
          calendarDays={dashboard?.calendar_days}
          onMonthChange={onMonthChange}
          loading={loading}
        />
      </div>

      <div className="flex flex-col gap-3">
        {personLabel ? (
          <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Balance
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{personLabel}</p>
          </div>
        ) : null}

        <StatCard
          title="Annual allowance"
          value={policy ? `${policy.annual_leave_days}` : "—"}
          sub={policy ? `days/year · ≈ ${policy.monthly_leave_days} / month` : null}
          icon={Calendar}
        />
        <StatCard
          title="Used this year"
          value={usage ? `${usage.annual_used}` : "—"}
          sub={usage ? `${usage.annual_remaining} days remaining` : null}
          icon={CalendarCheck}
          iconClass="text-emerald-600"
          accent="bg-emerald-50"
        />
        <StatCard
          title="This month"
          value={usage ? `${usage.month_used}` : "—"}
          sub={usage ? `of ${usage.monthly_limit} day limit` : null}
          icon={Moon}
          iconClass="text-blue-600"
          accent="bg-blue-50"
        />
        <StatCard
          title="Religious leave"
          value={usage ? `${usage.religious_days_used}` : "—"}
          sub="Not counted in annual quota"
          icon={Sparkles}
          iconClass="text-amber-600"
          accent="bg-amber-50"
        />

        {adminPolicyLink}
      </div>
    </div>
  );
};

export default LeaveDashboardPanel;