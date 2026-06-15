import api from "../../../core/interceptors/axiosInterceptor";

const getAllTaskStatuses = async () => {
  try {
    const response = await api.get("/task-statuses/");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getTaskStatusById = async (id) => {
  try {
    const response = await api.get(`/task-statuses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createTaskStatus = async (statusData) => {
  try {
    const response = await api.post("/task-statuses/", statusData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateTaskStatus = async (id, statusData) => {
  try {
    const response = await api.put(`/task-statuses/${id}`, statusData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteTaskStatus = async (id) => {
  try {
    const response = await api.delete(`/task-statuses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const reorderTaskStatuses = async (statuses) => {
  try {
    const response = await api.put("/task-statuses/reorder", { statuses });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const taskStatusService = {
  getAllTaskStatuses,
  getTaskStatusById,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
  reorderTaskStatuses,
};
