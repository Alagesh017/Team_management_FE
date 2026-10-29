import api from "../../../core/interceptors/axiosInterceptor";

const getMyProfile = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};

const updateMyProfile = async (payload) => {
  const response = await api.put("/profile/me", payload);
  return response.data;
};

const completeOnboarding = async () => {
  const response = await api.post("/profile/onboarding/complete");
  return response.data;
};

const skipOnboarding = async () => {
  const response = await api.post("/profile/onboarding/skip");
  return response.data;
};

export const profileService = {
  getMyProfile,
  updateMyProfile,
  completeOnboarding,
  skipOnboarding,
};
