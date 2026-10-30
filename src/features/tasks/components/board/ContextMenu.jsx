import React, { useRef, useEffect } from "react";

const ContextMenu = ({
  position,
  onClose,
  sprints,
  onMoveToSprint,
  onMoveToBacklog,
  isMoveToBacklogDisabled,
  onEditTask,
  onDeleteTask,
  showTaskActions,
  showMoveOptions = true,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 min-w-[180px] overflow-hidden text-xs"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {showTaskActions && (
        <div className="py-1">
          <button
            type="button"
            onClick={() => {
              onEditTask?.();
              onClose();
            }}
            className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-100"
          >
            Edit task
          </button>
          <button
            type="button"
            onClick={() => {
              onDeleteTask?.();
              onClose();
            }}
            className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50"
          >
            Delete task
          </button>
        </div>
      )}

      {showMoveOptions && (
        <>
          {showTaskActions && <div className="border-t border-slate-100" />}
          <div className="py-1">
            <button
              type="button"
              onClick={onMoveToBacklog}
              disabled={isMoveToBacklogDisabled}
              className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-2 ${
                isMoveToBacklogDisabled
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full shrink-0 ${
                  isMoveToBacklogDisabled ? "bg-slate-300" : "bg-indigo-500"
                }`}
              />
              <span className="truncate">Move to Backlog</span>
            </button>
          </div>
          <div className="border-t border-slate-100" />
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Move to Sprint</p>
          </div>
          <div className="py-1 max-h-48 overflow-y-auto">
            {sprints.length === 0 ? (
              <div className="px-3 py-2">
                <p className="text-slate-400">No sprints available</p>
              </div>
            ) : (
              sprints.map((sprint) => (
                <button
                  key={sprint.id}
                  type="button"
                  onClick={() => onMoveToSprint(sprint.id)}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{sprint.sprint_name}</span>
                  <span className="ml-auto text-slate-400">{sprint.tasks?.length || 0}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ContextMenu;
