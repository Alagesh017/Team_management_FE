import React from "react";
import { Loader2, Save } from "lucide-react";
import { Input } from "../../../../common/components/ui/input";
import { PRIORITY } from "./constants";

const InlineEditTaskPanel = ({
  task,
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
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div
      className="rounded-xl border border-indigo-200 bg-white p-3 space-y-3"
      style={{ boxShadow: "0 0 0 3px rgba(99,102,241,0.08)" }}
    >
      <h4 className="font-medium text-slate-800 text-sm">{task.title}</h4>

      {/* Priority selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Priority:</span>
        <div className="flex gap-1">
          {["high", "medium", "low"].map((p) => {
            const prio = PRIORITY[p];
            return (
              <button
                key={p}
                onClick={() => setEditTaskPriority(p)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all ${
                  editTaskPriority === p
                    ? ""
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                style={editTaskPriority === p ? { background: prio.bg, color: prio.text } : {}}
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
            value={editTaskStartDate}
            onChange={(e) => setEditTaskStartDate(e.target.value)}
            className="h-8 text-xs px-2 pr-12"
            min={today}
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Due date</label>
          <Input
            type="date"
            value={editTaskDueDate}
            onChange={(e) => setEditTaskDueDate(e.target.value)}
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
            value={editTaskEstimatedHours}
            onChange={(e) => setEditTaskEstimatedHours(e.target.value)}
            className="h-7 text-xs"
            placeholder="e.g., 4"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Actual Hours</label>
          <Input
            type="number"
            step="0.5"
            value={editTaskActualHours}
            onChange={(e) => setEditTaskActualHours(e.target.value)}
            className="h-7 text-xs"
            placeholder="e.g., 5"
          />
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={isSaving}
          onClick={() => onSave(task)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Save changes
        </button>
      </div>
    </div>
  );
};

export default InlineEditTaskPanel;
