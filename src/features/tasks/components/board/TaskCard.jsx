import React from "react";
import { Flame, Calendar, Clock, BadgeCheck, Loader2 } from "lucide-react";
import { PRIORITY, formatDate, avatarColor, getMemberInitials } from "./constants";
import AvatarStack from "./AvatarStack";
import InlineEditTaskPanel from "./InlineEditTaskPanel";
import { getFullAvatarUrl } from "../../../../core/utils/utils";

const TaskCard = ({
  task,
  color,
  draggedTask,
  canAddEditDelete,
  canMoveCards,
  columnIsReview,
  columnIsCompleted,
  canReviewTask,
  reviewActionLoading,
  isSyncing,
  onReviewDecision,
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
  const approver = task.review_approved_person;
  const approverName = approver
    ? `${approver.first_name || ""} ${approver.last_name || ""}`.trim()
    : null;
  const showVerifiedApproval =
    columnIsCompleted &&
    (approverName || task.review_approved_by_role_id || task.review_approved_by_role);
  const approvedByLabel = approverName
    ? `Approved by ${approverName}`
    : task.review_approved_by_role
      ? `Approved by ${task.review_approved_by_role.replace(/_/g, " ")}`
      : null;
  const approverAvatarId =
    approver?.user_id ?? approver?.role_id ?? task.review_approved_by_role_id ?? 0;

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
      } ${isSyncing ? "pointer-events-none" : ""}`}
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
      {isSyncing ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/75 backdrop-blur-[1px]">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" aria-label="Saving" />
        </div>
      ) : null}
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

      {showVerifiedApproval && approvedByLabel ? (
        <div
          className="mt-1.5 flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50/90 px-1.5 py-1"
          title={approvedByLabel}
        >
          <div className="relative shrink-0">
            <div
              className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-white text-[9px] font-bold text-white shadow-sm"
              style={{ backgroundColor: avatarColor(approverAvatarId) }}
            >
              {approver?.avatar_url ? (
                <img
                  src={getFullAvatarUrl(approver.avatar_url)}
                  alt={approverName || "Approver"}
                  className="h-full w-full object-cover"
                />
              ) : approver?.first_name ? (
                getMemberInitials(approver)
              ) : (
                "✓"
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-emerald-100">
              <BadgeCheck className="h-3 w-3 text-emerald-600" strokeWidth={2.5} />
            </span>
          </div>
          <p className="min-w-0 flex-1 truncate text-[10px] font-semibold leading-snug text-emerald-900">
            {approvedByLabel}
          </p>
        </div>
      ) : null}

      {columnIsReview && canReviewTask ? (
        <div
          className="mt-1.5 flex gap-1"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            disabled={reviewActionLoading}
            onClick={() => onReviewDecision?.(task, "approve")}
            className="flex-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={reviewActionLoading}
            onClick={() => onReviewDecision?.(task, "in_progress")}
            className="flex-1 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            In progress
          </button>
        </div>
      ) : null}

      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default TaskCard;
