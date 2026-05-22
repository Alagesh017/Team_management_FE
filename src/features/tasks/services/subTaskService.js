import api from "../../../core/interceptors/axiosInterceptor";

const getSubTasksByTaskId = async (taskId) => {
  try {
    const response = await api.get(`/sub-tasks/task/${taskId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createSubTask = async (subTaskData) => {
  try {
    const response = await api.post("/sub-tasks/", subTaskData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateSubTask = async (id, subTaskData) => {
  try {
    const response = await api.put(`/sub-tasks/${id}`, subTaskData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteSubTask = async (id) => {
  try {
    const response = await api.delete(`/sub-tasks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const subTaskService = {
  getSubTasksByTaskId,
  createSubTask,
  updateSubTask,
  deleteSubTask,
};
