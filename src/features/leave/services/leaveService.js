import api from "../../../core/interceptors/axiosInterceptor";

const getMyLeaves = async () => {
  try {
    const response = await api.get("/leave/my");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getAllLeaves = async () => {
  try {
    const response = await api.get("/leave/");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getLeaveById = async (id) => {
  try {
    const response = await api.get(`/leave/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createLeave = async (data) => {
  try {
    const response = await api.post("/leave/", data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const reviewLeave = async (id, data) => {
  try {
    const response = await api.put(`/leave/${id}/review`, data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const cancelLeave = async (id) => {
  try {
    const response = await api.put(`/leave/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteLeave = async (id) => {
  try {
    const response = await api.delete(`/leave/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const uploadAttachment = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/leave/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const leaveService = {
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  createLeave,
  reviewLeave,
  cancelLeave,
  deleteLeave,
  uploadAttachment,
};
