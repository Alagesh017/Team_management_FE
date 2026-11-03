import api from "../../../core/interceptors/axiosInterceptor";

export const getProjectSummary = async (params = {}) => {
  const response = await api.get("/dashboard/project-summary", { params });
  return response.data;
};

export const getDeadlineCrossedProjects = async () => {
  const response = await api.get("/dashboard/deadline-crossed-projects");
  return response.data;
};

export const getTaskCompletions = async (params = {}) => {
  const response = await api.get("/dashboard/task-completions", { params });
  return response.data;
};

export const getInProgressToday = async (params = {}) => {
  const response = await api.get("/dashboard/in-progress-today", { params });
  return response.data;
};

export const getProjectHealth = async () => {
  const response = await api.get("/dashboard/project-health");
  return response.data;
};

export const getTeamActivity = async (params = {}) => {
  const response = await api.get("/dashboard/team-activity", { params });
  return response.data;
};

export const getInProgressProjects = async () => {
  const response = await api.get("/dashboard/in-progress-projects");
  return response.data;
};

export const getUpcomingDeadlines = async (params = {}) => {
  const response = await api.get("/dashboard/upcoming-deadlines", { params });
  return response.data;
};

export default {
  getProjectSummary,
  getDeadlineCrossedProjects,
  getTaskCompletions,
  getInProgressToday,
  getProjectHealth,
  getTeamActivity,
  getInProgressProjects,
  getUpcomingDeadlines,
};
