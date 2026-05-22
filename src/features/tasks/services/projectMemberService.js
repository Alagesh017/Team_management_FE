import api from "../../../core/interceptors/axiosInterceptor";

const getProjectMembers = async (projectId) => {
  try {
    const response = await api.get(`/project-members/project/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const projectMemberService = {
  getProjectMembers,
};
