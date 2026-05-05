import api from "../../../core/interceptors/axiosInterceptor";

const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const googleLogin = async (email) => {
  try {
    const response = await api.post("/auth/google-login", { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const refreshToken = async (token) => {
  try {
    const response = await api.post("/auth/refresh", {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const authService = {
  login,
  googleLogin,
  register,
  refreshToken,
};
