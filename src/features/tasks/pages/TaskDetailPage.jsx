import React, { useRef, useEffect, useState } from "react";
import {
  ChevronLeft,
  Plus,
  Trash2,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  ChevronDown,
  Target,
  MessageSquare,
  CheckSquare,
  Layers,
  Save,
  Edit3,
  CheckCircle2,
  PanelRightOpen,
  PanelRightClose,
  Menu,
  FileText,
  Download,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Label } from "../../../common/components/ui/label";
import { Badge } from "../../../common/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../common/components/ui/dropdown-menu";
import { useTaskDetail } from "../hooks/useTaskDetail";
import api from "../../../core/interceptors/axiosInterceptor";
import AddEditSubTaskPanel from "../components/board/AddEditSubTaskPanel";

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

/* ─── Priority pill ──────────────────────────────────────── */
const PriorityPill = ({ priority, onDoubleClick, canEdit }) => {
  const cfg = PRIORITY[priority] || PRIORITY.medium;
  return (
    <span
      onDoubleClick={onDoubleClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${canEdit ? 'cursor-pointer hover:border-slate-400' : ''}`}
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const TaskDetailPage = () => {
  const {
    taskId,
    projectId,
    navigate,
    task,
    project,
    subTasks,
    statuses,
    availableMembers,
    attachments,
    loading,
    editingField,
    setEditingField,
    editValues,
    isSaving,
    lastSaved,
    handleFieldChange,
    handleStatusChange,
    handlePriorityChange,
    canAddEditDelete,
    isSubTaskSidebarOpen,
    setIsSubTaskSidebarOpen,
    isAddingSubTask,
    editingSubTaskId,
    newSubTaskTitle,
    setNewSubTaskTitle,
    newSubTaskDescription,
    setNewSubTaskDescription,
    newSubTaskPriority,
    setNewSubTaskPriority,
    newSubTaskStartDate,
    setNewSubTaskStartDate,
    newSubTaskDueDate,
    setNewSubTaskDueDate,
    newSubTaskEstimatedHours,
    setNewSubTaskEstimatedHours,
    newSubTaskActualHours,
    setNewSubTaskActualHours,
    newSubTaskRole,
    setNewSubTaskRole,
    newSubTaskRoleId,
    setNewSubTaskRoleId,
    newSubTaskRemark,
    setNewSubTaskRemark,
    newSubTaskStatusId,
    setNewSubTaskStatusId,
    isSavingSubTask,
    openAddSubTask,
    openEditSubTask,
    closeSubTaskForm,
    handleSaveSubTask,
    handleDeleteSubTask,
    handleSubTaskStatusChange,
    handleUploadAttachment,
    handleDownloadAttachment,
    handleDeleteAttachment,
  } = useTaskDetail();

  const titleInputRef = useRef(null);
  const descInputRef = useRef(null);
  const goalInputRef = useRef(null);
  const remarkInputRef = useRef(null);
  const estHoursRef = useRef(null);
  const actHoursRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [imageUrls, setImageUrls] = useState({}); // key: attachment.id, value: object URL

  const loadImage = async (attachment) => {
    try {
      let response;
      let url;
      
      // If it's a /src/assets/ URL, use the static file route
      if (attachment.file_url && attachment.file_url.startsWith("/src/assets/")) {
        // Extract the filename
        const filename = attachment.file_url.split("/").pop();
        response = await api.get(`/src/assets/attachments/${filename}`, {
          responseType: "blob",
        });
      } 
      // Else, use the download endpoint
      else {
        const filename = attachment.file_url?.split("/").pop() || attachment.file_url;
        response = await api.get(`/task_attachments/download/${filename}`, {
          responseType: "blob",
        });
      }
      
      url = URL.createObjectURL(response.data);
      setImageUrls(prev => ({ ...prev, [attachment.id]: url }));
    } catch (err) {
      console.error("Failed to load image:", err);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  // Load images when attachments change
  useEffect(() => {
    attachments.forEach(attachment => {
      if (isImageFile(attachment.file_name) && !imageUrls[attachment.id]) {
        loadImage(attachment);
      }
    });
  }, [attachments]);

  useEffect(() => {
    if (editingField === 'title' && titleInputRef.current) titleInputRef.current.focus();
    if (editingField === 'description' && descInputRef.current) descInputRef.current.focus();
    if (editingField === 'goal' && goalInputRef.current) goalInputRef.current.focus();
    if (editingField === 'remark' && remarkInputRef.current) remarkInputRef.current.focus();
    if (editingField === 'estimated_hours' && estHoursRef.current) estHoursRef.current.focus();
    if (editingField === 'actual_hours' && actHoursRef.current) actHoursRef.current.focus();
  }, [editingField]);

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
    return s?.is_completed;
  }).length;
  const progress = subTasks.length > 0 ? Math.round((completedSubTasks / subTasks.length) * 100) : 0;
  const today = new Date().toISOString().split('T')[0];

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

  const canEdit = canAddEditDelete();

  const isImageFile = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB limit');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    try {
      await handleUploadAttachment(selectedFile);
      setSelectedFile(null);
      setUploadError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err.message || 'Failed to upload file');
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      setEditingField(null);
    }
    if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  const textareaClass =
    "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow bg-white placeholder:text-slate-300";

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50/60 relative overflow-hidden">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 h-[56px] border-b border-slate-200 bg-white/80 backdrop-blur-sm shrink-0">
        <button
          onClick={() => {
            // If task has a sprint_id, go back to that specific sprint page
            if (task?.sprint_id) {
              navigate(`/tasks/project/${projectId}/sprint/${task.sprint_id}`);
            } else {
              // Otherwise, go to the project board
              navigate(`/tasks/project/${projectId}/board`);
            }
          }}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200" />

        {/* Status dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!canEdit}>
            <button className={`flex items-center gap-1.5 md:gap-2 hover:bg-slate-100 px-2 py-1.5 rounded-lg transition-colors ${!canEdit ? 'opacity-80 cursor-default' : ''}`}>
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: currentTaskStatus?.color || "#6366f1" }}
              />
              <span className="text-xs md:text-sm font-semibold text-slate-700">{currentTaskStatus?.name || "Status"}</span>
              {canEdit && <ChevronDown className="h-3 w-3 text-slate-400" />}
            </button>
          </DropdownMenuTrigger>
          {canEdit && (
            <DropdownMenuContent align="start" className="w-44">
              {statuses.filter(s => !s.is_backlog).map(status => (
                <DropdownMenuItem key={status.status_id} onClick={() => handleStatusChange(status.status_id)} className="cursor-pointer">
                  <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: status.color }} />
                  {status.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          {editingField === 'title' ? (
            <Input
              ref={titleInputRef}
              value={editValues.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => handleKeyDown(e, 'title')}
              className="h-8 text-xs md:text-sm font-semibold bg-white"
            />
          ) : (
            <h1 
              onDoubleClick={() => canEdit && setEditingField('title')}
              className={`text-xs md:text-sm font-semibold text-slate-900 truncate ${canEdit ? 'cursor-pointer hover:bg-slate-100/50 px-1 rounded' : ''}`}
            >
              {task?.title}
            </h1>
          )}
        </div>

        {/* Priority chip - hidden label on small mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!canEdit}>
            <button className="shrink-0">
              <PriorityPill priority={task?.priority} canEdit={canEdit} />
            </button>
          </DropdownMenuTrigger>
          {canEdit && (
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePriorityChange('high')}>High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePriorityChange('low')}>Low</DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Subtask Sidebar Toggle (Mobile only) */}
        <button
          onClick={() => setIsSubTaskSidebarOpen(!isSubTaskSidebarOpen)}
          className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          title="Subtasks"
        >
          {isSubTaskSidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </button>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2 shrink-0">
          {isSaving ? (
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-400 font-medium animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-emerald-500 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              <span className="hidden sm:inline">Saved</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* Left: Task details */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 md:py-7">
          <div className="max-w-2xl mx-auto space-y-5 md:space-y-7">

            {/* Title Section */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Task Title</p>
              {editingField === 'title' ? (
                <Input
                  ref={titleInputRef}
                  value={editValues.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => handleKeyDown(e, 'title')}
                  className="text-lg md:text-2xl font-bold text-slate-900 border-slate-200 focus:ring-indigo-500"
                />
              ) : (
                <h2 
                  onDoubleClick={() => canEdit && setEditingField('title')}
                  className={`text-lg md:text-2xl font-bold text-slate-900 leading-snug ${canEdit ? 'cursor-pointer hover:bg-slate-100/50 -ml-1 px-1 rounded' : ''}`}
                >
                  {task?.title}
                </h2>
              )}
            </div>

            {/* Meta row: status + priority + dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-5">
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  <CheckSquare className="h-3 w-3" /> Status
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!canEdit}>
                    <button className={`flex items-center gap-2 hover:bg-slate-100 px-2 py-1 -ml-2 rounded-lg transition-colors w-fit ${!canEdit ? 'cursor-default' : ''}`}>
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: currentTaskStatus?.color || "#6366f1" }} />
                      <span className="text-sm font-semibold text-slate-700">{currentTaskStatus?.name || "Not set"}</span>
                      {canEdit && <ChevronDown className="h-3 w-3 text-slate-400" />}
                    </button>
                  </DropdownMenuTrigger>
                  {canEdit && (
                    <DropdownMenuContent align="start" className="w-44">
                      {statuses.filter(s => !s.is_backlog).map(status => (
                        <DropdownMenuItem key={status.status_id} onClick={() => handleStatusChange(status.status_id)} className="cursor-pointer">
                          <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: status.color }} />
                          {status.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  <AlertCircle className="h-3 w-3" /> Priority
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!canEdit}>
                    <button className="block -ml-2">
                      <PriorityPill priority={task?.priority} canEdit={canEdit} />
                    </button>
                  </DropdownMenuTrigger>
                  {canEdit && (
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handlePriorityChange('high')}>High</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>Medium</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange('low')}>Low</DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  <Calendar className="h-3 w-3" /> Start Date
                </p>
                {canEdit ? (
                  <Input 
                    type="date" 
                    value={editValues.start_date} 
                    onChange={(e) => handleFieldChange('start_date', e.target.value)}
                    className="h-8 w-full sm:w-40 text-sm border-slate-200 focus:ring-indigo-500"
                  />
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    {task?.start_date ? formatDate(task.start_date) : "Not set"}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  <Calendar className="h-3 w-3" /> Due Date
                </p>
                {canEdit ? (
                  <Input 
                    type="date" 
                    value={editValues.due_date} 
                    onChange={(e) => handleFieldChange('due_date', e.target.value)}
                    className={`h-8 w-full sm:w-40 text-sm border-slate-200 focus:ring-indigo-500 ${isOverdue(task?.due_date) ? 'text-red-500' : ''}`}
                  />
                ) : (
                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${isOverdue(task?.due_date) ? "text-red-500" : "text-slate-700"}`}>
                    {task?.due_date ? formatDate(task.due_date) : "Not set"}
                    {isOverdue(task?.due_date) && <span className="text-[10px] font-bold bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">Overdue</span>}
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-200" />

            {/* Hours */}
            <div className="grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-4 md:gap-y-5">
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  <Clock className="h-3 w-3" /> Est. Hours
                </p>
                {editingField === 'estimated_hours' ? (
                  <Input
                    ref={estHoursRef}
                    type="number"
                    step="0.5"
                    value={editValues.estimated_hours}
                    onChange={(e) => handleFieldChange('estimated_hours', e.target.value)}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => handleKeyDown(e, 'estimated_hours')}
                    className="h-8 w-full max-w-[100px] text-sm"
                  />
                ) : (
                  <span 
                    onDoubleClick={() => canEdit && setEditingField('estimated_hours')}
                    className={`text-sm font-semibold text-slate-700 ${canEdit ? 'cursor-pointer hover:bg-slate-100/50 px-1 rounded' : ''}`}
                  >
                    {task?.estimated_hours ? `${task.estimated_hours}h` : "Not set"}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  <Clock className="h-3 w-3" /> Act. Hours
                </p>
                {editingField === 'actual_hours' ? (
                  <Input
                    ref={actHoursRef}
                    type="number"
                    step="0.5"
                    value={editValues.actual_hours}
                    onChange={(e) => handleFieldChange('actual_hours', e.target.value)}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => handleKeyDown(e, 'actual_hours')}
                    className="h-8 w-full max-w-[100px] text-sm"
                  />
                ) : (
                  <span 
                    onDoubleClick={() => canEdit && setEditingField('actual_hours')}
                    className={`text-sm font-semibold text-slate-700 ${canEdit ? 'cursor-pointer hover:bg-slate-100/50 px-1 rounded' : ''}`}
                  >
                    {task?.actual_hours ? `${task.actual_hours}h` : "Not set"}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <MessageSquare className="h-3 w-3" /> Description
              </p>
              {editingField === 'description' ? (
                <textarea
                  ref={descInputRef}
                  value={editValues.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  onBlur={() => setEditingField(null)}
                  className={`${textareaClass} min-h-[120px] md:min-h-[150px]`}
                  placeholder="Add a description..."
                />
              ) : (
                <div 
                  onDoubleClick={() => canEdit && setEditingField('description')}
                  className={`text-sm text-slate-600 leading-relaxed min-h-[2rem] ${canEdit ? 'cursor-pointer hover:bg-slate-100/50 p-1 rounded' : ''}`}
                >
                  {task?.description || <span className="text-slate-400 italic">No description</span>}
                </div>
              )}
            </div>

            {/* Goal */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <Target className="h-3 w-3" /> Goal
              </p>
              {editingField === 'goal' ? (
                <textarea
                  ref={goalInputRef}
                  value={editValues.goal}
                  onChange={(e) => handleFieldChange('goal', e.target.value)}
                  onBlur={() => setEditingField(null)}
                  className={`${textareaClass} min-h-[80px]`}
                  placeholder="Add a goal..."
                />
              ) : (
                <div 
                  onDoubleClick={() => canEdit && setEditingField('goal')}
                  className={`flex items-start gap-2.5 p-3 md:p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl ${canEdit ? 'cursor-pointer hover:bg-indigo-100/50' : ''}`}
                >
                  <Target className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-indigo-700 leading-relaxed font-medium">
                    {task?.goal || <span className="text-indigo-400 italic">No goal set</span>}
                  </p>
                </div>
              )}
            </div>

            {/* Assigned members */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <User className="h-3 w-3" /> Assigned Members
              </p>
              <div className="flex flex-wrap gap-2 mt-0.5">
                {getSelectedMembersData().length > 0
                  ? getSelectedMembersData().map(member => (
                    <div key={member.user_id} className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                      <div
                        className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                        style={{ backgroundColor: avatarColor(member.user_id) }}
                      >
                        {getMemberInitials(member)}
                      </div>
                      <span className="text-[11px] md:text-xs font-semibold text-slate-700">{member.first_name} {member.last_name}</span>
                    </div>
                  ))
                  : <span className="text-slate-400 text-sm italic">No members assigned</span>}
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <MessageSquare className="h-3 w-3" /> Remarks
              </p>
              {editingField === 'remark' ? (
                <textarea
                  ref={remarkInputRef}
                  value={editValues.remark}
                  onChange={(e) => handleFieldChange('remark', e.target.value)}
                  onBlur={() => setEditingField(null)}
                  className={`${textareaClass} min-h-[60px] md:min-h-[80px]`}
                  placeholder="Add remarks..."
                />
              ) : (
                <div 
                  onDoubleClick={() => canEdit && setEditingField('remark')}
                  className={`text-sm text-slate-600 leading-relaxed min-h-[1.5rem] ${canEdit ? 'cursor-pointer hover:bg-slate-100/50 p-1 rounded' : ''}`}
                >
                  {task?.remark || <span className="text-slate-400 italic">No remarks</span>}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <FileText className="h-3 w-3" /> Attachments
              </p>

              {/* Upload area */}
              {canEdit && (
                <div className="space-y-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    {selectedFile ? (
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</span>
                          <span className="text-[10px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileUpload();
                            }}
                            disabled={isSaving}
                          >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                            Upload
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-slate-500 hover:text-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FileText className="h-8 w-8 text-slate-300 mb-2" />
                        <span className="text-sm font-medium text-slate-500">Click to upload a file</span>
                        <span className="text-xs text-slate-400 mt-1">Max 10MB</span>
                      </>
                    )}
                  </div>
                  {uploadError && (
                    <p className="text-xs text-red-500 font-medium">{uploadError}</p>
                  )}
                </div>
              )}

              {/* Attachment list */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachments.map((attachment) => {
                    const isImg = isImageFile(attachment.file_name);
                    return (
                      <div
                        key={attachment.id}
                        className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all"
                      >
                        {isImg ? (
                          <div className="aspect-video bg-slate-100">
                            {imageUrls[attachment.id] ? (
                              <img
                                src={imageUrls[attachment.id]}
                                alt={attachment.file_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-video bg-slate-100 flex items-center justify-center">
                            <FileText className="h-10 w-10 text-slate-300" />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate">{attachment.file_name}</p>
                              {attachment.file_size && (
                                <p className="text-[10px] text-slate-400 mt-0.5">{(attachment.file_size / 1024 / 1024).toFixed(2)} MB</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDownloadAttachment(attachment.file_url, attachment.file_name)}
                                className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                title="Download"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              {canEdit && (
                                <button
                                  onClick={() => handleDeleteAttachment(attachment.id)}
                                  className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {attachments.length === 0 && !canEdit && (
                <p className="text-sm text-slate-400 italic">No attachments</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-200" />

            {/* Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-5">
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  <Layers className="h-3 w-3" /> Project Access
                </p>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {project?.company_managed && <Badge className="bg-blue-50 text-blue-600 border border-blue-200 font-semibold text-xs">Company Managed</Badge>}
                  {project?.team_managed && <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold text-xs">Team Managed</Badge>}
                  {project?.by_tl_managed && <Badge className="bg-amber-50 text-amber-600 border border-amber-200 font-semibold text-xs">TL Managed</Badge>}
                  {!project?.company_managed && !project?.team_managed && !project?.by_tl_managed && (
                    <span className="text-slate-400 text-sm italic">None</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  <AlertCircle className="h-3 w-3" /> Status Flags
                </p>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {currentTaskStatus?.is_confidential
                    ? <Badge className="bg-red-50 text-red-600 border border-red-200 font-semibold text-xs">Confidential</Badge>
                    : <span className="text-slate-400 text-sm italic">None</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Subtasks panel ──────────────────────────── */}
        {/* Mobile Sidebar Overlay */}
        {isSubTaskSidebarOpen && (
          <div 
            className="lg:hidden fixed top-[56px] left-0 right-0 bottom-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsSubTaskSidebarOpen(false)}
          />
        )}

        <div className={`
          fixed lg:static top-[56px] right-0 h-[calc(100vh-80px-56px)] w-[85%] max-w-[380px] lg:w-[380px] lg:top-0 lg:h-full
          flex flex-col bg-white border-l border-slate-200 shrink-0 z-50 lg:z-0
          transition-transform duration-300 ease-in-out
          ${isSubTaskSidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
        `}>

          {/* Panel header */}
          <div className="px-4 md:px-5 py-3 md:py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Subtasks</h2>
                {subTasks.length > 0 && (
                  <span className="h-5 px-1.5 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                    {subTasks.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    onClick={openAddSubTask}
                    className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                )}
                {/* Close sidebar button for mobile */}
                <button
                  onClick={() => setIsSubTaskSidebarOpen(false)}
                  className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <PanelRightClose className="h-4 w-4" />
                </button>
              </div>
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
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2.5">
            {subTasks.length === 0 && !isAddingSubTask ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center px-4">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                  <CheckSquare className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-500">No subtasks yet</p>
                <p className="text-xs text-slate-400 mt-1">Break this task into smaller steps</p>
              </div>
            ) : (
              subTasks.map((subTask) => {
                const isEditing = editingSubTaskId === subTask.id;
                const status = statuses.find(s => s.status_id === subTask.status_id);
                const pCfg = PRIORITY[subTask.priority] || PRIORITY.medium;
                const overdue = isOverdue(subTask.due_date);

                if (isEditing) {
                  return (
                    <AddEditSubTaskPanel
                      key={subTask.id}
                      isEditing={true}
                      subTaskTitle={newSubTaskTitle}
                      setSubTaskTitle={setNewSubTaskTitle}
                      subTaskDescription={newSubTaskDescription}
                      setSubTaskDescription={setNewSubTaskDescription}
                      subTaskPriority={newSubTaskPriority}
                      setSubTaskPriority={setNewSubTaskPriority}
                      subTaskStartDate={newSubTaskStartDate}
                      setSubTaskStartDate={setNewSubTaskStartDate}
                      subTaskDueDate={newSubTaskDueDate}
                      setSubTaskDueDate={setNewSubTaskDueDate}
                      subTaskEstimatedHours={newSubTaskEstimatedHours}
                      setSubTaskEstimatedHours={setNewSubTaskEstimatedHours}
                      subTaskActualHours={newSubTaskActualHours}
                      setSubTaskActualHours={setNewSubTaskActualHours}
                      subTaskRole={newSubTaskRole}
                      setSubTaskRole={setNewSubTaskRole}
                      subTaskRoleId={newSubTaskRoleId}
                      setSubTaskRoleId={setNewSubTaskRoleId}
                      subTaskRemark={newSubTaskRemark}
                      setSubTaskRemark={setNewSubTaskRemark}
                      subTaskStatusId={newSubTaskStatusId}
                      setSubTaskStatusId={setNewSubTaskStatusId}
                      statuses={statuses}
                      availableMembers={availableMembers}
                      isSaving={isSavingSubTask}
                      onSave={handleSaveSubTask}
                      onCancel={closeSubTaskForm}
                    />
                  );
                }

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

                        {canEdit && (
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
                          <DropdownMenuTrigger asChild disabled={!canEdit}>
                            <button className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors ${!canEdit ? 'cursor-default' : ''}`}>
                              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: status?.color || "#6366f1" }} />
                              <span className="text-[10px] font-semibold text-slate-600">{status?.name || "Status"}</span>
                              {canEdit && <ChevronDown className="h-2.5 w-2.5 text-slate-400" />}
                            </button>
                          </DropdownMenuTrigger>
                          {canEdit && (
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
                          )}
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

            {/* Inline add subtask form */}
            {isAddingSubTask && (
              <AddEditSubTaskPanel
                isEditing={false}
                subTaskTitle={newSubTaskTitle}
                setSubTaskTitle={setNewSubTaskTitle}
                subTaskDescription={newSubTaskDescription}
                setSubTaskDescription={setNewSubTaskDescription}
                subTaskPriority={newSubTaskPriority}
                setSubTaskPriority={setNewSubTaskPriority}
                subTaskStartDate={newSubTaskStartDate}
                setSubTaskStartDate={setNewSubTaskStartDate}
                subTaskDueDate={newSubTaskDueDate}
                setSubTaskDueDate={setNewSubTaskDueDate}
                subTaskEstimatedHours={newSubTaskEstimatedHours}
                setSubTaskEstimatedHours={setNewSubTaskEstimatedHours}
                subTaskActualHours={newSubTaskActualHours}
                setSubTaskActualHours={setNewSubTaskActualHours}
                subTaskRole={newSubTaskRole}
                setSubTaskRole={setNewSubTaskRole}
                subTaskRoleId={newSubTaskRoleId}
                setSubTaskRoleId={setNewSubTaskRoleId}
                subTaskRemark={newSubTaskRemark}
                setSubTaskRemark={setNewSubTaskRemark}
                subTaskStatusId={newSubTaskStatusId}
                setSubTaskStatusId={setNewSubTaskStatusId}
                statuses={statuses}
                availableMembers={availableMembers}
                isSaving={isSavingSubTask}
                onSave={handleSaveSubTask}
                onCancel={closeSubTaskForm}
              />
            )}
          </div>
        </div>
      </div>




    </div>
  );
};

export default TaskDetailPage;
