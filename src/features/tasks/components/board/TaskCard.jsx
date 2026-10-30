import React from "react";
import { Flame, Calendar, Clock } from "lucide-react";
import { PRIORITY, formatDate } from "./constants";
import AvatarStack from "./AvatarStack";
import InlineEditTaskPanel from "./InlineEditTaskPanel";

const TaskCard = ({
  task,
  color,
  draggedTask,
  canAddEditDelete,
  canMoveCards,
  onDragStart,
  onDragEnd,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDeleteClick,
  onEditClick,
  isEditing,
  editTaskTitle,
  setEditTaskTitle,
  editTaskPriority,
  setEditTaskPriority,
  editTaskStartDate,
  setEditTaskStartDate,
  editTaskDueDate,
  setEditTaskDueDate,
  editTaskEstimatedHours,
  setEditTaskEstimatedHours,
  editTaskActualHours,
  setEditTaskActualHours,
  isSaving,
  onSave,
  onCancel,
}) => {
  const p = PRIORITY[task.priority] || PRIORITY.medium;

  if (isEditing) {
    return (
      <InlineEditTaskPanel
        task={task}
        editTaskTitle={editTaskTitle}
        setEditTaskTitle={setEditTaskTitle}
        editTaskPriority={editTaskPriority}
        setEditTaskPriority={setEditTaskPriority}
        editTaskStartDate={editTaskStartDate}
        setEditTaskStartDate={setEditTaskStartDate}
        editTaskDueDate={editTaskDueDate}
        setEditTaskDueDate={setEditTaskDueDate}
        editTaskEstimatedHours={editTaskEstimatedHours}
        setEditTaskEstimatedHours={setEditTaskEstimatedHours}
        editTaskActualHours={editTaskActualHours}
        setEditTaskActualHours={setEditTaskActualHours}
        isSaving={isSaving}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  const handleContextMenu = (e) => {
    if (!canAddEditDelete || !onContextMenu) return;
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, task);
  };

  return (
    <div
      key={task.task_id}
      className={`group relative rounded-lg px-2 py-1.5 cursor-pointer transition-all duration-200 ${
        draggedTask?.task_id === task.task_id ? "opacity-50 scale-95" : ""
      }`}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
      draggable={canMoveCards}
      onDragStart={canMoveCards ? () => onDragStart(task) : undefined}
      onDragEnd={onDragEnd}
      onClick={(e) => onClick(task, e)}
      onDoubleClick={(e) => onDoubleClick && onDoubleClick(task, e)}
      onContextMenu={handleContextMenu}
      onMouseEnter={(e) => {
        if (draggedTask?.task_id !== task.task_id) {
          e.currentTarget.style.border = "1px solid #cbd5e1";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (draggedTask?.task_id !== task.task_id) {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.border = "1px solid #e2e8f0";
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      <div className="flex items-start justify-between gap-1.5 mb-1">
        <h4 className="font-medium text-slate-800 text-xs leading-snug flex-1 line-clamp-2">{task.title}</h4>
        {task.priority && (
          <span
            className="flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded shrink-0"
            style={{ background: p.bg, color: p.text }}
          >
            {task.priority === "high" && <Flame className="h-2 w-2" />}
            {p.label}
          </span>
        )}
      </div>

      {task.assigned_workers?.length > 0 && (
        <div className="mb-1">
          <AvatarStack workers={task.assigned_workers} size={6} />
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap text-[10px] font-medium text-slate-400">
        <span className="inline-flex items-center gap-0.5">
          <Calendar className="h-2.5 w-2.5" />
          {task.start_date ? formatDate(task.start_date) : "—"}
        </span>
        <span className="inline-flex items-center gap-0.5">
          <Calendar className="h-2.5 w-2.5" />
          {task.due_date ? formatDate(task.due_date) : "—"}
        </span>
        <span className="inline-flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" />
          {task.estimated_hours ? `${task.estimated_hours}h` : "—"}
        </span>
      </div>

      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default TaskCard;
