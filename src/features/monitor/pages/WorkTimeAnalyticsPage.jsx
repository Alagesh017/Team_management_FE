import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, DataTableCard } from "../../../common/components/PageLayout";
import { DataTable } from "../../../common/components/DataTable";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import monitorService, { formatDuration } from "../services/monitorService";
import { useAuth } from "../../auth/contexts/AuthContext";
import { cn, formatDate, localDateInputValue } from "../../../core/utils/utils";

const stateClass = {
  active: "bg-emerald-100 text-emerald-800",
  idle: "bg-amber-100 text-amber-900",
  break: "bg-sky-100 text-sky-900",
  locked: "bg-slate-200 text-slate-700",
  offline: "bg-slate-100 text-slate-600",
  unknown: "bg-orange-100 text-orange-900",
  ended: "bg-slate-100 text-slate-600",
};

function hasAnyTracked(summary) {
  if (!summary) return false;
  return (
    (summary.active_seconds || 0) +
      (summary.idle_seconds || 0) +
      (summary.break_seconds || 0) >
    0
  );
}

export default function WorkTimeAnalyticsPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(() => localDateInputValue());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setLoadError("");
    try {
      const res = await monitorService.getAnalyticsOverview(date);
      if (res.status === 0) {
        setLoadError(res.msg || "Could not load analytics");
        setData(null);
      } else {
        setData(res);
      }
    } catch (e) {
      console.error(e);
      setLoadError(e.response?.data?.msg || e.message || "Could not load analytics");
      setData(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), 10000);
    return () => clearInterval(id);
  }, [load]);

  const myInsightLink =
    user?.userId != null ? (
      <Link
        to={`/work-time/users/${user.userId}?date=${date}`}
        className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
      >
        My detailed insight
      </Link>
    ) : null;

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Person",
        accessorFn: (row) => row.user?.name || row.user?.email,
        cell: ({ row }) => (
          <Link
            className="font-medium text-slate-900 hover:underline block truncate max-w-[220px]"
            to={`/work-time/users/${row.original.user.user_id}?date=${date}`}
            title={row.original.user?.name || row.original.user?.email}
          >
            {row.original.user?.name || row.original.user?.email}
          </Link>
        ),
      },
      {
        id: "role",
        header: "Role",
        accessorFn: (row) => row.user?.role,
      },
      {
        id: "live_state",
        header: "Live",
        cell: ({ row }) => {
          const st = row.original.live_state || "offline";
          return (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                stateClass[st] || stateClass.unknown
              )}
            >
              {st}
            </span>
          );
        },
      },
      {
        id: "active",
        header: "Active",
        accessorFn: (row) => formatDuration(row.summary?.active_seconds),
      },
      {
        id: "idle",
        header: "Idle",
        accessorFn: (row) => formatDuration(row.summary?.idle_seconds),
      },
      {
        id: "break",
        header: "Break",
        accessorFn: (row) => formatDuration(row.summary?.break_seconds),
      },
      {
        id: "tracked",
        header: "Tracked total",
        accessorFn: (row) => formatDuration(row.summary?.tracked_seconds),
      },
    ],
    [date]
  );

  const tableData = data?.users || [];
  const anyTracked = tableData.some((r) => hasAnyTracked(r.summary));
  const isToday = date === localDateInputValue();

  return (
    <PageShell
      title="Work time analytics"
      description={
        data?.viewer_is_manager
          ? `Desktop time for ${formatDate(date + "T12:00:00")} (your local calendar day). Live column updates every 10s.`
          : `Your tracked time for ${formatDate(date + "T12:00:00")}. Start the desktop agent to record time.`
      }
      action={myInsightLink}
      className="pb-8"
    >
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-slate-500">Local date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-44" />
        </div>
        {isToday && (
          <p className="text-xs text-emerald-700 font-medium pb-2">Viewing today — includes your open session</p>
        )}
      </div>

      {loadError && (
        <p className="text-sm text-red-600 mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2">{loadError}</p>
      )}

      {!loading && data?.totals && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            ["Active", data.totals.active_seconds],
            ["Idle", data.totals.idle_seconds],
            ["Break", data.totals.break_seconds],
            ["Tracked total", data.totals.tracked_seconds],
          ].map(([label, sec]) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatDuration(sec)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DataTableCard loading={loading} className="overflow-visible">
        {!loading && tableData.length === 0 ? (
          <p className="p-8 text-sm text-slate-500 text-center">
            No people to show for this date. Check that your account role is tracked and try today&apos;s date.
          </p>
        ) : (
          <>
            {!loading && !anyTracked && (
              <p className="px-4 pt-4 text-sm text-amber-800 bg-amber-50 border-b border-amber-100">
                No tracked time yet for {formatDate(date + "T12:00:00")}. Run the desktop agent and start monitoring.
              </p>
            )}
            <DataTable
              columns={columns}
              data={tableData}
              embedded
              filterColumn="name"
              filterPlaceholder="Search people…"
              maxBodyHeight={false}
            />
          </>
        )}
      </DataTableCard>
    </PageShell>
  );
}
