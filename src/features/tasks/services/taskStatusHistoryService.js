import api from "../../../core/interceptors/axiosInterceptor";

const getSprintStatusHistory = async (sprintId) => {
  try {
    const response = await api.get(`/sprints/${sprintId}/status-history`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const taskStatusHistoryService = {
  getSprintStatusHistory,
};
