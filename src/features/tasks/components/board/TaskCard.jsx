import React from "react";
import { Flame, Calendar, Clock, Trash2 } from "lucide-react";
import { PRIORITY, formatDate } from "./constants";
import AvatarStack from "./AvatarStack";

const TaskCard = ({
  task,
  color,
  draggedTask,
  canAddEditDelete,
  canMoveCards,
  onDragStart,
  onDragEnd,
  onClick,
  onDeleteClick,
}) => {
  const p = PRIORITY[task.priority] || PRIORITY.medium;

  return (
    <div
      key={task.task_id}
      className={`group relative rounded-xl p-3 cursor-pointer transition-all duration-200 ${
        draggedTask?.task_id === task.task_id ? "opacity-50 scale-95" : ""
      }`}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
      }}
      draggable={canMoveCards}
      onDragStart={canMoveCards ? () => onDragStart(task) : undefined}
      onDragEnd={onDragEnd}
      onClick={(e) => onClick(task, e)}
      onMouseEnter={(e) => {
        if (draggedTask?.task_id !== task.task_id) {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.border = "1px solid #cbd5e1";
          e.currentTarget.style.boxShadow =
            "0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (draggedTask?.task_id !== task.task_id) {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.border = "1px solid #e2e8f0";
          e.currentTarget.style.boxShadow =
            "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {/* priority + title */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-start gap-2 flex-1">
          <h4 className="font-medium text-slate-800 text-sm leading-snug flex-1">
            {task.title}
          </h4>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {task.priority && (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
              style={{ background: p.bg, color: p.text }}
            >
              {task.priority === "high" && <Flame className="h-2.5 w-2.5" />}
              {p.label}
            </span>
          )}
          {canAddEditDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(task);
              }}
              className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* workers */}
      {task.assigned_workers?.length > 0 && (
        <div className="mb-2.5">
          <AvatarStack workers={task.assigned_workers} size={7} />
        </div>
      )}

      {/* meta */}
      {(task.start_date || task.due_date || task.estimated_hours) && (
        <div className="flex items-center gap-3 flex-wrap">
          {task.start_date && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
              <Calendar className="h-3 w-3" />
              <span>Start: {formatDate(task.start_date)}</span>
            </div>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
              <Calendar className="h-3 w-3" />
              <span>Due: {formatDate(task.due_date)}</span>
            </div>
          )}
          {task.estimated_hours && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
              <Clock className="h-3 w-3" />
              <span>{task.estimated_hours}h</span>
            </div>
          )}
        </div>
      )}

      {/* left accent bar on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default TaskCard;