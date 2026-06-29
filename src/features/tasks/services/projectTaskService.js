import api from "../../../core/interceptors/axiosInterceptor";

const getProjectTaskData = async (projectId, sprintId) => {
  try {
    let url = `/project-tasks/project/${projectId}`;
    if (sprintId) {
      url += `?sprintId=${sprintId}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const projectTaskService = {
  getProjectTaskData,
};
