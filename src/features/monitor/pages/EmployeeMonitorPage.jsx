import React, { useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../../common/components/PageLayout";
import { Button } from "../../../common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../common/components/ui/card";
import {
  clearMonitorPairingSession,
  loadMonitorPairingSession,
  saveMonitorPairingSession,
  signalMonitorAgentUnpair,
} from "../monitorSessionSync";
import { useToast } from "../../../common/hooks/use-toast";
import { useAuth } from "../../auth/contexts/AuthContext";
import { formatDateTime } from "../../../core/utils/utils";
import {
  BarChart3,
  Copy,
  ExternalLink,
  Laptop,
  Shield,
  Timer,
  Zap,
  Coffee,
  Moon,
} from "lucide-react";
import monitorService, { formatDuration } from "../services/monitorService";

const PROTOCOL = "educermonitor://start";

const MANAGER_ROLES = ["superadmin", "admin", "scrum", "team_leader"];

export default function EmployeeMonitorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pairingCode, setPairingCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(false);

  const canPair = Boolean(user?.role);
  const isManager = MANAGER_ROLES.includes(user?.role);

  const loadToday = useCallback(async () => {
    try {
      const data = await monitorService.getMyToday();
      setToday(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const saved = loadMonitorPairingSession();
    const expMs = saved.expiresAt ? new Date(saved.expiresAt).getTime() : 0;
    if (saved.pairingCode && expMs && expMs <= Date.now()) {
      clearMonitorPairingSession();
      setPairingCode("");
      setExpiresAt("");
      return;
    }
    setPairingCode(saved.pairingCode);
    setExpiresAt(saved.expiresAt);
  }, [user?.userId]);

  useEffect(() => {
    loadToday();
    const id = setInterval(loadToday, 10000);
    return () => clearInterval(id);
  }, [loadToday]);

  const generateCode = async () => {
    setLoading(true);
    try {
      const data = await monitorService.createPairingCode();
      setPairingCode(data.pairing_code);
      setExpiresAt(data.expires_at);
      saveMonitorPairingSession(data.pairing_code, data.expires_at);
      toast({
        title: "Pairing code created",
        description:
          "Enter this code in the desktop agent within 30 minutes. Older codes from this account no longer work.",
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Could not create code",
        description: e.response?.data?.msg || e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!pairingCode) return;
    try {
      await navigator.clipboard.writeText(pairingCode);
      toast({ title: "Copied", description: "Pairing code copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: pairingCode, variant: "destructive" });
    }
  };

  const resetAgentPairing = async () => {
    try {
      await monitorService.revokeMyDevices();
    } catch (_) {
      /* still unpair locally */
    }
    clearMonitorPairingSession();
    setPairingCode("");
    setExpiresAt("");
    signalMonitorAgentUnpair();
    toast({
      title: "Agent reset",
      description: "Desktop agent will ask for a new pairing code. Generate one below.",
    });
  };

  const openAgent = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = PROTOCOL;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 2000);
    toast({
      title: "Launching desktop agent",
      description: "If nothing opens, run Employee Monitor Agent from the Start menu and pair manually.",
    });
  };

  const activeMin = today?.summary ? Math.round(today.summary.active_seconds / 60) : 0;
  const idleMin = today?.summary ? Math.round(today.summary.idle_seconds / 60) : 0;
  const breakMin = today?.summary ? Math.round(today.summary.break_seconds / 60) : 0;
  const hasToday = Boolean(today?.summary && (activeMin || idleMin || breakMin));

  return (
    <PageShell
      title="Activity Monitor"
      description="Pair your PC, run the desktop agent, and view transparent session tracking"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {canPair && (
            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400" />
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 text-white">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Desktop agent setup</CardTitle>
                    <CardDescription className="mt-1">
                      One-time pairing per computer. All roles can track work time (admin, scrum, workers, team
                      leaders).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <ol className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      1
                    </span>
                    <span>Generate a pairing code below (valid for a short time).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      2
                    </span>
                    <span>Open the agent → enter the code → click Start monitoring.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      3
                    </span>
                    <span>Keep the agent running while you work; idle is detected after ~30 seconds without input.</span>
                  </li>
                </ol>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={generateCode} disabled={loading}>
                    {loading ? "Generating…" : "Generate pairing code"}
                  </Button>
                  <Button variant="outline" onClick={openAgent}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open desktop agent
                  </Button>
                  <Button variant="secondary" type="button" onClick={resetAgentPairing}>
                    Pair again / reset agent
                  </Button>
                </div>

                {pairingCode && (
                  <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Your code</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-2xl sm:text-3xl font-mono font-bold tracking-[0.35em] text-slate-900">
                        {pairingCode}
                      </p>
                      <Button type="button" variant="secondary" size="sm" onClick={copyCode}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    {expiresAt && (
                      <p className="text-xs text-slate-500 mt-2">
                        Expires {formatDateTime(expiresAt)}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-500">
                  Desktop agent must use the same API as this site (
                  <code className="bg-slate-100 px-1 rounded text-[11px]">
                    {import.meta.env.VITE_API_URL || "VITE_API_URL"}
                  </code>
                  ). Set <code className="bg-slate-100 px-1 rounded">MONITOR_API_URL</code> in{" "}
                  <code className="bg-slate-100 px-1 rounded">employee-monitor-agent/.env</code> to match, then
                  restart the agent.
                </p>

                <p className="text-xs text-slate-500">
                  Launch link uses <code className="bg-slate-100 px-1 rounded">{PROTOCOL}</code> — no passwords or
                  tokens in the URL.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-700" />
                <CardTitle>Monitoring policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <p>
                We collect session metadata only: active, idle, locked, break, and offline states; timestamps; optional
                foreground app names.
              </p>
              <p className="font-medium text-slate-800">We never collect keystrokes, passwords, clipboard, messages, or screen recordings.</p>
              <p>
                If the agent stops sending heartbeats, live status shows as unknown — not automatically marked idle.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Today
              </CardTitle>
              <CardDescription>From desktop agent heartbeats</CardDescription>
            </CardHeader>
            <CardContent>
              {hasToday ? (
                <ul className="space-y-3">
                  <li className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm text-emerald-900">
                      <Zap className="h-4 w-4" /> Active
                    </span>
                    <span className="font-semibold text-emerald-900">{formatDuration(today.summary.active_seconds)}</span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm text-amber-900">
                      <Moon className="h-4 w-4" /> Idle
                    </span>
                    <span className="font-semibold text-amber-900">{formatDuration(today.summary.idle_seconds)}</span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg bg-sky-50 border border-sky-100 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm text-sky-900">
                      <Coffee className="h-4 w-4" /> Break
                    </span>
                    <span className="font-semibold text-sky-900">{formatDuration(today.summary.break_seconds)}</span>
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-slate-500 py-4 text-center">
                  No tracked time yet today. Pair the agent and start monitoring.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link
                to="/work-time"
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-900">Work time dashboard</span>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </Link>
              {isManager && (
                <Link
                  to="/monitor/live"
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-900">Live team monitoring</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
