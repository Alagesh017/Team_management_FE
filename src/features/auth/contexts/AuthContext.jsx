import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { authService } from "../services/authService";
import {
  handleMonitorLogout,
  handleMonitorSessionForUser,
} from "../../monitor/monitorSessionSync";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password);
      if (data.status === 1) {
        const userData = {
          email: data.email,
          role: data.role,
          userId: data.user_id,
          roleId: data.role_id,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          profileOnboardingCompleted: Boolean(data.profile_onboarding_completed),
          profileOnboardingSkipped: Boolean(data.profile_onboarding_skipped),
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        await handleMonitorSessionForUser(userData.userId);
        return data;
      }
      throw new Error(data.message || "Login failed");
    } catch (error) {
      throw error;
    }
  }, []);

  const googleLogin = useCallback(async (email) => {
    try {
      const data = await authService.googleLogin(email);
      if (data.status === 1) {
        const userData = {
          email: data.email,
          role: data.role,
          userId: data.user_id,
          roleId: data.role_id,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          profileOnboardingCompleted: Boolean(data.profile_onboarding_completed),
          profileOnboardingSkipped: Boolean(data.profile_onboarding_skipped),
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        await handleMonitorSessionForUser(userData.userId);
        return data;
      }
      throw new Error(data.message || "Google Login failed");
    } catch (error) {
      throw error;
    }
  }, []);

  const microsoftLogin = useCallback(async (email) => {
    try {
      const data = await authService.microsoftLogin(email);
      if (data.status === 1) {
        const userData = {
          email: data.email,
          role: data.role,
          userId: data.user_id,
          roleId: data.role_id,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          profileOnboardingCompleted: Boolean(data.profile_onboarding_completed),
          profileOnboardingSkipped: Boolean(data.profile_onboarding_skipped),
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        await handleMonitorSessionForUser(userData.userId);
        return data;
      }
      throw new Error(data.message || "Microsoft Login failed");
    } catch (error) {
      throw error;
    }
  }, []);

  const patchUser = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await handleMonitorLogout();
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, microsoftLogin, logout, loading, patchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
