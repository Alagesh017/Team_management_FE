import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../../projects/services/projectService";
import { taskService } from "../services/taskService";
import { projectTaskService } from "../services/projectTaskService";
import { useAuth } from "../../auth/contexts/AuthContext";
import {
  Loader2, AlertCircle, Clock, Calendar, Plus, X, Check, User, Save,
  ChevronRight, Flame, MoreHorizontal, Trash2
} from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../common/components/ui/dialog";
import { Input } from "../../../common/components/ui/input";
import { Checkbox } from "../../../common/components/ui/checkbox";

/* ─── Avatar colours cycling through a palette ─── */
const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];
const avatarColor = (userId) =>
  AVATAR_COLORS[(userId || 0) % AVATAR_COLORS.length];

/* ─── Priority badge config ─── */
const PRIORITY = {
  high:   { label: "High",   bg: "#fef2f2", text: "#ef4444", dot: "#ef4444" },
  medium: { label: "Medium", bg: "#fffbeb", text: "#f59e0b", dot: "#f59e0b" },
  low:    { label: "Low",    bg: "#f0fdf4", text: "#22c55e", dot: "#22c55e" },
};

const TaskBoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject]               = useState(null);
  const [allocation, setAllocation]         = useState(null);
  const [statuses, setStatuses]             = useState([]);
  const [allocatedMembers, setAllocatedMembers] = useState([]);
  const [allAdmins, setAllAdmins]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [draggedTask, setDraggedTask]       = useState(null);

  /* per-column "add task" state */
  const [activeColumn, setActiveColumn]     = useState(null); // status_id of open add-panel
  const [newTaskTitle, setNewTaskTitle]     = useState("");
  const [newTaskStartDate, setNewTaskStartDate] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSaving, setIsSaving]             = useState(false);

  /* member dialog */
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [memberSearch, setMemberSearch]     = useState("");
  
  /* task details dialog */
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskData, setEditTaskData] = useState({});
  const [editSelectedMembers, setEditSelectedMembers] = useState([]);
  
  /* delete task dialog */
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  /* ── derived ── */
  const availableMembers = useMemo(() => {
    const seen = new Set();
    const combined = [];
    
    const allMembers = [...allAdmins, ...allocatedMembers];
    
    allMembers.forEach((m) => {
      const memberType = m.type || (m.is_admin || m.is_superadmin ? "admin" : "worker");
      const uniqueKey = `${memberType}-${m.user_id}`;
      
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        combined.push({
          ...m,
          type: memberType
        });
      }
    });
    return combined;
  }, [allAdmins, allocatedMembers]);

  const filteredMembers = useMemo(() =>
    availableMembers.filter((m) =>
      `${m.first_name} ${m.last_name} ${m.email}`
        .toLowerCase().includes(memberSearch.toLowerCase())
    ), [availableMembers, memberSearch]);

  /* ── data ── */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectData, projectTaskData] = await Promise.all([
        projectService.getProjectById(id),
        projectTaskService.getProjectTaskData(id),
      ]);
      setProject(projectData.project || projectData);
      setAllocation(projectTaskData.allocation);
      setStatuses(projectTaskData.statuses || []);
      setAllocatedMembers(projectTaskData.allocated_members || []);
      setAllAdmins(projectTaskData.all_admins || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchData(); }, [id]);

  /* ── helpers ── */
  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const getMemberInitials = (m) =>
    `${m.first_name.charAt(0)}${m.last_name ? m.last_name.charAt(0) : ""}`.toUpperCase();

  /* ── actions ── */
  const openAddPanel = (statusId) => {
    setActiveColumn(statusId);
    setNewTaskTitle("");
    setNewTaskStartDate("");
    setNewTaskDueDate("");
    setNewTaskPriority("medium");
    setSelectedMembers([]);
  };

  const closeAddPanel = () => {
    setActiveColumn(null);
    setNewTaskTitle("");
    setNewTaskStartDate("");
    setNewTaskDueDate("");
    setNewTaskPriority("medium");
    setSelectedMembers([]);
  };

  const getMemberKey = (member) => `${member.type}-${member.user_id}`;

  const getMemberKeyFromItem = (item) => {
    if (typeof item === "object" && item !== null) {
      return `${item.type || "worker"}-${item.user_id}`;
    }
    return `worker-${item}`;
  };

  const openTaskDetails = (task, e) => {
    if (e && e.target.closest('button')) {
      return;
    }
    navigate(`/tasks/project/${id}/task/${task.task_id || task.id}`);
  };

  const handleAddTask = async (statusId) => {
    if (!newTaskTitle.trim()) return;
    try {
      setIsSaving(true);
      const workerIdsWithType = selectedMembers.length > 0 
        ? selectedMembers.map(key => {
            const member = availableMembers.find(m => getMemberKey(m) === key);
            return { user_id: member?.user_id, type: member?.type || "worker" };
          })
        : null;
      await taskService.createTask({
        project_id: parseInt(id),
        allocation_id: allocation?.allocation_id || null,
        status_id: statusId,
        title: newTaskTitle,
        worker_ids: workerIdsWithType,
        assigned_by: user?.userId || 1,
        priority: newTaskPriority,
        start_date: newTaskStartDate || null,
        due_date: newTaskDueDate || null,
      });
      closeAddPanel();
      fetchData();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTask = async () => {
    if (!editTaskData.title.trim()) return;
    try {
      setIsSaving(true);
      const workerIdsWithType = editSelectedMembers.length > 0 
        ? editSelectedMembers.map(key => {
            const member = availableMembers.find(m => getMemberKey(m) === key);
            return { user_id: member?.user_id, type: member?.type || "worker" };
          })
        : null;
      await taskService.updateTask(selectedTask.task_id, {
        ...editTaskData,
        worker_ids: workerIdsWithType,
        estimated_hours: editTaskData.estimated_hours ? parseFloat(editTaskData.estimated_hours) : null,
        actual_hours: editTaskData.actual_hours ? parseFloat(editTaskData.actual_hours) : null,
      });
      await fetchData();
      setIsTaskDetailsOpen(false);
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMember = (member) => {
    const key = getMemberKey(member);
    setSelectedMembers((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const toggleEditMember = (member) => {
    const key = getMemberKey(member);
    setEditSelectedMembers((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const getSelectedMembersData = () =>
    availableMembers.filter((m) => selectedMembers.includes(getMemberKey(m)));

  const getEditSelectedMembersData = () =>
    availableMembers.filter((m) => editSelectedMembers.includes(getMemberKey(m)));

  /* ── drag and drop ── */
  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = async (statusId) => {
    if (!draggedTask || draggedTask.status_id === statusId) {
      setDraggedTask(null);
      return;
    }

    try {
      await taskService.updateTask(draggedTask.task_id, {
        status_id: statusId
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to update task status:", err);
    } finally {
      setDraggedTask(null);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      setIsSaving(true);
      await taskService.deleteTask(taskToDelete.task_id);
      await fetchData();
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error("Failed to delete task:", err);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-400 font-medium">Loading board…</p>
        </div>
      </div>
    );
  }

  /* ── Avatar stack component ── */
  const AvatarStack = ({ workers, size = 8, border = "border-white" }) => (
    <div className="flex -space-x-2">
      {workers.slice(0, 3).map((w, i) => (
        <div
          key={w.user_id}
          title={`${w.first_name} ${w.last_name}`}
          className={`h-${size} w-${size} rounded-full flex items-center justify-center text-white text-xs font-bold border-2 ${border} shadow-sm`}
          style={{ backgroundColor: avatarColor(w.user_id), zIndex: workers.length - i }}
        >
          {getMemberInitials(w)}
        </div>
      ))}
      {workers.length > 3 && (
        <div
          className={`h-${size} w-${size} rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold border-2 ${border}`}
        >
          +{workers.length - 3}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="flex flex-col h-[calc(100vh-80px)] w-[calc(100vw-5px)] lg:w-[calc(100vw-300px)] overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/70 backdrop-blur shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 truncate">
                {project ? project.name : "Project Tasks"}
              </h1>
              <ChevronRight className="h-4 w-4 text-slate-300" />
              <span className="text-sm text-slate-400 font-medium">Board</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {statuses.reduce((acc, s) => acc + (s.tasks?.length || 0), 0)} tasks across {statuses.length} columns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* member pile */}
          <div className="flex -space-x-2 mr-2">
            {availableMembers.slice(0, 5).map((m) => (
              <div
                key={m.user_id}
                title={`${m.first_name} ${m.last_name}`}
                className="h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow"
                style={{ backgroundColor: avatarColor(m.user_id) }}
              >
                {getMemberInitials(m)}
              </div>
            ))}
            {availableMembers.length > 5 && (
              <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                +{availableMembers.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Columns ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex gap-4 overflow-x-auto h-full px-6 py-5 pb-6">
          {statuses.map((status) => {
            const statusTasks = status.tasks || [];
            const color = status.color || "#6366f1";
            const isAddOpen = activeColumn === status.status_id;

            return (
              <div
                key={status.status_id}
                className="flex-shrink-0 w-72 flex flex-col h-full rounded-2xl overflow-hidden"
                style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
              >
                {/* Column header */}
                <div className="px-4 pt-4 pb-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-slate-700 text-sm tracking-wide uppercase" style={{ letterSpacing: "0.04em" }}>
                        {status.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${color}18`, color }}
                      >
                        {statusTasks.length}
                      </span>
                      <button className="h-6 w-6 rounded-md flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* color bar */}
                  <div className="h-0.5 rounded-full mt-3" style={{ backgroundColor: color, opacity: 0.3 }} />
                </div>

                {/* Tasks */}
                <div 
                  className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(status.status_id)}
                >
                  {statusTasks.map((task) => {
                    const p = PRIORITY[task.priority] || PRIORITY.medium;
                    return (
                      <div
                        key={task.task_id}
                        className="group rounded-xl p-3.5 border border-slate-100 cursor-pointer transition-all duration-150"
                        style={{
                          background: "#fafafa",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => openTaskDetails(task, e)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fafafa";
                          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {/* priority + title */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <h4 className="font-medium text-slate-800 text-sm leading-snug flex-1">{task.title}</h4>
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTaskToDelete(task);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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
                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                <Calendar className="h-3 w-3" />
                                <span>Start: {formatDate(task.start_date)}</span>
                              </div>
                            )}
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                <Calendar className="h-3 w-3" />
                                <span>Due: {formatDate(task.due_date)}</span>
                              </div>
                            )}
                            {task.estimated_hours && (
                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
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
                  })}

                  {/* ── Add task panel ── */}
                  {isAddOpen ? (
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
                          if (e.key === "Enter") handleAddTask(status.status_id);
                          if (e.key === "Escape") closeAddPanel();
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
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Due date</label>
                          <Input
                            type="date"
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>

                      {/* assigned members mini-row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setIsMemberDialogOpen(true)}
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
                          onClick={closeAddPanel}
                          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={!newTaskTitle.trim() || isSaving}
                          onClick={() => handleAddTask(status.status_id)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                          Save task
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openAddPanel(status.status_id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium border-2 border-dashed border-slate-100 hover:border-slate-200 group"
                    >
                      <div className="h-5 w-5 rounded-md bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                        <Plus className="h-3 w-3 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      Add task
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {statuses.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-7 w-7 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No statuses configured</p>
                <p className="text-slate-400 text-sm mt-1">Add statuses to start organizing tasks</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Assign People Dialog ── */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden gap-0">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-semibold text-slate-800">Assign people</DialogTitle>
          </DialogHeader>

          <div className="px-4 py-3 border-b border-slate-100">
            <Input
              placeholder="Search by name or email…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="h-9 text-sm border-slate-200 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="max-h-64 overflow-y-auto px-2 py-2 space-y-0.5">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-6">No members found</p>
            ) : (
              filteredMembers.map((member) => {
                const key = getMemberKey(member);
                const selected = selectedMembers.includes(key);
                return (
                  <div
                    key={key}
                    onClick={() => toggleMember(member)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      selected ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
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
                        selected
                          ? "bg-indigo-600 border-indigo-600"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-400">
              {selectedMembers.length > 0 ? `${selectedMembers.length} selected` : "No one selected"}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => { setIsMemberDialogOpen(false); setMemberSearch(""); }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => { setIsMemberDialogOpen(false); setMemberSearch(""); }}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Task Details Dialog ── */}
      <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden gap-0">
          {selectedTask && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-semibold text-slate-800">
                    {isEditingTask ? "Edit Task" : "Task Details"}
                  </DialogTitle>
                  {!isEditingTask && (
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
                      onChange={(e) => setEditTaskData({ ...editTaskData, status_id: parseInt(e.target.value) })}
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
                      {statuses.find(s => s.status_id === selectedTask.status_id)?.name}
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
                      style={{ background: PRIORITY[selectedTask.priority]?.bg, color: PRIORITY[selectedTask.priority]?.text }}
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
                      <p className="text-sm text-slate-700">{selectedTask.start_date ? formatDate(selectedTask.start_date) : "-"}</p>
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
                      <p className="text-sm text-slate-700">{selectedTask.due_date ? formatDate(selectedTask.due_date) : "-"}</p>
                    )}
                  </div>
                </div>

                {/* Estimated & Actual Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Estimated Hours</label>
                    {isEditingTask ? (
                      <Input
                        type="number"
                        step="0.5"
                        value={editTaskData.estimated_hours}
                        onChange={(e) => setEditTaskData({ ...editTaskData, estimated_hours: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{selectedTask.estimated_hours ? `${selectedTask.estimated_hours}h` : "-"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Actual Hours</label>
                    {isEditingTask ? (
                      <Input
                        type="number"
                        step="0.5"
                        value={editTaskData.actual_hours}
                        onChange={(e) => setEditTaskData({ ...editTaskData, actual_hours: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{selectedTask.actual_hours ? `${selectedTask.actual_hours}h` : "-"}</p>
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
                            onClick={() => toggleEditMember(member)}
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
                                selected
                                  ? "bg-indigo-600 border-indigo-600"
                                  : "border-slate-200 bg-white"
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
                      {selectedTask.assigned_workers && selectedTask.assigned_workers.length > 0 ? (
                        <div className="flex -space-x-2">
                          {selectedTask.assigned_workers.map((w, i) => (
                            <div
                              key={w.user_id}
                              title={`${w.first_name} ${w.last_name}`}
                              className="h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow"
                              style={{ backgroundColor: avatarColor(w.user_id), zIndex: selectedTask.assigned_workers.length - i }}
                            >
                              {`${w.first_name.charAt(0)}${w.last_name ? w.last_name.charAt(0) : ""}`.toUpperCase()}
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
                      onClick={handleEditTask}
                      disabled={!editTaskData.title.trim() || isSaving}
                      className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTaskDetailsOpen(false)}
                    className="h-8 text-xs ml-auto"
                  >
                    Close
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Task Dialog ── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-semibold text-slate-800">Delete Task</DialogTitle>
          </DialogHeader>
          
          <div className="px-6 py-6">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-800">{taskToDelete?.title}</span>? This action cannot be undone.
            </p>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setTaskToDelete(null);
              }}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteTask}
              disabled={isSaving}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskBoardPage;
