import React from "react";
import { CheckCircle2, ClipboardList, ListTodo, Loader2 } from "lucide-react";
import { useDashboardProjectSummary } from "../hooks/useDashboardData";
import { useDashboardFilters } from "../contexts/DashboardFiltersContext";

function MetricCard({ icon: Icon, label, value, iconClass }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 shadow-sm">
      <div className={`p-1.5 rounded-md shrink-0 ${iconClass}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-slate-900">{value}</p>
        <p className="text-[10px] text-slate-500 truncate">{label}</p>
      </div>
    </div>
  );
}

export default function TaskOverviewCards() {
  const { summaryParams } = useDashboardFilters();
  const { data, loading } = useDashboardProjectSummary(summaryParams);

  const totals = data?.totals || { total: 0, completed: 0, in_progress: 0, todo: 0, other: 0 };

  if (loading && !data) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  const ongoing = totals.in_progress + totals.todo + (totals.other || 0);

  return (
    <div className="grid grid-cols-1 gap-2">
      <MetricCard
        icon={ClipboardList}
        label="Total tasks"
        value={totals.total}
        iconClass="bg-slate-100 text-slate-600"
      />
      <MetricCard
        icon={CheckCircle2}
        label="Completed"
        value={totals.completed}
        iconClass="bg-blue-100 text-blue-600"
      />
      <MetricCard
        icon={ListTodo}
        label="Ongoing"
        value={ongoing}
        iconClass="bg-teal-100 text-teal-600"
      />
    </div>
  );
}
