import api from "../../../core/interceptors/axiosInterceptor";

const getAllAllocations = async () => {
  try {
    const response = await api.get("/project-allocations/");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getAllocationById = async (id) => {
  try {
    const response = await api.get(`/project-allocations/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getAllocationByProjectId = async (projectId) => {
  try {
    const response = await api.get(`/project-allocations/project/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createAllocation = async (allocationData) => {
  try {
    const response = await api.post("/project-allocations/", allocationData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateAllocation = async (id, allocationData) => {
  try {
    const response = await api.put(`/project-allocations/${id}`, allocationData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteAllocation = async (id) => {
  try {
    const response = await api.delete(`/project-allocations/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateAllocationMembers = async (id, members) => {
  try {
    const response = await api.put(`/project-allocations/${id}/members`, { members });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const allocationService = {
  getAllAllocations,
  getAllocationById,
  getAllocationByProjectId,
  createAllocation,
  updateAllocation,
  updateAllocationMembers,
  deleteAllocation,
};
