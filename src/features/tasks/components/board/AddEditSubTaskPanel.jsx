import React from "react";
import { Loader2, Save, X } from "lucide-react";
import { Input } from "../../../../common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../common/components/ui/select";
import { PRIORITY } from "./constants";

const AddEditSubTaskPanel = ({
  isEditing,
  subTaskTitle,
  setSubTaskTitle,
  subTaskDescription,
  setSubTaskDescription,
  subTaskPriority,
  setSubTaskPriority,
  subTaskStartDate,
  setSubTaskStartDate,
  subTaskDueDate,
  setSubTaskDueDate,
  subTaskEstimatedHours,
  setSubTaskEstimatedHours,
  subTaskActualHours,
  setSubTaskActualHours,
  subTaskRole,
  setSubTaskRole,
  subTaskRoleId,
  setSubTaskRoleId,
  subTaskRemark,
  setSubTaskRemark,
  subTaskStatusId,
  setSubTaskStatusId,
  statuses,
  availableMembers,
  isSaving,
  onSave,
  onCancel,
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      className="rounded-xl border border-indigo-200 bg-white p-3 space-y-3"
      style={{ boxShadow: "0 0 0 3px rgba(99,102,241,0.08)" }}
    >
      <Input
        autoFocus
        placeholder="Subtask name…"
        value={subTaskTitle}
        onChange={(e) => setSubTaskTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm font-medium placeholder:text-slate-300"
      />

      {/* Description */}
      <div>
        <label className="text-[10px] font-medium text-slate-500 mb-1 block">Description</label>
        <textarea
          placeholder="Add a description…"
          value={subTaskDescription}
          onChange={(e) => setSubTaskDescription(e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          rows={2}
        />
      </div>

      {/* Priority selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Priority:</span>
        <div className="flex gap-1">
          {["high", "medium", "low"].map((p) => {
            const prio = PRIORITY[p];
            return (
              <button
                key={p}
                onClick={() => setSubTaskPriority(p)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all ${
                  subTaskPriority === p
                    ? ""
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                style={subTaskPriority === p ? { background: prio.bg, color: prio.text } : {}}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status selector */}
      <div>
        <label className="text-[10px] font-medium text-slate-500 mb-1 block">Status</label>
        <Select value={String(subTaskStatusId || "")} onValueChange={(v) => setSubTaskStatusId(parseInt(v))}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.status_id} value={String(s.status_id)} className="text-xs">
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Start date</label>
          <Input
            type="date"
            value={subTaskStartDate}
            onChange={(e) => setSubTaskStartDate(e.target.value)}
            className="h-7 text-xs px-2"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Due date</label>
          <Input
            type="date"
            value={subTaskDueDate}
            onChange={(e) => setSubTaskDueDate(e.target.value)}
            className="h-7 text-xs px-2"
            min={subTaskStartDate || today}
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
            value={subTaskEstimatedHours}
            onChange={(e) => setSubTaskEstimatedHours(e.target.value)}
            className="h-7 text-xs"
            placeholder="e.g., 4"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Actual Hours</label>
          <Input
            type="number"
            step="0.5"
            value={subTaskActualHours}
            onChange={(e) => setSubTaskActualHours(e.target.value)}
            className="h-7 text-xs"
            placeholder="e.g., 5"
          />
        </div>
      </div>

      {/* Remark */}
      <div>
        <label className="text-[10px] font-medium text-slate-500 mb-1 block">Remark</label>
        <textarea
          placeholder="Add a remark…"
          value={subTaskRemark}
          onChange={(e) => setSubTaskRemark(e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          rows={2}
        />
      </div>

      {/* actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
        <button
          disabled={!subTaskTitle.trim() || isSaving}
          onClick={onSave}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          {isEditing ? "Update subtask" : "Save subtask"}
        </button>
      </div>
    </div>
  );
};

export default AddEditSubTaskPanel;
