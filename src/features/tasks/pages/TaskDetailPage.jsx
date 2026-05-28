import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/contexts/AuthContext";
import {
  ChevronLeft,
  Plus,
  Trash2,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Save,
  Edit3,
  X
} from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Label } from "../../../common/components/ui/label";
import { Badge } from "../../../common/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../../../common/components/ui/sheet";
import { taskService } from "../services/taskService";
import { subTaskService } from "../services/subTaskService";
import { projectTaskService } from "../services/projectTaskService";
import { projectService } from "../../projects/services/projectService";

const PRIORITY = {
  high:   { label: "High",   bg: "#fef2f2", text: "#ef4444", dot: "#ef4444" },
  medium: { label: "Medium", bg: "#fffbeb", text: "#f59e0b", dot: "#f59e0b" },
  low:    { label: "Low",    bg: "#f0fdf4", text: "#22c55e", dot: "#22c55e" },
};

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];

const avatarColor = (userId) =>
  AVATAR_COLORS[(userId || 0) % AVATAR_COLORS.length];

const TaskDetailPage = () => {
  const { taskId, projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSubTaskSheetOpen, setIsSubTaskSheetOpen] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState(null);
  const [subTaskForm, setSubTaskForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSubTask, setIsSavingSubTask] = useState(false);

  const canAddEditDelete = () => {
    if (!project) return false;
    const userRole = user?.role?.toLowerCase() || "";
    
    // Grant full access to any role except team_leader and worker
    if (userRole !== "team_leader" && userRole !== "worker") {
      return true;
    }
    
    if (project.company_managed === true) {
      return false; // Company Managed: Restrict add/edit/delete for everyone
    } else if (project.by_tl_managed === true) {
      return userRole === "team_leader"; // By TL Managed: Only team leader can add/edit/delete
    } else if (project.team_managed === true) {
      return true; // Team Managed: Everyone can do everything
    }
    return false;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [taskData, projectTaskData, projectData] = await Promise.all([
        taskService.getTaskById(taskId),
        projectTaskService.getProjectTaskData(projectId),
        projectService.getProjectById(projectId),
      ]);
      setProject(projectData.project || projectData);
      
      const taskObj = taskData.task || taskData;
      setTask(taskObj);
      setStatuses(projectTaskData.statuses || []);
      
      try {
        const subTasksData = await subTaskService.getSubTasksByTaskId(taskObj.task_id || taskObj.id || taskId);
        setSubTasks(subTasksData.sub_tasks || []);
      } catch (err) {
        console.error("Failed to load subtasks:", err);
        setSubTasks([]);
      }
      
      const members = [];
      const seen = new Set();
      const allMembers = [
        ...(projectTaskData.all_admins || []),
        ...(projectTaskData.allocated_members || [])
      ];
      
      allMembers.forEach(m => {
        if (!seen.has(m.user_id)) {
          seen.add(m.user_id);
          members.push({
            ...m,
            type: m.type || (m.is_admin || m.is_superadmin ? "admin" : "worker")
          });
        }
      });
      
      setAvailableMembers(members);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [taskId, projectId]);

  useEffect(() => {
    if (taskId && projectId) fetchData();
  }, [taskId, projectId, fetchData]);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const getMemberInitials = (m) =>
    `${m.first_name.charAt(0)}${m.last_name ? m.last_name.charAt(0) : ""}`.toUpperCase();

  const getSelectedMembersData = () => {
    if (!task?.worker_ids) return [];
    return availableMembers.filter(m => 
      task.worker_ids.some(w => 
        (typeof w === "object" ? w.user_id : w) === m.user_id
      )
    );
  };

  const startEdit = () => {
    setEditForm({
      title: task.title,
      description: task.description || "",
      goal: task.goal || "",
      priority: task.priority,
      start_date: task.start_date ? task.start_date.split("T")[0] : "",
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      estimated_hours: task.estimated_hours || "",
      actual_hours: task.actual_hours || "",
      remark: task.remark || "",
      status_id: task.status_id,
    });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    try {
      setIsSaving(true);
      const updateData = { ...editForm };
      if (updateData.estimated_hours === "") updateData.estimated_hours = null;
      if (updateData.actual_hours === "") updateData.actual_hours = null;
      if (updateData.start_date === "") updateData.start_date = null;
      if (updateData.due_date === "") updateData.due_date = null;
      
      await taskService.updateTask(task.task_id || task.id, updateData);
      setTask(prev => ({ ...prev, ...updateData }));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save task:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const openAddSubTask = () => {
    setEditingSubTask(null);
    setSubTaskForm({
      title: "",
      description: "",
      priority: "medium",
      start_date: "",
      due_date: "",
      role_id: null,
      role: null,
      estimated_hours: "",
      actual_hours: "",
      remark: "",
      status_id: statuses[0]?.status_id || 1
    });
    setIsSubTaskSheetOpen(true);
  };

  const openEditSubTask = (subTask) => {
    setEditingSubTask(subTask);
    setSubTaskForm({
      title: subTask.title,
      description: subTask.description || "",
      priority: subTask.priority || "medium",
      start_date: subTask.start_date || "",
      due_date: subTask.due_date || "",
      role_id: subTask.role_id || null,
      role: subTask.role || null,
      estimated_hours: subTask.estimated_hours || "",
      actual_hours: subTask.actual_hours || "",
      remark: subTask.remark || "",
      status_id: subTask.status_id || statuses[0]?.status_id || 1
    });
    setIsSubTaskSheetOpen(true);
  };

  const handleSaveSubTask = async () => {
    try {
      setIsSavingSubTask(true);
      const data = { ...subTaskForm };
      if (data.estimated_hours === "") data.estimated_hours = null;
      if (data.actual_hours === "") data.actual_hours = null;
      if (data.start_date === "") data.start_date = null;
      if (data.due_date === "") data.due_date = null;
      if (data.role_id === "" || data.role_id === undefined) data.role_id = null;
      if (data.role === "" || data.role === undefined) data.role = null;
      data.parent_task_id = task.task_id || task.id;
      data.assigned_by = user?.userId;

      if (editingSubTask) {
        await subTaskService.updateSubTask(editingSubTask.id, data);
      } else {
        await subTaskService.createSubTask(data);
      }
      
      setIsSubTaskSheetOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to save subtask:", err);
    } finally {
      setIsSavingSubTask(false);
    }
  };

  const handleDeleteSubTask = async (subTaskId) => {
    try {
      await subTaskService.deleteSubTask(subTaskId);
      fetchData();
    } catch (err) {
      console.error("Failed to delete subtask:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px] mt-4">Loading task...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 bg-white shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/tasks/project/${projectId}`)} className="rounded-full">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: statuses.find(s => s.status_id === task?.status_id)?.color || "#6366f1" }}
            />
            <h1 className="text-xl font-bold text-slate-900 truncate">{task?.title}</h1>
          </div>
        </div>
        {!isEditing ? (
          canAddEditDelete() && (
            <Button onClick={startEdit} className="bg-slate-900 hover:bg-slate-800">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
          )
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-700" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 border-r border-slate-200">
          <div className="max-w-3xl mx-auto space-y-8">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Task Title</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="text-3xl font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Status
                    </Label>
                    <Select value={editForm.status_id?.toString()} onValueChange={(val) => setEditForm({ ...editForm, status_id: parseInt(val) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s.status_id} value={s.status_id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Priority
                    </Label>
                    <Select value={editForm.priority} onValueChange={(val) => setEditForm({ ...editForm, priority: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Due Date
                    </Label>
                    <Input
                      type="date"
                      value={editForm.due_date}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Description
                  </Label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Add a description..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Goal
                  </Label>
                  <textarea
                    value={editForm.goal}
                    onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                    placeholder="Add a goal..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Estimated Hours
                    </Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={editForm.estimated_hours}
                      onChange={(e) => setEditForm({ ...editForm, estimated_hours: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Actual Hours
                    </Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={editForm.actual_hours}
                      onChange={(e) => setEditForm({ ...editForm, actual_hours: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Remarks
                  </Label>
                  <textarea
                    value={editForm.remark}
                    onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })}
                    placeholder="Add remarks..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[60px]"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Task Title</Label>
                  <div className="text-3xl font-bold text-slate-900">{task?.title}</div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Status
                    </Label>
                    <div className="text-lg font-medium text-slate-700">
                      {statuses.find(s => s.status_id === task?.status_id)?.name || "Not set"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Priority
                    </Label>
                    <div className="text-lg font-medium text-slate-700 capitalize">{task?.priority || "Not set"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Start Date
                    </Label>
                    <div className="text-lg font-medium text-slate-700">
                      {task?.start_date ? formatDate(task.start_date) : "Not set"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Due Date
                    </Label>
                    <div className="text-lg font-medium text-slate-700">
                      {task?.due_date ? formatDate(task.due_date) : "Not set"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Description
                  </Label>
                  <div className="text-slate-700">
                    {task?.description || <span className="text-slate-400 italic">No description</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Goal
                  </Label>
                  <div className="text-slate-700">
                    {task?.goal || <span className="text-slate-400 italic">No goal</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Estimated Hours
                    </Label>
                    <div className="text-lg font-medium text-slate-700">
                      {task?.estimated_hours ? `${task.estimated_hours}h` : "Not set"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Actual Hours
                    </Label>
                    <div className="text-lg font-medium text-slate-700">
                      {task?.actual_hours ? `${task.actual_hours}h` : "Not set"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Assigned Members
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedMembersData().map((member, i) => (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full"
                      >
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: avatarColor(member.user_id) }}
                        >
                          {getMemberInitials(member)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {member.first_name} {member.last_name}
                        </span>
                      </div>
                    ))}
                    {getSelectedMembersData().length === 0 && (
                      <span className="text-sm text-slate-400 italic">No members assigned</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Remarks
                  </Label>
                  <div className="text-slate-700">
                    {task?.remark || <span className="text-slate-400 italic">No remarks</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Project Access Flags
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {project?.company_managed ? (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">Company Managed</Badge>
                    ) : null}
                    {project?.team_managed ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Team Managed</Badge>
                    ) : null}
                    {project?.by_tl_managed ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">By TL Managed</Badge>
                    ) : null}
                    {!project?.company_managed && !project?.team_managed && !project?.by_tl_managed ? (
                      <span className="text-slate-400 italic font-normal text-sm">No access flags set</span>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Status Flags
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {(() => {
                      const status = statuses.find(s => s.status_id === task?.status_id);
                      return status?.is_confidential ? (
                        <Badge className="bg-red-100 text-red-700 border-red-200">Confidential</Badge>
                      ) : null;
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="w-96 flex flex-col bg-slate-50 border-l border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Subtasks</h2>
              {canAddEditDelete() && (
                <Button onClick={openAddSubTask} className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subtask
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {subTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No subtasks yet</p>
                <p className="text-xs text-slate-400 mt-1">Add your first subtask above</p>
              </div>
            ) : (
              subTasks.map((subTask) => (
                <div
                  key={subTask.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{subTask.title}</div>
                      {subTask.description && (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-2">{subTask.description}</div>
                      )}
                    </div>
                    {canAddEditDelete() && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditSubTask(subTask)}
                          className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubTask(subTask.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Sheet open={isSubTaskSheetOpen} onOpenChange={setIsSubTaskSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingSubTask ? "Edit Subtask" : "Add Subtask"}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Title *</Label>
              <Input
                value={subTaskForm.title}
                onChange={(e) => setSubTaskForm({ ...subTaskForm, title: e.target.value })}
                placeholder="Subtask title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</Label>
                <Select value={subTaskForm.status_id?.toString()} onValueChange={(val) => setSubTaskForm({ ...subTaskForm, status_id: parseInt(val) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s.status_id} value={s.status_id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Priority</Label>
                <Select value={subTaskForm.priority} onValueChange={(val) => setSubTaskForm({ ...subTaskForm, priority: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Start Date</Label>
                <Input
                  type="date"
                  value={subTaskForm.start_date}
                  onChange={(e) => setSubTaskForm({ ...subTaskForm, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Due Date</Label>
                <Input
                  type="date"
                  value={subTaskForm.due_date}
                  onChange={(e) => setSubTaskForm({ ...subTaskForm, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</Label>
              <textarea
                value={subTaskForm.description}
                onChange={(e) => setSubTaskForm({ ...subTaskForm, description: e.target.value })}
                placeholder="Subtask description"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[80px]"
              />
            </div>



            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={subTaskForm.estimated_hours}
                  onChange={(e) => setSubTaskForm({ ...subTaskForm, estimated_hours: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned To</Label>
                <Select 
                  value={subTaskForm.role ? `${subTaskForm.role}-${subTaskForm.role_id}` : ""} 
                  onValueChange={(val) => {
                    if (val) {
                      const [role, roleId] = val.split("-");
                      setSubTaskForm({ ...subTaskForm, role, role_id: parseInt(roleId) });
                    } else {
                      setSubTaskForm({ ...subTaskForm, role: null, role_id: null });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map(m => (
                      <SelectItem key={`${m.type}-${m.user_id}`} value={`${m.type}-${m.user_id}`}>
                        {m.first_name} {m.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Actual Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={subTaskForm.actual_hours}
                  onChange={(e) => setSubTaskForm({ ...subTaskForm, actual_hours: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Remarks</Label>
              <textarea
                value={subTaskForm.remark}
                onChange={(e) => setSubTaskForm({ ...subTaskForm, remark: e.target.value })}
                placeholder="Add remarks"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[60px]"
              />
            </div>
          </div>

          <SheetFooter className="mt-8">
            <Button variant="ghost" onClick={() => setIsSubTaskSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSubTask} disabled={isSavingSubTask || !subTaskForm.title}>
              {isSavingSubTask ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {editingSubTask ? "Update Subtask" : "Create Subtask"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TaskDetailPage;
