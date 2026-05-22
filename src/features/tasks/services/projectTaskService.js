import api from "../../../core/interceptors/axiosInterceptor";

const getProjectTaskData = async (projectId) => {
  try {
    const response = await api.get(`/project-tasks/project/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const projectTaskService = {
  getProjectTaskData,
};
