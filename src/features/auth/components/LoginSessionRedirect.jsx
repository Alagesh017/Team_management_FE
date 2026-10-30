import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAuthLastPath } from "../authStorage";

/** If session was restored, leave the login screen and open the last app page. */
export function LoginSessionRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    navigate(getAuthLastPath(), { replace: true });
  }, [user, loading, navigate]);

  return null;
}
