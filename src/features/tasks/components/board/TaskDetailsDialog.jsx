import React from "react";
import { Loader2, Save, Flame, Check } from "lucide-react";
import { Button } from "../../../../common/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../common/components/ui/dialog";
import { Input } from "../../../../common/components/ui/input";
import { PRIORITY, formatDate, avatarColor, getMemberInitials, getMemberKey } from "./constants";

const TaskDetailsDialog = ({
  open,
  onOpenChange,
  selectedTask,
  isEditingTask,
  setIsEditingTask,
  editTaskData,
  setEditTaskData,
  editSelectedMembers,
  setEditSelectedMembers,
  availableMembers,
  statuses,
  canAddEditDelete,
  isSaving,
  onSave,
  onToggleEditMember,
}) => {
  if (!selectedTask) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-slate-800">
              {isEditingTask ? "Edit Task" : "Task Details"}
            </DialogTitle>
            {!isEditingTask && canAddEditDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingTask(true)}
                className="h-8 text-xs"
              >
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
            {isEditingTask ? (
              <Input
                value={editTaskData.title}
                onChange={(e) => setEditTaskData({ ...editTaskData, title: e.target.value })}
                className="text-sm"
              />
            ) : (
              <p className="text-sm font-medium text-slate-800">{selectedTask.title}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
            {isEditingTask ? (
              <select
                value={editTaskData.status_id}
                onChange={(e) =>
                  setEditTaskData({ ...editTaskData, status_id: parseInt(e.target.value) })
                }
                className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {statuses.map((status) => (
                  <option key={status.status_id} value={status.status_id}>
                    {status.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-slate-700">
                {statuses.find((s) => s.status_id === selectedTask.status_id)?.name}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Priority</label>
            {isEditingTask ? (
              <div className="flex gap-2">
                {["high", "medium", "low"].map((p) => {
                  const prio = PRIORITY[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setEditTaskData({ ...editTaskData, priority: p })}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                        editTaskData.priority === p
                          ? ""
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                      style={editTaskData.priority === p ? { background: prio.bg, color: prio.text } : {}}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md"
                style={{
                  background: PRIORITY[selectedTask.priority]?.bg,
                  color: PRIORITY[selectedTask.priority]?.text,
                }}
              >
                {selectedTask.priority === "high" && <Flame className="h-3 w-3" />}
                {PRIORITY[selectedTask.priority]?.label}
              </span>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Start Date</label>
              {isEditingTask ? (
                <Input
                  type="date"
                  value={editTaskData.start_date}
                  onChange={(e) => setEditTaskData({ ...editTaskData, start_date: e.target.value })}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-slate-700">
                  {selectedTask.start_date ? formatDate(selectedTask.start_date) : "-"}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Due Date</label>
              {isEditingTask ? (
                <Input
                  type="date"
                  value={editTaskData.due_date}
                  onChange={(e) => setEditTaskData({ ...editTaskData, due_date: e.target.value })}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-slate-700">
                  {selectedTask.due_date ? formatDate(selectedTask.due_date) : "-"}
                </p>
              )}
            </div>
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Estimated Hours</label>
              {isEditingTask ? (
                <Input
                  type="number"
                  step="0.5"
                  value={editTaskData.estimated_hours}
                  onChange={(e) =>
                    setEditTaskData({ ...editTaskData, estimated_hours: e.target.value })
                  }
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-slate-700">
                  {selectedTask.estimated_hours ? `${selectedTask.estimated_hours}h` : "-"}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Actual Hours</label>
              {isEditingTask ? (
                <Input
                  type="number"
                  step="0.5"
                  value={editTaskData.actual_hours}
                  onChange={(e) =>
                    setEditTaskData({ ...editTaskData, actual_hours: e.target.value })
                  }
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-slate-700">
                  {selectedTask.actual_hours ? `${selectedTask.actual_hours}h` : "-"}
                </p>
              )}
            </div>
          </div>

          {/* Assigned Members */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Assigned Members</label>
            {isEditingTask ? (
              <div className="space-y-1">
                {availableMembers.map((member) => {
                  const key = getMemberKey(member);
                  const selected = editSelectedMembers.includes(key);
                  return (
                    <div
                      key={key}
                      onClick={() => onToggleEditMember(member)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        selected ? "bg-indigo-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
                        style={{ backgroundColor: avatarColor(member.user_id) }}
                      >
                        {getMemberInitials(member)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${selected ? "text-indigo-700" : "text-slate-800"}`}>
                          {member.first_name} {member.last_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                              member.type === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {member.type === "admin" ? "Admin" : "Worker"}
                          </span>
                          <span className="text-xs text-slate-400 truncate">{member.email}</span>
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          selected ? "bg-indigo-600 border-indigo-600" : "border-slate-200 bg-white"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                {selectedTask.assigned_workers?.length > 0 ? (
                  <div className="flex -space-x-2">
                    {selectedTask.assigned_workers.map((w, i) => (
                      <div
                        key={w.user_id}
                        title={`${w.first_name} ${w.last_name}`}
                        className="h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow"
                        style={{
                          backgroundColor: avatarColor(w.user_id),
                          zIndex: selectedTask.assigned_workers.length - i,
                        }}
                      >
                        {getMemberInitials(w)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No members assigned</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
            {isEditingTask ? (
              <textarea
                value={editTaskData.description}
                onChange={(e) => setEditTaskData({ ...editTaskData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedTask.description || "-"}</p>
            )}
          </div>

          {/* Goal */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Goal</label>
            {isEditingTask ? (
              <textarea
                value={editTaskData.goal}
                onChange={(e) => setEditTaskData({ ...editTaskData, goal: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Add a goal..."
              />
            ) : (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedTask.goal || "-"}</p>
            )}
          </div>

          {/* Remark */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Remark</label>
            {isEditingTask ? (
              <textarea
                value={editTaskData.remark}
                onChange={(e) => setEditTaskData({ ...editTaskData, remark: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Add a remark..."
              />
            ) : (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedTask.remark || "-"}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          {isEditingTask ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditingTask(false);
                  setEditTaskData({
                    title: selectedTask.title,
                    description: selectedTask.description || "",
                    goal: selectedTask.goal || "",
                    priority: selectedTask.priority,
                    start_date: selectedTask.start_date ? selectedTask.start_date.split("T")[0] : "",
                    due_date: selectedTask.due_date ? selectedTask.due_date.split("T")[0] : "",
                    estimated_hours: selectedTask.estimated_hours || "",
                    actual_hours: selectedTask.actual_hours || "",
                    remark: selectedTask.remark || "",
                    status_id: selectedTask.status_id,
                  });
                  setEditSelectedMembers(selectedTask.worker_ids || []);
                }}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={!editTaskData.title?.trim() || isSaving}
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs ml-auto"
            >
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;