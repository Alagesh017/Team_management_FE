import { useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MicrosoftRedirectHandler() {
  const { instance } = useMsal();
  const { microsoftLogin } = useAuth();
  const navigate = useNavigate();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (hasHandledRef.current) return;

      try {
        const response = await instance.handleRedirectPromise();
        
        if (response?.account?.username) {
          hasHandledRef.current = true;
          
          // Check if we came from register page
          const wasOnRegisterPage = sessionStorage.getItem("microsoftAuthFromRegister") === "true";
          
          if (wasOnRegisterPage) {
            // Store Microsoft account details for registration prefill
            const microsoftAccount = {
              email: response.account.username,
              first_name: response.account.name?.split(" ")[0] || "",
              last_name: response.account.name?.split(" ").slice(1).join(" ") || "",
            };
            localStorage.setItem("microsoftRegisterPrefill", JSON.stringify(microsoftAccount));
            sessionStorage.removeItem("microsoftAuthFromRegister");
            navigate("/register");
          } else {
            // Normal login flow
            console.log("EMAIL:", response.account.username);
            console.log("Calling Microsoft login API with email...");
            
            const apiResponse = await microsoftLogin(response.account.username);
            console.log("Microsoft login API response:", apiResponse);
            
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Microsoft redirect error:", error);
      }
    };

    handleAuth();
  }, [instance, microsoftLogin, navigate]);

  return null;
}
