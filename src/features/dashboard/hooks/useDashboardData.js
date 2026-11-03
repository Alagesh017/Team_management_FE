import { useCallback, useEffect, useState } from "react";
import dashboardService from "../services/dashboardService";

export function useDashboardProjectSummary(summaryParams, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    if (!enabled) return;
    if (summaryParams.range === "custom" && (!summaryParams.start_date || !summaryParams.end_date)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getProjectSummary(summaryParams);
      if (res.status === 1) setData(res);
      else setError(res.error || "Failed to load summary");
    } catch (e) {
      setError(e?.error || e?.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  }, [summaryParams, enabled]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, refetch: fetchSummary };
}

export function useDashboardCompletions(completionParams) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getTaskCompletions(completionParams);
      if (res.status === 1) setData(res);
      else setError(res.error || "Failed to load completions");
    } catch (e) {
      setError(e?.error || e?.message || "Failed to load completions");
    } finally {
      setLoading(false);
    }
  }, [completionParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useDashboardProjectHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getProjectHealth();
      if (res.status === 1) setData(res);
      else setError(res.error || "Failed to load project health");
    } catch (e) {
      setError(e?.error || e?.message || "Failed to load project health");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useDashboardTeamActivity(summaryParams) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (summaryParams.range === "custom" && (!summaryParams.start_date || !summaryParams.end_date)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getTeamActivity(summaryParams);
      if (res.status === 1) setData(res);
      else setError(res.error || "Failed to load team activity");
    } catch (e) {
      setError(e?.error || e?.message || "Failed to load team activity");
    } finally {
      setLoading(false);
    }
  }, [summaryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useDashboardUpcomingDeadlines(deadlineParams) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getUpcomingDeadlines(deadlineParams);
      if (res.status === 1) setData(res);
      else setError(res.error || "Failed to load deadlines");
    } catch (e) {
      setError(e?.error || e?.message || "Failed to load deadlines");
    } finally {
      setLoading(false);
    }
  }, [deadlineParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useDashboardDeadlineProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getDeadlineCrossedProjects();
      if (res.status === 1) setProjects(res.projects || []);
      else setError(res.error || "Failed to load overdue projects");
    } catch (e) {
      setError(e?.error || e?.message || "Failed to load overdue projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { projects, loading, error, refetch: fetchData };
}

export function useDashboardInProgressProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getInProgressProjects();
      if (res.status === 1) setProjects(res.projects || []);
      else setError(res.error || "Failed to load in-progress projects");
    } catch (e) {
      setError(e?.error || e?.message || "Failed to load in-progress projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { projects, loading, error, refetch: fetchData };
}
