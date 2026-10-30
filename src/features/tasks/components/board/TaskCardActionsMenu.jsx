import React, { useEffect, useRef } from "react";
import { Edit, Trash2 } from "lucide-react";

/** Mini popup for task card right-click actions. */
export default function TaskCardActionsMenu({ position, onClose, onEdit, onDelete }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!position) return undefined;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [position, onClose]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[132px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
      style={{ top: position.y, left: position.x }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
        onClick={() => {
          onEdit();
          onClose();
        }}
      >
        <Edit className="h-3.5 w-3.5 text-slate-500" />
        Edit
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}
