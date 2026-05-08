import axiosInstance from "../../../core/interceptors/axiosInterceptor";

export const taskService = {
  getTasksByProject: async (projectId) => {
    const response = await axiosInstance.get(`/tasks/project/${projectId}`);
    return response.data;
  },
  createTask: async (taskData) => {
    const response = await axiosInstance.post("/tasks/", taskData);
    return response.data;
  },
  updateTask: async (taskId, taskData) => {
    const response = await axiosInstance.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },
  deleteTask: async (taskId) => {
    const response = await axiosInstance.delete(`/tasks/${taskId}`);
    return response.data;
  },
};
