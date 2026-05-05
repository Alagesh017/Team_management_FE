import React from "react";
import { getFullAvatarUrl } from "../../../core/utils/utils";

const FolderIcon = ({ className = "h-24 w-32", previewUrl = null }) => {
  const fullPreviewUrl = getFullAvatarUrl(previewUrl);

  return (
    <div className={`relative ${className} group cursor-pointer transition-transform duration-200 active:scale-95`}>
      {/* Background/Back of the folder */}
      <svg
        viewBox="0 0 100 80"
        className="absolute inset-0 w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 8C0 3.58172 3.58172 0 8 0H35L42 8H92C96.4183 8 100 11.5817 100 16V72C100 76.4183 96.4183 80 92 80H8C3.58172 80 0 76.4183 0 72V8Z"
          fill="#FBC02D" // Slightly deeper yellow for the back
        />
      </svg>

      {/* Preview Content (stuck between back and front) */}
      <div className="absolute top-[12%] left-[8%] right-[8%] bottom-[15%] overflow-hidden flex items-center justify-center bg-white rounded-sm shadow-sm transition-transform duration-300 group-hover:-translate-y-3 z-0">
        {fullPreviewUrl ? (
          <img src={fullPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white border border-slate-100">
             <div className="w-6 h-8 bg-white border border-slate-200 shadow-xs relative">
                <div className="absolute top-0 right-0 w-2 h-2 bg-slate-50 border-l border-b border-slate-200" />
                <div className="mt-3 mx-1 h-0.5 bg-slate-100 w-3" />
                <div className="mt-1 mx-1 h-0.5 bg-slate-100 w-4" />
             </div>
          </div>
        )}
      </div>

      {/* Front Flap of the folder */}
      <svg
        viewBox="0 0 100 80"
        className="absolute inset-0 w-full h-full drop-shadow-sm z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 24C0 19.5817 3.58172 16 8 16H92C96.4183 16 100 19.5817 100 24V72C100 76.4183 96.4183 80 92 80H8C3.58172 80 0 76.4183 0 72V24Z"
          fill="#FDE047" // Bright yellow flap
          className="transition-colors duration-200 group-hover:fill-[#FFEB3B]" 
        />
        {/* Subtle shadow for the flap */}
        <path
           d="M0 24C0 19.5817 3.58172 16 8 16H92C96.4183 16 100 19.5817 100 24"
           stroke="rgba(0,0,0,0.05)"
           strokeWidth="0.5"
        />
      </svg>
    </div>
  );
};

export default FolderIcon;
