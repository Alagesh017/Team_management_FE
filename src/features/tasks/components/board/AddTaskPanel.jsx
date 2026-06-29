import React from "react";
import { Loader2, Save, User } from "lucide-react";
import { Input } from "../../../../common/components/ui/input";
import { PRIORITY } from "./constants";
import AvatarStack from "./AvatarStack";

const AddTaskPanel = ({
  statusId,
  newTaskTitle,
  setNewTaskTitle,
  newTaskStartDate,
  setNewTaskStartDate,
  newTaskDueDate,
  setNewTaskDueDate,
  newTaskPriority,
  setNewTaskPriority,
  newTaskEstimatedHours,
  setNewTaskEstimatedHours,
  newTaskActualHours,
  setNewTaskActualHours,
  selectedMembers,
  getSelectedMembersData,
  isSaving,
  onSave,
  onClose,
  onOpenMemberDialog,
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div
      className="rounded-xl border border-indigo-200 bg-white p-3 space-y-3"
      style={{ boxShadow: "0 0 0 3px rgba(99,102,241,0.08)" }}
    >
      <Input
        autoFocus
        placeholder="Task name…"
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(statusId);
          if (e.key === "Escape") onClose();
        }}
        className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm font-medium placeholder:text-slate-300"
      />

      {/* Priority selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Priority:</span>
        <div className="flex gap-1">
          {["high", "medium", "low"].map((p) => {
            const prio = PRIORITY[p];
            return (
              <button
                key={p}
                onClick={() => setNewTaskPriority(p)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all ${
                  newTaskPriority === p
                    ? ""
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                style={newTaskPriority === p ? { background: prio.bg, color: prio.text } : {}}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Start date</label>
          <Input
            type="date"
            value={newTaskStartDate}
            onChange={(e) => setNewTaskStartDate(e.target.value)}
            className="h-8 text-xs px-2 pr-12"
            min={today}
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Due date</label>
          <Input
            type="date"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
            className="h-8 text-xs px-2 pr-8"
            min={today}
          />
        </div>
      </div>

      {/* Hours inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Estimated Hours</label>
          <Input
            type="number"
            step="0.5"
            value={newTaskEstimatedHours}
            onChange={(e) => setNewTaskEstimatedHours(e.target.value)}
            className="h-7 text-xs"
            placeholder="e.g., 4"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Actual Hours</label>
          <Input
            type="number"
            step="0.5"
            value={newTaskActualHours}
            onChange={(e) => setNewTaskActualHours(e.target.value)}
            className="h-7 text-xs"
            placeholder="e.g., 5"
          />
        </div>
      </div>

      {/* assigned members mini-row */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onOpenMemberDialog}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50"
        >
          {selectedMembers.length === 0 ? (
            <>
              <User className="h-3.5 w-3.5" />
              <span>Assign</span>
            </>
          ) : (
            <>
              <AvatarStack workers={getSelectedMembersData()} size={5} />
              <span className="ml-1">{selectedMembers.length} assigned</span>
            </>
          )}
        </button>
      </div>

      {/* actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={!newTaskTitle.trim() || isSaving}
          onClick={() => onSave(statusId)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Save task
        </button>
      </div>
    </div>
  );
};

export default AddTaskPanel;