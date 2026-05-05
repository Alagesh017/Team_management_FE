import api from "../../../core/interceptors/axiosInterceptor";

const getAllClients = async () => {
  try {
    const response = await api.get("/clients/");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getClientById = async (id) => {
  try {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createClient = async (clientData) => {
  try {
    const response = await api.post("/clients/", clientData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateClient = async (id, clientData) => {
  try {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteClient = async (id) => {
  try {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const clientService = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
