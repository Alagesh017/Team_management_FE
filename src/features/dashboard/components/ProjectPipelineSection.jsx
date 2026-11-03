import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2, PlayCircle } from "lucide-react";
import {
  DASH_PANEL,
  DASH_PANEL_BODY,
  DASH_PANEL_HEADER,
  DASH_TABLE_WRAPPER,
} from "./dashboardStyles";
import {
  useDashboardDeadlineProjects,
  useDashboardInProgressProjects,
} from "../hooks/useDashboardData";
import { formatDate } from "../../../core/utils/utils";

function ProjectListTable({ projects, variant, loading, error, emptyMessage }) {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
      </div>
    );
  }
  if (error) {
    return <p className="text-[11px] text-red-600 px-2 py-2">{error}</p>;
  }
  if (!projects.length) {
    return <p className="text-[11px] text-slate-500 text-center py-4">{emptyMessage}</p>;
  }

  return (
    <div className={DASH_TABLE_WRAPPER}>
      <table className="w-full min-w-[280px] text-[11px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            <th className="text-left text-[9px] font-semibold uppercase text-slate-500 px-2 py-1.5">
              Project
            </th>
            <th className="text-left text-[9px] font-semibold uppercase text-slate-500 px-1 py-1.5">
              End
            </th>
            <th className="text-right text-[9px] font-semibold uppercase text-slate-500 px-1 py-1.5">
              Open
            </th>
            <th className="text-right text-[9px] font-semibold uppercase text-slate-500 px-2 py-1.5">
              {variant === "overdue" ? "Overdue" : "Left"}
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
              <td className="px-2 py-1.5 font-medium max-w-[140px] truncate">
                <Link to={`/projects/${p.id}`} className="text-blue-600 hover:underline" title={p.name}>
                  {p.name}
                </Link>
              </td>
              <td className="px-1 py-1.5 text-slate-600 whitespace-nowrap">
                {p.end_date ? formatDate(p.end_date) : "—"}
              </td>
              <td className="px-1 py-1.5 text-right tabular-nums text-slate-700">{p.open_tasks ?? 0}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-semibold">
                {variant === "overdue" ? (
                  <span className="text-red-600">{p.days_overdue}d</span>
                ) : p.days_remaining != null ? (
                  <span className="text-indigo-600">{p.days_remaining}d</span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProjectPipelineSection() {
  const overdue = useDashboardDeadlineProjects();
  const inProgress = useDashboardInProgressProjects();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className={DASH_PANEL + " flex flex-col min-h-0"}>
        <div className={DASH_PANEL_HEADER + " flex items-center gap-2 py-2.5"}>
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Pending — past end date</h2>
            <p className="text-[10px] text-slate-500">Not completed; project end date has passed</p>
          </div>
        </div>
        <div className={DASH_PANEL_BODY + " p-0 flex-1 max-h-[220px] overflow-y-auto"}>
          <ProjectListTable
            projects={overdue.projects}
            variant="overdue"
            loading={overdue.loading}
            error={overdue.error}
            emptyMessage="No overdue projects."
          />
        </div>
      </div>

      <div className={DASH_PANEL + " flex flex-col min-h-0"}>
        <div className={DASH_PANEL_HEADER + " flex items-center gap-2 py-2.5"}>
          <PlayCircle className="h-4 w-4 text-indigo-500 shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">In progress projects</h2>
            <p className="text-[10px] text-slate-500">Active projects still within end date</p>
          </div>
        </div>
        <div className={DASH_PANEL_BODY + " p-0 flex-1 max-h-[220px] overflow-y-auto"}>
          <ProjectListTable
            projects={inProgress.projects}
            variant="active"
            loading={inProgress.loading}
            error={inProgress.error}
            emptyMessage="No active in-progress projects."
          />
        </div>
      </div>
    </div>
  );
}
