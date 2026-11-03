import React, { createContext, useContext, useMemo, useState } from "react";

const DashboardFiltersContext = createContext(null);

export const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "custom", label: "Custom range" },
];

export function DashboardFiltersProvider({ children }) {
  const [projectId, setProjectId] = useState("all");
  const [range, setRange] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [completionYear, setCompletionYear] = useState(() => new Date().getFullYear());

  const summaryParams = useMemo(() => {
    const params = { range };
    if (projectId && projectId !== "all") {
      params.project_id = projectId;
    }
    if (range === "custom") {
      if (customStart) params.start_date = customStart;
      if (customEnd) params.end_date = customEnd;
    }
    return params;
  }, [projectId, range, customStart, customEnd]);

  const completionParams = useMemo(() => {
    const params = { year: completionYear };
    if (projectId && projectId !== "all") {
      params.project_id = projectId;
    }
    return params;
  }, [completionYear, projectId]);

  const inProgressParams = useMemo(() => {
    if (projectId && projectId !== "all") {
      return { project_id: projectId };
    }
    return {};
  }, [projectId]);

  const deadlineParams = useMemo(() => {
    if (projectId && projectId !== "all") {
      return { project_id: projectId, limit: 10 };
    }
    return { limit: 10 };
  }, [projectId]);

  const value = useMemo(
    () => ({
      projectId,
      setProjectId,
      range,
      setRange,
      customStart,
      setCustomStart,
      customEnd,
      setCustomEnd,
      completionYear,
      setCompletionYear,
      summaryParams,
      completionParams,
      inProgressParams,
      deadlineParams,
    }),
    [projectId, range, customStart, customEnd, completionYear, summaryParams, completionParams, inProgressParams, deadlineParams]
  );

  return (
    <DashboardFiltersContext.Provider value={value}>{children}</DashboardFiltersContext.Provider>
  );
}

export function useDashboardFilters() {
  const ctx = useContext(DashboardFiltersContext);
  if (!ctx) {
    throw new Error("useDashboardFilters must be used within DashboardFiltersProvider");
  }
  return ctx;
}

export function useDashboardFiltersOptional() {
  return useContext(DashboardFiltersContext);
}
