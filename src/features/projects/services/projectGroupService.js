import api from "../../../core/interceptors/axiosInterceptor";

const getAllGroups = async () => {
  try {
    const response = await api.get("/project-groups/");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getGroupById = async (id) => {
  try {
    const response = await api.get(`/project-groups/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createGroup = async (groupData) => {
  try {
    const response = await api.post("/project-groups/", groupData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateGroup = async (id, groupData) => {
  try {
    const response = await api.put(`/project-groups/${id}`, groupData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteGroup = async (id) => {
  try {
    const response = await api.delete(`/project-groups/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const projectGroupService = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};
