import api from "../../../core/interceptors/axiosInterceptor";

const getAllWorkers = async () => {
  try {
    const response = await api.get("/workers/");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getWorkerById = async (id) => {
  try {
    const response = await api.get(`/workers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createWorker = async (workerData) => {
  try {
    const response = await api.post("/workers/", workerData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateWorker = async (id, workerData) => {
  try {
    const response = await api.put(`/workers/${id}`, workerData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteWorker = async (id) => {
  try {
    const response = await api.delete(`/workers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const workerService = {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
};
