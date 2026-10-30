import React, { useCallback, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../../common/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../common/components/ui/card";
import { signalMonitorAgentUnpair } from "../monitorSessionSync";
import { useToast } from "../../../common/hooks/use-toast";
import { useAuth } from "../../auth/contexts/AuthContext";
import { BarChart3, ExternalLink, Shield, Timer, Zap, Coffee, Moon, Monitor } from "lucide-react";
import monitorService, { formatDuration } from "../services/monitorService";
import { getMonitorAgentBridge, isTeamManagerDesktop } from "../desktopBridge";
import BuiltInMonitorPanel from "../components/BuiltInMonitorPanel";

const MANAGER_ROLES = ["superadmin", "admin", "scrum", "team_leader"];

export default function EmployeeMonitorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [today, setToday] = useState(null);
  const [agentState, setAgentState] = useState(null);
  const [monitorBusy, setMonitorBusy] = useState(false);
  const autoSetupDone = useRef(false);

  const isDesktopApp = isTeamManagerDesktop();
  const monitorBridge = getMonitorAgentBridge();
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
    loadToday();
    const id = setInterval(loadToday, 10000);
    return () => clearInterval(id);
  }, [loadToday]);

  useEffect(() => {
    if (!monitorBridge) return undefined;
    let cancelled = false;
    monitorBridge
      .getState()
      .then((s) => {
        if (!cancelled) setAgentState(s);
      })
      .catch(() => {});
    const off = monitorBridge.onStateUpdate((s) => setAgentState(s));
    return () => {
      cancelled = true;
      off?.();
    };
  }, [monitorBridge]);

  const ensureMonitoringReady = useCallback(async () => {
    if (!monitorBridge) return;
    setMonitorBusy(true);
    try {
      let state = await monitorBridge.getState();
      if (!state.devicePaired) {
        const data = await monitorService.createPairingCode();
        await monitorBridge.pairDevice(data.pairing_code);
        state = await monitorBridge.getState();
      }
      if (!state.monitoring) {
        await monitorBridge.startMonitoring({});
      }
    } catch (e) {
      toast({
        title: "Could not start tracking",
        description: e.message || String(e),
        variant: "destructive",
      });
    } finally {
      setMonitorBusy(false);
    }
  }, [monitorBridge, toast]);

  useEffect(() => {
    if (!isDesktopApp || !monitorBridge || autoSetupDone.current) return;
    autoSetupDone.current = true;
    ensureMonitoringReady();
  }, [isDesktopApp, monitorBridge, ensureMonitoringReady]);

  const handleStart = async () => {
    if (!monitorBridge) return;
    setMonitorBusy(true);
    try {
      if (!(await monitorBridge.getState())?.devicePaired) {
        await ensureMonitoringReady();
        return;
      }
      await monitorBridge.startMonitoring({});
    } catch (e) {
      toast({ title: "Start failed", description: e.message, variant: "destructive" });
    } finally {
      setMonitorBusy(false);
    }
  };

  const handleStop = async () => {
    if (!monitorBridge) return;
    setMonitorBusy(true);
    try {
      await monitorBridge.stopMonitoring();
    } finally {
      setMonitorBusy(false);
    }
  };

  const handleStartBreak = async () => {
    if (!monitorBridge) return;
    await monitorBridge.startBreak();
  };

  const handleEndBreak = async () => {
    if (!monitorBridge) return;
    await monitorBridge.endBreak();
  };

  const handleReset = async () => {
    try {
      await monitorService.revokeMyDevices();
    } catch (_) {
      /* ignore */
    }
    signalMonitorAgentUnpair();
    autoSetupDone.current = false;
    toast({ title: "Device reset", description: "Starting fresh pairing…" });
    await ensureMonitoringReady();
  };

  const activeMin = today?.summary ? Math.round(today.summary.active_seconds / 60) : 0;
  const idleMin = today?.summary ? Math.round(today.summary.idle_seconds / 60) : 0;
  const breakMin = today?.summary ? Math.round(today.summary.break_seconds / 60) : 0;
  const hasToday = Boolean(today?.summary && (activeMin || idleMin || breakMin));

  return (
    <PageShell
      title="Activity Monitor"
      description={
        isDesktopApp
          ? "Built-in tracking — live timers and session controls in this app"
          : "Open Dce task manager desktop app for built-in activity tracking"
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {isDesktopApp && monitorBridge ? (
            <BuiltInMonitorPanel
              agentState={agentState}
              onStart={handleStart}
              onStop={handleStop}
              onStartBreak={handleStartBreak}
              onEndBreak={handleEndBreak}
              onReset={handleReset}
              busy={monitorBusy}
            />
          ) : (
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 text-white">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Desktop app required</CardTitle>
                    <CardDescription className="mt-1">
                      Activity tracking runs inside the Dce task manager desktop application — not in the browser and not
                      via a separate agent.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Install or run <strong>Dce task manager</strong> from your desktop build, then open Activity Monitor here
                for live timers, break controls, and automatic tracking.
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
              <p className="font-medium text-slate-800">
                We never collect keystrokes, passwords, clipboard, messages, or screen recordings.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Today (server)
              </CardTitle>
              <CardDescription>Synced from heartbeats</CardDescription>
            </CardHeader>
            <CardContent>
              {hasToday ? (
                <ul className="space-y-3">
                  <li className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm text-emerald-900">
                      <Zap className="h-4 w-4" /> Active
                    </span>
                    <span className="font-semibold text-emerald-900">
                      {formatDuration(today.summary.active_seconds)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm text-amber-900">
                      <Moon className="h-4 w-4" /> Idle
                    </span>
                    <span className="font-semibold text-amber-900">
                      {formatDuration(today.summary.idle_seconds)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg bg-sky-50 border border-sky-100 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm text-sky-900">
                      <Coffee className="h-4 w-4" /> Break
                    </span>
                    <span className="font-semibold text-sky-900">
                      {formatDuration(today.summary.break_seconds)}
                    </span>
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-slate-500 py-4 text-center">
                  {isDesktopApp ? "Start monitoring to see totals here." : "Use the desktop app to track time."}
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
