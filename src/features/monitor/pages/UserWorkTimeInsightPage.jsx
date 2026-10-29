import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PageShell, DataTableCard } from "../../../common/components/PageLayout";
import { Input } from "../../../common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import monitorService, { formatDuration } from "../services/monitorService";
import { cn, formatDateTime, formatSessionRange, localDateInputValue } from "../../../core/utils/utils";

const sessionStatusClass = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  idle: "bg-amber-100 text-amber-900 border-amber-200",
  break: "bg-sky-100 text-sky-900 border-sky-200",
  locked: "bg-slate-200 text-slate-800 border-slate-300",
  offline: "bg-slate-100 text-slate-600 border-slate-200",
  ended: "bg-slate-100 text-slate-700 border-slate-200",
  unknown: "bg-orange-100 text-orange-900 border-orange-200",
};

function SessionStatusBadge({ status }) {
  const key = (status || "unknown").toLowerCase();
  const label = key === "ended" ? "Ended" : key.charAt(0).toUpperCase() + key.slice(1);
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        sessionStatusClass[key] || sessionStatusClass.unknown
      )}
    >
      {label}
    </span>
  );
}

export default function UserWorkTimeInsightPage() {
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState(searchParams.get("date") || localDateInputValue());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await monitorService.getUserInsight(userId, date);
      setData(res);
    } catch (e) {
      setError(e.response?.data?.msg || "Could not load insight");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId, date]);

  useEffect(() => {
    load();
    setSearchParams({ date }, { replace: true });
  }, [load, date, setSearchParams]);

  const person = data?.user;

  return (
    <PageShell
      title={person ? `${person.name || person.email}` : "User insight"}
      description={`Work sessions and events · ${date}`}
      className="pb-10"
      action={
        <Link to={`/work-time?date=${date}`} className="text-sm text-slate-600 hover:underline shrink-0">
          ← Back to dashboard
        </Link>
      }
    >
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-44" />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Active", data?.summary?.active_seconds],
              ["Idle", data?.summary?.idle_seconds],
              ["Break", data?.summary?.break_seconds],
              ["Tracked", data?.summary?.tracked_seconds],
            ].map(([label, sec]) => (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{formatDuration(sec || 0)}</CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.sessions || []).length === 0 && (
                <p className="text-sm text-slate-500">No sessions recorded this day.</p>
              )}
              {(data?.sessions || []).map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <SessionStatusBadge status={s.ended_at ? "ended" : s.status} />
                    {!s.ended_at && s.status && (
                      <span className="text-xs text-slate-500">Last state: {s.status}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {formatSessionRange(s.started_at, s.ended_at)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Active {formatDuration(s.active_seconds)} · Idle {formatDuration(s.idle_seconds)} · Break{" "}
                    {formatDuration(s.break_seconds)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline events</CardTitle>
            </CardHeader>
            <CardContent>
              {(data?.timeline || []).every((b) => !(b.events || []).length) ? (
                <p className="text-sm text-slate-500">No events.</p>
              ) : (
                <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden bg-white">
                  {(data?.timeline || []).flatMap((block) =>
                    (block.events || []).map((ev) => (
                      <li
                        key={ev.event_uuid}
                        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-3 py-2.5 text-sm"
                      >
                        <span className="font-medium text-slate-800 capitalize">
                          {(ev.event_type || "").replace(/_/g, " ")}
                        </span>
                        <span className="text-slate-500 text-xs sm:text-sm whitespace-nowrap">
                          {formatDateTime(ev.occurred_at)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </CardContent>
          </Card>

          {(data?.app_usage || []).length > 0 && (
            <DataTableCard>
              <div className="p-4">
                <p className="font-semibold text-sm mb-2">Application usage (metadata)</p>
                <ul className="text-sm space-y-1">
                  {data.app_usage.map((a, i) => (
                    <li key={i}>
                      {a.app_name || a.app_category}: {formatDuration(a.duration_seconds)}
                    </li>
                  ))}
                </ul>
              </div>
            </DataTableCard>
          )}
        </div>
      )}
    </PageShell>
  );
}
