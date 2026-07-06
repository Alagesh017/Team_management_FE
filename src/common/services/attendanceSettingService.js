import api from "../../core/interceptors/axiosInterceptor";

export const attendanceSettingService = {
  getSettings: async () => {
    try {
      const response = await api.get("/attendance-settings/");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network error");
    }
  },
  
  saveSettings: async (data) => {
    try {
      const response = await api.post("/attendance-settings/", data);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Network error");
    }
  }
};