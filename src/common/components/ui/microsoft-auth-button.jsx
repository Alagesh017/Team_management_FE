import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

export const MicrosoftAuthButton = ({ onSuccess, onError, text = "Continue with Microsoft", onClick, isRegister = false }) => {
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    console.log("Microsoft login button clicked!");
    setIsLoading(true);
    try {
      // If custom onClick is provided, use it
      if (onClick) {
        await onClick();
        return;
      }
      
      // For register mode, set the flag
      if (isRegister) {
        sessionStorage.setItem("microsoftAuthFromRegister", "true");
      }
      
      console.log("Starting Microsoft login with redirect...");
      await instance.loginRedirect({
        scopes: ["User.Read"],
      });
    } catch (error) {
      console.error("Microsoft login error:", error);
      onError && onError(error);
    } finally {
      // Since loginRedirect navigates away, this might not fire, but just in case
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
            <svg viewBox="0 0 23 23" className="w-5 h-5">
              <rect fill="#f25022" x="0" y="0" width="11" height="11"/>
              <rect fill="#7fba00" x="12" y="0" width="11" height="11"/>
              <rect fill="#00a4ef" x="0" y="12" width="11" height="11"/>
              <rect fill="#ffb900" x="12" y="12" width="11" height="11"/>
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
