import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";

/** Opens the shared fullscreen onboarding wizard; wizard is rendered by App when logged in. */
export default function ProfileCompletePage() {
  const { openOnboarding } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    openOnboarding();
  }, [openOnboarding]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center text-slate-500">
      <p className="text-sm">Complete your profile using the guided steps.</p>
      <button
        type="button"
        className="mt-3 text-sm font-semibold text-violet-600 hover:underline"
        onClick={() => navigate("/dashboard")}
      >
        Back to dashboard
      </button>
    </div>
  );
}
