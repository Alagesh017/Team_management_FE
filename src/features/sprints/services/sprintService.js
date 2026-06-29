import api from "../../../core/interceptors/axiosInterceptor";

const getAllSprints = async (params = {}) => {
  try {
    const response = await api.get("/sprints/", { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getSprintById = async (id) => {
  try {
    const response = await api.get(`/sprints/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createSprint = async (sprintData) => {
  try {
    const response = await api.post("/sprints/", sprintData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateSprint = async (id, sprintData) => {
  try {
    const response = await api.put(`/sprints/${id}`, sprintData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteSprint = async (id) => {
  try {
    const response = await api.delete(`/sprints/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const startSprint = async (id) => {
  try {
    const response = await api.post(`/sprints/${id}/start`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const endSprint = async (id) => {
  try {
    const response = await api.post(`/sprints/${id}/end`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const startSprintWithMove = async (newSprintId, currentActiveSprintId) => {
  try {
    const response = await api.post(`/sprints/${newSprintId}/start-with-move`, {
      current_active_sprint_id: currentActiveSprintId,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const sprintService = {
  getAllSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  endSprint,
  startSprintWithMove,
};
