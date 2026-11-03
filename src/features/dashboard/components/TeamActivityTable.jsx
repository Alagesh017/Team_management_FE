import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { UserAvatar } from "../../../common/components/UserAvatar";
import { Button } from "../../../common/components/ui/button";
import {
  DASH_PANEL,
  DASH_PANEL_BODY,
  DASH_PANEL_HEADER,
  DASH_TABLE_TEAM,
  DASH_TABLE_WRAPPER,
  TEAM_ACTIVITY_PREVIEW,
} from "./dashboardStyles";
import { useDashboardTeamActivity } from "../hooks/useDashboardData";
import { useDashboardFilters } from "../contexts/DashboardFiltersContext";
import { cn } from "../../../core/utils/utils";

export default function TeamActivityTable({ compact = false, className }) {
  const { summaryParams, projectId, range } = useDashboardFilters();
  const { data, loading, error } = useDashboardTeamActivity(summaryParams);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [projectId, range]);

  const members = useMemo(() => {
    const list = [...(data?.members || [])];
    list.sort((a, b) => (b.assigned ?? 0) - (a.assigned ?? 0));
    return list;
  }, [data?.members]);

  const visible = showAll ? members : members.slice(0, TEAM_ACTIVITY_PREVIEW);
  const hasMore = members.length > TEAM_ACTIVITY_PREVIEW;

  return (
    <div className={cn(DASH_PANEL, compact && "flex flex-col flex-1 min-h-0", className)}>
      <div className={DASH_PANEL_HEADER + " flex items-center justify-between gap-2"}>
        <h2 className="text-sm font-semibold text-slate-900">Team activity</h2>
        {hasMore && (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs font-medium text-blue-600"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show less" : `View all (${members.length}) →`}
          </Button>
        )}
      </div>
      <div className={cn(DASH_PANEL_BODY, "p-0", DASH_TABLE_WRAPPER)}>
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
          </div>
        )}
        {error && !loading && <p className="text-[11px] text-red-600 px-2.5 py-2">{error}</p>}
        {!loading && !error && (
          <table className={DASH_TABLE_TEAM}>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="text-left text-[9px] font-semibold uppercase text-slate-500 px-2 py-1.5 w-[38%]">
                  Member
                </th>
                <th className="text-right text-[9px] font-semibold uppercase text-slate-500 px-1 py-1.5 w-[12%]">
                  Asgn
                </th>
                <th className="text-right text-[9px] font-semibold uppercase text-slate-500 px-1 py-1.5 w-[12%]">
                  Done
                </th>
                <th className="text-right text-[9px] font-semibold uppercase text-slate-500 px-1 py-1.5 w-[12%]">
                  Late
                </th>
                <th className="text-left text-[9px] font-semibold uppercase text-slate-500 px-2 py-1.5 w-[26%]">
                  Load
                </th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[11px] text-slate-500 py-4">
                    No team activity for this period.
                  </td>
                </tr>
              )}
              {visible.map((m) => {
                const name = [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email || "—";
                return (
                  <tr key={`${m.role}-${m.user_id}`} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-2 py-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <UserAvatar
                          url={m.avatar_url}
                          email={m.email}
                          firstName={m.first_name}
                          lastName={m.last_name}
                          className={cn(compact ? "h-6 w-6" : "h-7 w-7", "shrink-0")}
                        />
                        <span className="font-medium text-slate-800 truncate">{name}</span>
                      </div>
                    </td>
                    <td className="text-right px-2 py-1.5 font-semibold text-slate-800">{m.assigned}</td>
                    <td className="text-right px-2 py-1.5 font-medium text-emerald-600">{m.completed}</td>
                    <td className="text-right px-2 py-1.5 font-medium text-red-600">{m.overdue}</td>
                    <td className="px-2 py-1.5 min-w-0">
                      <div className="flex items-center gap-1 min-w-0">
                        <div className="flex-1 min-w-0 h-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${m.workload ?? 0}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-medium text-slate-600 w-6 shrink-0 text-right tabular-nums">
                          {m.workload ?? 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
