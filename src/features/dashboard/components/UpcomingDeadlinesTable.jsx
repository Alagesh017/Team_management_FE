import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Loader2 } from "lucide-react";
import { UserAvatar } from "../../../common/components/UserAvatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../common/components/ui/dialog";
import { Button } from "../../../common/components/ui/button";
import {
  DASH_PANEL,
  DASH_PANEL_BODY,
  DASH_PANEL_HEADER,
  DASH_TABLE_DEADLINES,
  DASH_TABLE_WRAPPER,
} from "./dashboardStyles";
import { useDashboardUpcomingDeadlines } from "../hooks/useDashboardData";
import { useDashboardFilters } from "../contexts/DashboardFiltersContext";
import { formatDate } from "../../../core/utils/utils";
import { cn } from "../../../core/utils/utils";

function PriorityBadge({ priority }) {
  const p = (priority || "medium").toLowerCase();
  const styles =
    p === "high" || p === "critical"
      ? "bg-red-100 text-red-700"
      : p === "low"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-amber-100 text-amber-800";
  return (
    <span className={cn("text-[9px] font-semibold px-1 py-0.5 rounded-full capitalize whitespace-nowrap", styles)}>
      {p}
    </span>
  );
}

const projectColors = ["bg-blue-500", "bg-violet-500", "bg-teal-500", "bg-orange-500"];

function DeadlinesTable({ tasks, stickyHeader = true }) {
  return (
    <table className={DASH_TABLE_DEADLINES}>
      <thead className={stickyHeader ? "sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm" : undefined}>
        <tr className="border-b border-slate-100">
          <th className="text-left text-[9px] font-semibold uppercase text-slate-500 px-2 py-1.5 w-[22%]">
            Project
          </th>
          <th className="text-left text-[9px] font-semibold uppercase text-slate-500 px-1 py-1.5 w-[34%]">
            Task
          </th>
          <th className="text-left text-[9px] font-semibold uppercase text-slate-500 px-1 py-1.5 w-[14%]">
            Owner
          </th>
          <th className="text-left text-[9px] font-semibold uppercase text-slate-500 px-1 py-1.5 w-[18%]">
            Due
          </th>
          <th className="text-left text-[9px] font-semibold uppercase text-slate-500 px-2 py-1.5 w-[12%]">
            Pri
          </th>
        </tr>
      </thead>
      <tbody>
        {tasks.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center text-[11px] text-slate-500 py-4">
              No upcoming deadlines.
            </td>
          </tr>
        )}
        {tasks.map((t, i) => {
          const owner = t.owner;
          const ownerName = owner
            ? [owner.first_name, owner.last_name].filter(Boolean).join(" ") || owner.email
            : "—";
          return (
            <tr key={t.id} className="border-b border-slate-50 align-top">
              <td className="px-2 py-1.5 min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full shrink-0", projectColors[i % projectColors.length])}
                  />
                  <span className="truncate text-slate-800 font-medium" title={t.project_name}>
                    {t.project_name}
                  </span>
                </div>
              </td>
              <td className="px-1 py-1.5 text-slate-600 min-w-0">
                <span className="line-clamp-2 leading-snug break-words" title={t.title}>
                  {t.title}
                </span>
              </td>
              <td className="px-1 py-1.5 min-w-0">
                {owner ? (
                  <div className="flex items-center min-w-0" title={ownerName}>
                    <UserAvatar
                      url={owner.avatar_url}
                      email={owner.email}
                      firstName={owner.first_name}
                      lastName={owner.last_name}
                      className="h-6 w-6 shrink-0"
                    />
                  </div>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-1 py-1.5 text-slate-600 min-w-0">
                <span className="inline-flex items-center gap-0.5 truncate" title={formatDate(t.due_date)}>
                  <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{formatDate(t.due_date)}</span>
                </span>
              </td>
              <td className="px-2 py-1.5">
                <PriorityBadge priority={t.priority} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function UpcomingDeadlinesTable({ className }) {
  const { deadlineParams } = useDashboardFilters();
  const [viewAllOpen, setViewAllOpen] = useState(false);

  const previewParams = useMemo(() => ({ ...deadlineParams, limit: 10 }), [deadlineParams]);
  const allParams = useMemo(() => ({ ...deadlineParams, limit: 500 }), [deadlineParams]);

  const { data, loading, error } = useDashboardUpcomingDeadlines(previewParams);
  const {
    data: allData,
    loading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = useDashboardUpcomingDeadlines(allParams, { enabled: viewAllOpen });

  const tasks = data?.tasks || [];
  const allTasks = allData?.tasks || [];
  const showViewAll = tasks.length > 0;

  return (
    <div className={cn(DASH_PANEL, "flex flex-col min-h-[280px] xl:min-h-0 h-full", className)}>
      <div className={DASH_PANEL_HEADER + " flex items-center justify-between gap-2 shrink-0 py-2.5"}>
        <h2 className="text-sm font-semibold text-slate-900">Upcoming deadlines</h2>
        <div className="flex items-center gap-2 shrink-0">
          {showViewAll && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => setViewAllOpen(true)}
            >
              View all
            </Button>
          )}
          <Link to="/tasks-dashboard" className="text-xs font-medium text-slate-500 hover:text-slate-700 whitespace-nowrap">
            Calendar →
          </Link>
        </div>
      </div>
      <div
        className={cn(
          DASH_PANEL_BODY,
          "p-0 flex-1 min-h-0 overflow-y-auto",
          DASH_TABLE_WRAPPER
        )}
      >
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
          </div>
        )}
        {error && !loading && <p className="text-[11px] text-red-600 px-3 py-2">{error}</p>}
        {!loading && !error && <DeadlinesTable tasks={tasks} />}
      </div>

      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-base font-semibold text-slate-900">
              All upcoming deadlines
              {allTasks.length > 0 ? (
                <span className="ml-2 text-sm font-normal text-slate-500">({allTasks.length})</span>
              ) : null}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-4">
            {allLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            )}
            {allError && !allLoading && (
              <p className="text-sm text-red-600 px-3 py-4">
                {allError}{" "}
                <button type="button" className="underline font-medium" onClick={() => refetchAll()}>
                  Retry
                </button>
              </p>
            )}
            {!allLoading && !allError && <DeadlinesTable tasks={allTasks} stickyHeader={false} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
