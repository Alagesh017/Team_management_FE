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

const microsoftLogin = async (email) => {
  try {
    console.log("Making API call to /auth/microsoft-login with email:", email);
    const response = await api.post("/auth/microsoft-login", { email });
    console.log("API call successful, received response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API call failed:", error);
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

const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await api.post("/auth/reset-password", { email, otp, new_password: newPassword });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const authService = {
  login,
  googleLogin,
  microsoftLogin,
  register,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
