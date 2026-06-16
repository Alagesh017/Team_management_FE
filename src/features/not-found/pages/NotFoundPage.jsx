import React from "react";
import { Button } from "../../../common/components/ui/button";
import { useNavigate } from "react-router-dom";
import NotFoundImage from "../../../assets/final_404.png";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <img 
            src={NotFoundImage} 
            alt="404 Not Found" 
            className="max-w-md w-full h-auto object-contain"
          />
        </div>
        <Button 
          onClick={() => navigate("/")} 
          className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95 px-8 py-6 text-lg"
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
