import api from "../../../core/interceptors/axiosInterceptor";

const getAllAdmins = async () => {
  try {
    const response = await api.get("/admins/");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getAdminById = async (id) => {
  try {
    const response = await api.get(`/admins/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createAdmin = async (adminData) => {
  try {
    const response = await api.post("/admins/", adminData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateAdmin = async (id, adminData) => {
  try {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteAdmin = async (id) => {
  try {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const adminService = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
