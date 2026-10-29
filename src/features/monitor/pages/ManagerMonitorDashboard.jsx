import React, { useEffect, useMemo, useState } from "react";
import { PageShell, DataTableCard } from "../../../common/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../common/components/ui/card";
import monitorService, { formatDuration } from "../services/monitorService";
import { DataTable } from "../../../common/components/DataTable";
import { useAuth } from "../../auth/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { formatDateTime } from "../../../core/utils/utils";
import { Activity, Coffee, HelpCircle, Monitor, Moon, WifiOff } from "lucide-react";

const MANAGER_ROLES = ["superadmin", "admin", "scrum", "team_leader"];

const STATE_META = {
  active: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Icon: Activity,
  },
  idle: {
    label: "Idle",
    className: "bg-amber-100 text-amber-900 border-amber-200",
    Icon: Moon,
  },
  locked: {
    label: "Locked",
    className: "bg-slate-200 text-slate-800 border-slate-300",
    Icon: Monitor,
  },
  break: {
    label: "Break",
    className: "bg-sky-100 text-sky-900 border-sky-200",
    Icon: Coffee,
  },
  offline: {
    label: "Offline",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    Icon: WifiOff,
  },
  unknown: {
    label: "Unknown",
    className: "bg-violet-100 text-violet-800 border-violet-200",
    Icon: HelpCircle,
  },
};

function LiveStateBadge({ state }) {
  const key = (state || "unknown").toLowerCase();
  const meta = STATE_META[key] || STATE_META.unknown;
  const { Icon } = meta;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}

export default function ManagerMonitorDashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [asOf, setAsOf] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!MANAGER_ROLES.includes(user?.role)) return;
    let mounted = true;
    const load = async () => {
      try {
        const data = await monitorService.getManagerLive();
        if (!mounted) return;
        setRows(data.employees || []);
        setAsOf(data.as_of);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [user?.role]);

  const counts = useMemo(() => {
    const c = { active: 0, idle: 0, break: 0, other: 0 };
    rows.forEach((r) => {
      const s = (r.live_state || "unknown").toLowerCase();
      if (s === "active") c.active += 1;
      else if (s === "idle" || s === "locked") c.idle += 1;
      else if (s === "break") c.break += 1;
      else c.other += 1;
    });
    return c;
  }, [rows]);

  if (!MANAGER_ROLES.includes(user?.role)) {
    return <Navigate to="/404" replace />;
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900">
            {row.original.employee?.name || row.original.employee?.email || "—"}
          </p>
          {row.original.employee?.email && row.original.employee?.name && (
            <p className="text-xs text-slate-500">{row.original.employee.email}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "live_state",
      header: "State",
      cell: ({ getValue }) => <LiveStateBadge state={getValue()} />,
    },
    {
      accessorKey: "session_duration_seconds",
      header: "Session",
      cell: ({ getValue }) => formatDuration(getValue() || 0),
    },
    {
      accessorKey: "last_heartbeat_at",
      header: "Last heartbeat",
      cell: ({ getValue }) => (
        <span className="text-sm text-slate-700 whitespace-nowrap">{formatDateTime(getValue())}</span>
      ),
    },
    {
      accessorKey: "device_last_seen_at",
      header: "Device seen",
      cell: ({ getValue }) => (
        <span className="text-sm text-slate-600 whitespace-nowrap">{formatDateTime(getValue())}</span>
      ),
    },
  ];

  const tableData = rows.map((r) => ({
    ...r,
    name: r.employee?.name,
  }));

  const refreshedLabel = asOf ? formatDateTime(asOf) : "—";

  return (
    <PageShell
      title="Live monitoring"
      description={`Refreshes every 10 seconds · Last updated ${refreshedLabel}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <Card className="border-emerald-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active now</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-700">{counts.active}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Idle / locked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-700">{counts.idle}</p>
          </CardContent>
        </Card>
        <Card className="border-sky-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">On break</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-sky-700">{counts.break}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Offline / unknown</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-700">{counts.other}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Team activity</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Tracked presence only — not task completion.{" "}
              <Link to="/work-time" className="text-slate-900 underline font-medium">
                Work time analytics
              </Link>
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500 py-8 text-center">Loading live data…</p>
          ) : tableData.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No tracked employees yet.</p>
          ) : (
            <DataTableCard>
              <DataTable columns={columns} data={tableData} embedded />
            </DataTableCard>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
