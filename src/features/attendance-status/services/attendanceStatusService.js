import api from "../../../core/interceptors/axiosInterceptor";

const getAllAttendanceStatuses = async () => {
  try {
    const response = await api.get("/attendance-statuses/");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getAttendanceStatusById = async (id) => {
  try {
    const response = await api.get(`/attendance-statuses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createAttendanceStatus = async (statusData) => {
  try {
    const response = await api.post("/attendance-statuses/", statusData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateAttendanceStatus = async (id, statusData) => {
  try {
    const response = await api.put(`/attendance-statuses/${id}`, statusData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const deleteAttendanceStatus = async (id) => {
  try {
    const response = await api.delete(`/attendance-statuses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const attendanceStatusService = {
  getAllAttendanceStatuses,
  getAttendanceStatusById,
  createAttendanceStatus,
  updateAttendanceStatus,
  deleteAttendanceStatus,
};
