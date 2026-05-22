import api from "../../../core/interceptors/axiosInterceptor";

const getAllTasks = async () => {
  try {
    const response = await api.get("/tasks/");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getTasksByProjectId = async (projectId) => {
  try {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getTaskById = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createTask = async (taskData) => {
  try {
    const response = await api.post("/tasks/", taskData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const taskService = {
  getAllTasks,
  getTasksByProjectId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
