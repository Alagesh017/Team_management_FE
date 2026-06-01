import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

export const MicrosoftAuthButton = ({ onSuccess, onError, text = "Sign in with Microsoft" }) => {
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await instance.loginPopup({
        scopes: ["User.Read"],
      });
      console.log("Microsoft login response:", response);
      
      if (response.account && response.account.username) {
        onSuccess(response.account.username);
      }
    } catch (error) {
      console.error("Microsoft login error:", error);
      if (error.errorCode !== "interaction_in_progress") {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative p-[1.5px] rounded-md overflow-hidden w-full group transition-all duration-300">
      {/* Animated Blue Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0078d4] via-[#00bcf2] to-[#0078d4] animate-gradient-x opacity-70 group-hover:opacity-100 transition-opacity"></div>
      
      <Button
        type="button"
        onClick={handleLogin}
        disabled={isLoading}
        className="relative w-full bg-white text-slate-700 hover:bg-slate-50 border-none h-11 font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center gap-3">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-[#0078d4] animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="#0078d4"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-1.5 5.5h3v4h-3v-4z"/>
            </svg>
          )}
          {isLoading ? "Signing in..." : text}
        </div>
      </Button>

      <style jsx="true">{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
