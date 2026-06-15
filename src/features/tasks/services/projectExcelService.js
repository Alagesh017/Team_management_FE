import api from "../../../core/interceptors/axiosInterceptor";

const getAllExcels = async () => {
  try {
    const response = await api.get('/project-excels');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getExcelsByProjectId = async (projectId) => {
  try {
    const response = await api.get(`/project-excels/project/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const getExcelById = async (id) => {
  try {
    const response = await api.get(`/project-excels/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const createExcel = async (excelData) => {
  try {
    const response = await api.post('/project-excels', excelData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const updateExcel = async (id, excelData) => {
  try {
    const response = await api.put(`/project-excels/${id}`, excelData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const projectExcelService = {
  getAllExcels,
  getExcelsByProjectId,
  getExcelById,
  createExcel,
  updateExcel,
};
