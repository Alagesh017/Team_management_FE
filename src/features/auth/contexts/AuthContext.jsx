import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { authService } from "../services/authService";
import {
  handleMonitorLogout,
  handleMonitorSessionForUser,
} from "../../monitor/monitorSessionSync";
import {
  loadStoredUser,
  saveStoredUser,
  clearStoredUser,
  hydrateAuthFromDesktopDisk,
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_TOKENS_REFRESHED_EVENT,
} from "../authStorage";
import { refreshAccessToken } from "../../../core/interceptors/axiosInterceptor";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      await hydrateAuthFromDesktopDisk();
      const stored = loadStoredUser();
      if (!stored) {
        if (!cancelled) setLoading(false);
        return;
      }
      setUser(stored);
      if (stored.refreshToken) {
        try {
          await refreshAccessToken();
          const updated = loadStoredUser();
          if (updated && !cancelled) setUser(updated);
        } catch {
          /* keep stored user; refresh may fail offline — do not log out */
        }
      }
      if (!cancelled) setLoading(false);
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onRefreshed = (e) => {
      if (e.detail) setUser(e.detail);
    };
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_TOKENS_REFRESHED_EVENT, onRefreshed);
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired);
    return () => {
      window.removeEventListener(AUTH_TOKENS_REFRESHED_EVENT, onRefreshed);
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired);
    };
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
        saveStoredUser(userData);
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
        saveStoredUser(userData);
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
        saveStoredUser(userData);
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
      saveStoredUser(next);
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await handleMonitorLogout();
    } finally {
      setUser(null);
      clearStoredUser();
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
