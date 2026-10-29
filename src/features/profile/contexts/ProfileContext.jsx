import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { profileService } from "../services/profileService";
import { ProfileContext } from "./profileCtx";

function shouldAutoShowOnboarding(user) {
  if (!user) return false;
  const skipped = Boolean(user.profileOnboardingSkipped);
  const completed = Boolean(user.profileOnboardingCompleted);
  return !skipped && !completed;
}

export function ProfileProvider({ children }) {
  const { user, patchUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [roleLabel, setRoleLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState("auto");
  const autoPromptHandled = useRef(false);

  const refreshProfile = useCallback(async () => {
    if (!user?.accessToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await profileService.getMyProfile();
      setProfile(data.profile || null);
      setCompletion(data.completion || null);
      setAllocations(data.allocations || []);
      setRoleLabel(data.role_label || "");
      patchUser?.({
        profileOnboardingCompleted: Boolean(data.profile_onboarding_completed),
        profileOnboardingSkipped: Boolean(data.profile_onboarding_skipped),
        completionPercent: data.completion?.percent ?? 0,
      });
      return data;
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken, patchUser]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (loading || !user || onboardingMode !== "auto") return;
    if (autoPromptHandled.current) return;
    if (shouldAutoShowOnboarding(user)) {
      autoPromptHandled.current = true;
      setShowOnboarding(true);
    }
  }, [loading, user, user?.profileOnboardingSkipped, user?.profileOnboardingCompleted, onboardingMode]);

  const openOnboarding = useCallback(() => {
    setOnboardingMode("manual");
    setShowOnboarding(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setShowOnboarding(false);
    setOnboardingMode("auto");
  }, []);

  const skipOnboarding = useCallback(async () => {
    setShowOnboarding(false);
    autoPromptHandled.current = true;
    patchUser?.({
      profileOnboardingSkipped: true,
      profileOnboardingCompleted: false,
    });
    try {
      await profileService.skipOnboarding();
    } catch (e) {
      console.error(e);
    }
    setOnboardingMode("auto");
    await refreshProfile();
  }, [patchUser, refreshProfile]);

  const finishOnboarding = useCallback(async () => {
    setShowOnboarding(false);
    autoPromptHandled.current = true;
    patchUser?.({
      profileOnboardingCompleted: true,
      profileOnboardingSkipped: false,
    });
    try {
      await profileService.completeOnboarding();
    } catch (e) {
      console.error(e);
    }
    setOnboardingMode("auto");
    await refreshProfile();
  }, [patchUser, refreshProfile]);

  const saveProfile = useCallback(
    async (payload) => {
      const data = await profileService.updateMyProfile(payload);
      setProfile(data.profile);
      setCompletion(data.completion);
      patchUser?.({ completionPercent: data.completion?.percent ?? 0 });
      return data;
    },
    [patchUser]
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        completion,
        allocations,
        roleLabel,
        loading,
        showOnboarding,
        onboardingMode,
        openOnboarding,
        closeOnboarding,
        skipOnboarding,
        finishOnboarding,
        refreshProfile,
        saveProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
