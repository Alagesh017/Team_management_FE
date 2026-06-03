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
  ChevronDown,
  Target,
  MessageSquare,
  CheckSquare,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Label } from "../../../common/components/ui/label";
import { Badge } from "../../../common/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../../../common/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../common/components/ui/dropdown-menu";
import { taskService } from "../services/taskService";
import { subTaskService } from "../services/subTaskService";
import { projectTaskService } from "../services/projectTaskService";
import { projectService } from "../../projects/services/projectService";

const PRIORITY = {
  high:   { label: "High",   bg: "#fff1f2", text: "#e11d48", dot: "#e11d48", border: "#fecdd3" },
  medium: { label: "Medium", bg: "#fffbeb", text: "#d97706", dot: "#f59e0b", border: "#fde68a" },
  low:    { label: "Low",    bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e", border: "#bbf7d0" },
};

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];

const avatarColor = (userId) =>
  AVATAR_COLORS[(userId || 0) % AVATAR_COLORS.length];

/* ─── Small reusable field block ─────────────────────────── */
const FieldBlock = ({ icon: Icon, label, children }) => (
  <div className="space-y-1.5">
    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </p>
    <div className="text-sm font-medium text-slate-700 leading-relaxed">{children}</div>
  </div>
);

/* ─── Priority pill ──────────────────────────────────────── */
const PriorityPill = ({ priority }) => {
  const cfg = PRIORITY[priority] || PRIORITY.medium;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

/* ─── Status pill ────────────────────────────────────────── */
const StatusPill = ({ status }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status?.color || "#6366f1" }} />
    {status?.name || "No status"}
  </span>
);

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
    if (userRole !== "team_leader" && userRole !== "worker") return true;
    if (project.company_managed === true) return false;
    else if (project.by_tl_managed === true) return userRole === "team_leader";
    else if (project.team_managed === true) return true;
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
          members.push({ ...m, type: m.type || (m.is_admin || m.is_superadmin ? "admin" : "worker") });
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
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  const getMemberInitials = (m) =>
    `${m.first_name.charAt(0)}${m.last_name ? m.last_name.charAt(0) : ""}`.toUpperCase();

  const getSelectedMembersData = () => {
    if (!task?.worker_ids) return [];
    return availableMembers.filter(m =>
      task.worker_ids.some(w => (typeof w === "object" ? w.user_id : w) === m.user_id)
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

  const handleTaskStatusChange = async (newStatusId) => {
    try {
      await taskService.updateTask(task.task_id || task.id, { status_id: newStatusId });
      setTask(prev => ({ ...prev, status_id: newStatusId }));
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const openAddSubTask = () => {
    setEditingSubTask(null);
    setSubTaskForm({
      title: "", description: "", priority: "medium",
      start_date: "", due_date: "", role_id: null, role: null,
      estimated_hours: "", actual_hours: "", remark: "",
      status_id: statuses[0]?.status_id || 1
    });
    setIsSubTaskSheetOpen(true);
  };

  const openEditSubTask = (subTask) => {
    setEditingSubTask(subTask);
    setSubTaskForm({
      title: subTask.title, description: subTask.description || "",
      priority: subTask.priority || "medium",
      start_date: subTask.start_date || "", due_date: subTask.due_date || "",
      role_id: subTask.role_id || null, role: subTask.role || null,
      estimated_hours: subTask.estimated_hours || "", actual_hours: subTask.actual_hours || "",
      remark: subTask.remark || "", status_id: subTask.status_id || statuses[0]?.status_id || 1
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

  const handleSubTaskStatusChange = async (subTaskId, newStatusId) => {
    setSubTasks(prev =>
      prev.map(st => st.id === subTaskId ? { ...st, status_id: newStatusId } : st)
    );
    try {
      await subTaskService.updateSubTask(subTaskId, { status_id: newStatusId });
    } catch (err) {
      fetchData();
    }
  };

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-slate-50">
        <div className="relative">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        </div>
        <p className="text-slate-400 font-medium text-xs mt-4 uppercase tracking-widest animate-pulse">Loading task…</p>
      </div>
    );
  }

  const currentTaskStatus = statuses.find(s => s.status_id === task?.status_id);
  const completedSubTasks = subTasks.filter(st => {
    const s = statuses.find(x => x.status_id === st.status_id);
    return s?.name?.toLowerCase().includes("done") || s?.name?.toLowerCase().includes("complete");
  }).length;
  const progress = subTasks.length > 0 ? Math.round((completedSubTasks / subTasks.length) * 100) : 0;

  /* ── Shared textarea style ───────────────────────────────── */
  const textareaClass =
    "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow bg-white placeholder:text-slate-300";

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50/60">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200 bg-white/80 backdrop-blur-sm shrink-0">
        <button
          onClick={() => navigate(`/tasks/project/${projectId}`)}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200" />

        {/* Status dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: currentTaskStatus?.color || "#6366f1" }}
              />
              <span className="text-sm font-semibold text-slate-700">{currentTaskStatus?.name || "Status"}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {statuses.map(status => (
              <DropdownMenuItem key={status.status_id} onClick={() => handleTaskStatusChange(status.status_id)} className="cursor-pointer">
                <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: status.color }} />
                {status.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <h1 className="flex-1 text-sm font-semibold text-slate-900 truncate">{task?.title}</h1>

        {/* Priority chip */}
        {task?.priority && <PriorityPill priority={task.priority} />}

        <div className="h-4 w-px bg-slate-200" />

        {!isEditing ? (
          canAddEditDelete() && (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-slate-900 hover:bg-slate-700 text-white transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </button>
          )
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </button>
          </div>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Task details */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="max-w-2xl mx-auto space-y-7">

            {isEditing ? (
              /* ── EDIT MODE ──────────────────────────────────── */
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Task Title</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="text-xl font-bold text-slate-900 border-slate-200 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <CheckSquare className="h-3 w-3" /> Status
                    </Label>
                    <Select value={editForm.status_id?.toString()} onValueChange={(val) => setEditForm({ ...editForm, status_id: parseInt(val) })}>
                      <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s.status_id} value={s.status_id.toString()}>
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3" /> Priority
                    </Label>
                    <Select value={editForm.priority} onValueChange={(val) => setEditForm({ ...editForm, priority: val })}>
                      <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Start Date
                    </Label>
                    <Input type="date" value={editForm.start_date} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} className="border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Due Date
                    </Label>
                    <Input type="date" value={editForm.due_date} onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} className="border-slate-200" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Description</Label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Add a description…" className={`${textareaClass} min-h-[100px]`} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Target className="h-3 w-3" /> Goal
                  </Label>
                  <textarea value={editForm.goal} onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })} placeholder="Add a goal…" className={`${textareaClass} min-h-[80px]`} />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Estimated Hours
                    </Label>
                    <Input type="number" step="0.5" value={editForm.estimated_hours} onChange={(e) => setEditForm({ ...editForm, estimated_hours: e.target.value })} placeholder="0" className="border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Actual Hours
                    </Label>
                    <Input type="number" step="0.5" value={editForm.actual_hours} onChange={(e) => setEditForm({ ...editForm, actual_hours: e.target.value })} placeholder="0" className="border-slate-200" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" /> Remarks
                  </Label>
                  <textarea value={editForm.remark} onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })} placeholder="Add remarks…" className={`${textareaClass} min-h-[60px]`} />
                </div>
              </>
            ) : (
              /* ── VIEW MODE ──────────────────────────────────── */
              <>
                {/* Title */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Task Title</p>
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">{task?.title}</h2>
                </div>

                {/* Meta row: status + priority + dates */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <FieldBlock icon={CheckSquare} label="Status">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 hover:bg-slate-100 px-2 py-1 -ml-2 rounded-lg transition-colors w-fit">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: currentTaskStatus?.color || "#6366f1" }} />
                          <span className="text-sm font-semibold text-slate-700">{currentTaskStatus?.name || "Not set"}</span>
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44">
                        {statuses.map(status => (
                          <DropdownMenuItem key={status.status_id} onClick={() => handleTaskStatusChange(status.status_id)} className="cursor-pointer">
                            <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: status.color }} />
                            {status.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FieldBlock>

                  <FieldBlock icon={AlertCircle} label="Priority">
                    {task?.priority
                      ? <PriorityPill priority={task.priority} />
                      : <span className="text-slate-400 text-sm">Not set</span>}
                  </FieldBlock>

                  <FieldBlock icon={Calendar} label="Start Date">
                    {task?.start_date
                      ? <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">{formatDate(task.start_date)}</span>
                      : <span className="text-slate-400 text-sm">Not set</span>}
                  </FieldBlock>

                  <FieldBlock icon={Calendar} label="Due Date">
                    {task?.due_date ? (
                      <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${isOverdue(task.due_date) ? "text-red-500" : "text-slate-700"}`}>
                        {formatDate(task.due_date)}
                        {isOverdue(task.due_date) && <span className="text-[10px] font-bold bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">Overdue</span>}
                      </span>
                    ) : <span className="text-slate-400 text-sm">Not set</span>}
                  </FieldBlock>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-slate-200" />

                {/* Hours */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <FieldBlock icon={Clock} label="Estimated Hours">
                    {task?.estimated_hours
                      ? <span className="text-sm font-semibold text-slate-700">{task.estimated_hours}h</span>
                      : <span className="text-slate-400 text-sm">Not set</span>}
                  </FieldBlock>
                  <FieldBlock icon={Clock} label="Actual Hours">
                    {task?.actual_hours
                      ? <span className="text-sm font-semibold text-slate-700">{task.actual_hours}h</span>
                      : <span className="text-slate-400 text-sm">Not set</span>}
                  </FieldBlock>
                </div>

                {/* Description */}
                <FieldBlock icon={MessageSquare} label="Description">
                  {task?.description
                    ? <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
                    : <span className="text-slate-400 text-sm italic">No description</span>}
                </FieldBlock>

                {/* Goal */}
                <FieldBlock icon={Target} label="Goal">
                  {task?.goal
                    ? (
                      <div className="flex items-start gap-2.5 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <Target className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-indigo-700 leading-relaxed font-medium">{task.goal}</p>
                      </div>
                    )
                    : <span className="text-slate-400 text-sm italic">No goal</span>}
                </FieldBlock>

                {/* Assigned members */}
                <FieldBlock icon={User} label="Assigned Members">
                  <div className="flex flex-wrap gap-2 mt-0.5">
                    {getSelectedMembersData().length > 0
                      ? getSelectedMembersData().map(member => (
                        <div key={member.user_id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                          <div
                            className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                            style={{ backgroundColor: avatarColor(member.user_id) }}
                          >
                            {getMemberInitials(member)}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{member.first_name} {member.last_name}</span>
                        </div>
                      ))
                      : <span className="text-slate-400 text-sm italic">No members assigned</span>}
                  </div>
                </FieldBlock>

                {/* Remarks */}
                <FieldBlock icon={MessageSquare} label="Remarks">
                  {task?.remark
                    ? <p className="text-sm text-slate-600 leading-relaxed">{task.remark}</p>
                    : <span className="text-slate-400 text-sm italic">No remarks</span>}
                </FieldBlock>

                {/* Divider */}
                <div className="border-t border-dashed border-slate-200" />

                {/* Flags */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <FieldBlock icon={Layers} label="Project Access">
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {project?.company_managed && <Badge className="bg-blue-50 text-blue-600 border border-blue-200 font-semibold text-xs">Company Managed</Badge>}
                      {project?.team_managed && <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold text-xs">Team Managed</Badge>}
                      {project?.by_tl_managed && <Badge className="bg-amber-50 text-amber-600 border border-amber-200 font-semibold text-xs">TL Managed</Badge>}
                      {!project?.company_managed && !project?.team_managed && !project?.by_tl_managed && (
                        <span className="text-slate-400 text-sm italic">None</span>
                      )}
                    </div>
                  </FieldBlock>

                  <FieldBlock icon={AlertCircle} label="Status Flags">
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {(() => {
                        const s = statuses.find(x => x.status_id === task?.status_id);
                        return s?.is_confidential
                          ? <Badge className="bg-red-50 text-red-600 border border-red-200 font-semibold text-xs">Confidential</Badge>
                          : <span className="text-slate-400 text-sm italic">None</span>;
                      })()}
                    </div>
                  </FieldBlock>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right: Subtasks panel ──────────────────────────── */}
        <div className="w-[380px] flex flex-col bg-white border-l border-slate-200 shrink-0">

          {/* Panel header */}
          <div className="px-5 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Subtasks</h2>
                {subTasks.length > 0 && (
                  <span className="h-5 px-1.5 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                    {subTasks.length}
                  </span>
                )}
              </div>
              {canAddEditDelete() && (
                <button
                  onClick={openAddSubTask}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Subtask
                </button>
              )}
            </div>

            {/* Progress bar */}
            {subTasks.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Progress</span>
                  <span className="text-[10px] font-bold text-slate-600">{completedSubTasks}/{subTasks.length} done</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subtask list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {subTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                  <CheckSquare className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-500">No subtasks yet</p>
                <p className="text-xs text-slate-400 mt-1">Break this task into smaller steps</p>
              </div>
            ) : (
              subTasks.map((subTask) => {
                const status = statuses.find(s => s.status_id === subTask.status_id);
                const pCfg = PRIORITY[subTask.priority] || PRIORITY.medium;
                const overdue = isOverdue(subTask.due_date);

                return (
                  <div
                    key={subTask.id}
                    className="group relative bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 transition-all duration-200 overflow-hidden"
                  >
                    {/* Priority accent bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                      style={{ backgroundColor: pCfg.dot }}
                    />

                    <div className="pl-4 pr-3 py-3.5">
                      {/* Row 1: title + actions */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-800 leading-snug flex-1 min-w-0 pr-1">
                          {subTask.title}
                        </h3>

                        {canAddEditDelete() && (
                          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditSubTask(subTask)}
                              className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                              title="Edit"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubTask(subTask.id)}
                              className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Row 2: status + priority pills */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: status?.color || "#6366f1" }} />
                              <span className="text-[10px] font-semibold text-slate-600">{status?.name || "Status"}</span>
                              <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-40">
                            {statuses.map(s => (
                              <DropdownMenuItem
                                key={s.status_id}
                                onClick={() => handleSubTaskStatusChange(subTask.id, s.status_id)}
                                className="cursor-pointer text-xs"
                              >
                                <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: s.color }} />
                                {s.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                          style={{ backgroundColor: pCfg.bg, color: pCfg.text, borderColor: pCfg.border }}
                        >
                          {pCfg.label}
                        </span>
                      </div>

                      {/* Description */}
                      {subTask.description && (
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                          {subTask.description}
                        </p>
                      )}

                      {/* Row 3: meta info */}
                      {(subTask.start_date || subTask.due_date || subTask.estimated_hours || subTask.actual_hours || subTask.assigned_person) && (
                        <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 flex-wrap">
                          {subTask.start_date && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <Calendar className="h-2.5 w-2.5" />
                              {formatDate(subTask.start_date)}
                            </span>
                          )}
                          {subTask.due_date && (
                            <span className={`flex items-center gap-1 text-[10px] font-semibold ${overdue ? "text-red-500" : "text-slate-400"}`}>
                              <Calendar className="h-2.5 w-2.5" />
                              Due {formatDate(subTask.due_date)}
                              {overdue && <span className="ml-0.5 text-[9px] bg-red-100 text-red-500 px-1 rounded-full">Late</span>}
                            </span>
                          )}
                          {(subTask.estimated_hours || subTask.actual_hours) && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <Clock className="h-2.5 w-2.5" />
                              {subTask.estimated_hours ? `${subTask.estimated_hours}h est` : ""}
                              {subTask.estimated_hours && subTask.actual_hours ? " · " : ""}
                              {subTask.actual_hours ? `${subTask.actual_hours}h actual` : ""}
                            </span>
                          )}
                          {subTask.assigned_person && (
                            <div className="ml-auto flex items-center gap-1.5">
                              <div
                                className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white"
                                style={{ backgroundColor: avatarColor(subTask.assigned_person.user_id || subTask.role_id) }}
                              >
                                {(subTask.assigned_person.first_name?.charAt(0) || "?").toUpperCase()}
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">{subTask.assigned_person.first_name}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Sheet: Add / Edit Subtask ─────────────────────────── */}
      <Sheet open={isSubTaskSheetOpen} onOpenChange={setIsSubTaskSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
          <SheetHeader className="sticky top-0 bg-white z-10 pb-4 border-b border-slate-100">
            <SheetTitle className="text-base font-bold text-slate-900">
              {editingSubTask ? "Edit Subtask" : "New Subtask"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-5 mt-6 pb-24">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Title *</Label>
              <Input
                value={subTaskForm.title}
                onChange={(e) => setSubTaskForm({ ...subTaskForm, title: e.target.value })}
                placeholder="Subtask title"
                className="border-slate-200 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Status</Label>
                <Select value={subTaskForm.status_id?.toString()} onValueChange={(val) => setSubTaskForm({ ...subTaskForm, status_id: parseInt(val) })}>
                  <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s.status_id} value={s.status_id.toString()}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />{s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Priority</Label>
                <Select value={subTaskForm.priority} onValueChange={(val) => setSubTaskForm({ ...subTaskForm, priority: val })}>
                  <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Start Date</Label>
                <Input type="date" value={subTaskForm.start_date} onChange={(e) => setSubTaskForm({ ...subTaskForm, start_date: e.target.value })} className="border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Due Date</Label>
                <Input type="date" value={subTaskForm.due_date} onChange={(e) => setSubTaskForm({ ...subTaskForm, due_date: e.target.value })} className="border-slate-200" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Description</Label>
              <textarea value={subTaskForm.description} onChange={(e) => setSubTaskForm({ ...subTaskForm, description: e.target.value })} placeholder="What needs to be done?" className={`${textareaClass} min-h-[80px]`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Est. Hours</Label>
                <Input type="number" step="0.5" value={subTaskForm.estimated_hours} onChange={(e) => setSubTaskForm({ ...subTaskForm, estimated_hours: e.target.value })} placeholder="0" className="border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Actual Hours</Label>
                <Input type="number" step="0.5" value={subTaskForm.actual_hours} onChange={(e) => setSubTaskForm({ ...subTaskForm, actual_hours: e.target.value })} placeholder="0" className="border-slate-200" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Assigned To</Label>
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
                <SelectTrigger className="border-slate-200"><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>
                  {availableMembers.map(m => (
                    <SelectItem key={`${m.type}-${m.user_id}`} value={`${m.type}-${m.user_id}`}>
                      {m.first_name} {m.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Remarks</Label>
              <textarea value={subTaskForm.remark} onChange={(e) => setSubTaskForm({ ...subTaskForm, remark: e.target.value })} placeholder="Any notes…" className={`${textareaClass} min-h-[60px]`} />
            </div>
          </div>

          <SheetFooter className="sticky bottom-0 bg-white z-10 pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => setIsSubTaskSheetOpen(false)}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSubTask}
              disabled={isSavingSubTask || !subTaskForm.title}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingSubTask ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingSubTask ? "Update" : "Create"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TaskDetailPage;