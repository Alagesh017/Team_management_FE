import React from "react";
import { avatarColor, getMemberInitials } from "./constants";

const AvatarStack = ({ workers, size = 8, border = "border-white" }) => (
  <div className="flex -space-x-2">
    {workers.slice(0, 3).map((w, i) => (
      <div
        key={w.user_id}
        title={`${w.first_name} ${w.last_name}`}
        className={`h-${size} w-${size} rounded-full flex items-center justify-center text-white text-xs font-bold border-2 ${border} shadow-sm`}
        style={{ backgroundColor: avatarColor(w.user_id), zIndex: workers.length - i }}
      >
        {getMemberInitials(w)}
      </div>
    ))}
    {workers.length > 3 && (
      <div
        className={`h-${size} w-${size} rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold border-2 ${border}`}
      >
        +{workers.length - 3}
      </div>
    )}
  </div>
);

export default AvatarStack;