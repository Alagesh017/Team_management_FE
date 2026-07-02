import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useToast } from "../../../common/hooks/use-toast";
import { taskService } from "../services/taskService";
import { subTaskService } from "../services/subTaskService";
import { projectTaskService } from "../services/projectTaskService";
import { projectService } from "../../projects/services/projectService";
import { taskAttachmentService } from "../services/taskAttachmentService";
import api from "../../../core/interceptors/axiosInterceptor";

export const useTaskDetail = () => {
  const { taskId, projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [allocatedMembers, setAllocatedMembers] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Per-field editing state
  const [editingField, setEditingField] = useState(null); // 'title', 'description', etc.
  const [editValues, setEditValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Subtask state
  const [isSubTaskSidebarOpen, setIsSubTaskSidebarOpen] = useState(false);
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [editingSubTaskId, setEditingSubTaskId] = useState(null);
  // New subtask form state
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [newSubTaskDescription, setNewSubTaskDescription] = useState("");
  const [newSubTaskPriority, setNewSubTaskPriority] = useState("medium");
  const [newSubTaskStartDate, setNewSubTaskStartDate] = useState("");
  const [newSubTaskDueDate, setNewSubTaskDueDate] = useState("");
  const [newSubTaskEstimatedHours, setNewSubTaskEstimatedHours] = useState("");
  const [newSubTaskActualHours, setNewSubTaskActualHours] = useState("");
  const [newSubTaskRole, setNewSubTaskRole] = useState(null);
  const [newSubTaskRoleId, setNewSubTaskRoleId] = useState(null);
  const [newSubTaskRemark, setNewSubTaskRemark] = useState("");
  const [newSubTaskStatusId, setNewSubTaskStatusId] = useState(null);
  const [isSavingSubTask, setIsSavingSubTask] = useState(false);

  const debounceTimerRef = useRef(null);

  const canAddEditDelete = useCallback(() => {
    if (!project) return false;
    const userRole = user?.role?.toLowerCase() || "";
    if (userRole !== "team_leader" && userRole !== "worker") return true;
    if (project.company_managed === true) return false;
    if (project.by_tl_managed === true) return userRole === "team_leader";
    if (project.team_managed === true) return true;
    return false;
  }, [project, user?.role]);

  // Derived available members (like useTaskBoard)
  const availableMembers = useMemo(() => {
    const seen = new Set();
    const uniqueMembersMap = {};
    [...allAdmins, ...allocatedMembers].forEach((m) => {
      const memberType = m.type || (m.is_admin || m.is_superadmin ? "admin" : "worker");
      const uniqueKey = `${memberType}-${m.user_id}`;
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        uniqueMembersMap[uniqueKey] = { ...m, type: memberType };
      }
    });
    
    // Sort: workers first, then admins
    return Object.values(uniqueMembersMap).sort((a, b) => {
      const typeOrder = { worker: 0, admin: 1 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }, [allAdmins, allocatedMembers]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [taskData, projectTaskData, projectData, availableUsersData] = await Promise.all([
        taskService.getTaskById(taskId),
        projectTaskService.getProjectTaskData(projectId),
        projectService.getProjectById(projectId),
        projectService.getAvailableUsersByProject(projectId),
      ]);
      
      setProject(projectData.project || projectData);
      const taskObj = taskData.task || taskData;
      setTask(taskObj);
      setStatuses(projectTaskData.statuses || []);
      
      // Initialize edit values
      setEditValues({
        title: taskObj.title,
        description: taskObj.description || "",
        goal: taskObj.goal || "",
        priority: taskObj.priority,
        start_date: taskObj.start_date ? taskObj.start_date.split("T")[0] : "",
        due_date: taskObj.due_date ? taskObj.due_date.split("T")[0] : "",
        estimated_hours: taskObj.estimated_hours || "",
        actual_hours: taskObj.actual_hours || "",
        remark: taskObj.remark || "",
        status_id: taskObj.status_id,
      });

      try {
        const subTasksData = await subTaskService.getSubTasksByTaskId(taskObj.task_id || taskObj.id || taskId);
        setSubTasks(subTasksData.sub_tasks || []);
      } catch (err) {
        setSubTasks([]);
      }

      try {
        const attachmentsData = await taskAttachmentService.getAttachmentsByTaskId(taskObj.task_id || taskObj.id || taskId);
        setAttachments(attachmentsData.attachments || []);
      } catch (err) {
        setAttachments([]);
      }

      // Update available members from dedicated API (like useTaskBoard)
      const availableUsers = availableUsersData.available_users || [];
      setAllocatedMembers(availableUsers.filter(m => m.type === "worker"));
      setAllAdmins(availableUsers.filter(m => m.type === "admin"));
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [taskId, projectId]);

  useEffect(() => {
    if (taskId && projectId) fetchData();
  }, [taskId, projectId, fetchData]);

  // Debounced update function
  const debouncedUpdate = useCallback((field, value) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        const updateData = { [field]: value };
        
        // Handle empty numeric/date fields
        if (field === 'estimated_hours' || field === 'actual_hours') {
          updateData[field] = value === "" ? null : parseFloat(value);
        }
        if (field === 'start_date' || field === 'due_date') {
          updateData[field] = value === "" ? null : value;
        }

        await taskService.updateTask(task.task_id || task.id, updateData);
        setTask(prev => ({ ...prev, ...updateData }));
        setLastSaved(new Date());
      } catch (err) {
        console.error(`Failed to auto-save ${field}:`, err);
        toast({
          title: "Error",
          description: err.message || err.msg || err.error || `Failed to update ${field}`,
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
        debounceTimerRef.current = null;
      }
    }, 1000); // 1 second debounce
  }, [task, toast]);

  const handleFieldChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
    debouncedUpdate(field, value);
  };

  const handleStatusChange = async (newStatusId) => {
    try {
      setIsSaving(true);
      await taskService.updateTask(task.task_id || task.id, { status_id: newStatusId });
      setTask(prev => ({ ...prev, status_id: newStatusId }));
      setEditValues(prev => ({ ...prev, status_id: newStatusId }));
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to update status:", err);
      toast({
        title: "Error",
        description: err.message || err.msg || err.error || "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      setIsSaving(true);
      await taskService.updateTask(task.task_id || task.id, { priority: newPriority });
      setTask(prev => ({ ...prev, priority: newPriority }));
      setEditValues(prev => ({ ...prev, priority: newPriority }));
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to update priority:", err);
      toast({
        title: "Error",
        description: err.message || err.msg || err.error || "Failed to update priority",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Subtask handlers
  const openAddSubTask = () => {
    // Find is_todo status as default, or first non-backlog status
    const todoStatus = statuses.find(s => s.is_todo);
    const nonBacklogStatuses = statuses.filter(s => !s.is_backlog);
    const defaultStatus = todoStatus || nonBacklogStatuses[0];
    setIsAddingSubTask(true);
    setEditingSubTaskId(null);
    setNewSubTaskTitle("");
    setNewSubTaskDescription("");
    setNewSubTaskPriority("medium");
    setNewSubTaskStartDate("");
    setNewSubTaskDueDate("");
    setNewSubTaskEstimatedHours("");
    setNewSubTaskActualHours("");
    setNewSubTaskRole(null);
    setNewSubTaskRoleId(null);
    setNewSubTaskRemark("");
    setNewSubTaskStatusId(defaultStatus?.status_id || 1);
  };

  const openEditSubTask = (subTask) => {
    setEditingSubTaskId(subTask.id);
    setIsAddingSubTask(false);
    setNewSubTaskTitle(subTask.title);
    setNewSubTaskDescription(subTask.description || "");
    setNewSubTaskPriority(subTask.priority || "medium");
    setNewSubTaskStartDate(subTask.start_date || "");
    setNewSubTaskDueDate(subTask.due_date || "");
    setNewSubTaskEstimatedHours(subTask.estimated_hours || "");
    setNewSubTaskActualHours(subTask.actual_hours || "");
    setNewSubTaskRole(subTask.role || null);
    setNewSubTaskRoleId(subTask.role_id || null);
    setNewSubTaskRemark(subTask.remark || "");
    setNewSubTaskStatusId(subTask.status_id || 1);
  };

  const closeSubTaskForm = () => {
    setIsAddingSubTask(false);
    setEditingSubTaskId(null);
    setNewSubTaskTitle("");
    setNewSubTaskDescription("");
    setNewSubTaskPriority("medium");
    setNewSubTaskStartDate("");
    setNewSubTaskDueDate("");
    setNewSubTaskEstimatedHours("");
    setNewSubTaskActualHours("");
    setNewSubTaskRole(null);
    setNewSubTaskRoleId(null);
    setNewSubTaskRemark("");
    setNewSubTaskStatusId(null);
  };

  const handleSaveSubTask = async () => {
    try {
      setIsSavingSubTask(true);
      const data = {
        title: newSubTaskTitle,
        description: newSubTaskDescription,
        priority: newSubTaskPriority,
        start_date: newSubTaskStartDate || null,
        due_date: newSubTaskDueDate || null,
        role: newSubTaskRole,
        role_id: newSubTaskRoleId,
        estimated_hours: newSubTaskEstimatedHours ? parseFloat(newSubTaskEstimatedHours) : null,
        actual_hours: newSubTaskActualHours ? parseFloat(newSubTaskActualHours) : null,
        remark: newSubTaskRemark,
        status_id: newSubTaskStatusId,
      };
      data.parent_task_id = task.task_id || task.id;
      data.assigned_by = user?.userId;
      
      if (editingSubTaskId) {
        await subTaskService.updateSubTask(editingSubTaskId, data);
      } else {
        await subTaskService.createSubTask(data);
      }
      closeSubTaskForm();
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

  // Attachment handlers
  const handleUploadAttachment = async (file, remark) => {
    try {
      setIsSaving(true);
      await taskAttachmentService.createAttachment(task.task_id || task.id, file, remark);
      fetchData();
    } catch (err) {
      console.error("Failed to upload attachment:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadAttachment = async (fileUrl, originalName) => {
    try {
      let response;
      
      // If it's a /src/assets/ URL, use the static file route
      if (fileUrl && fileUrl.startsWith("/src/assets/")) {
        // Extract the filename
        const filename = fileUrl.split("/").pop();
        response = await api.get(`/src/assets/attachments/${filename}`, {
          responseType: "blob",
        });
      } 
      // Else, use the download endpoint
      else {
        const filename = fileUrl?.split("/").pop() || fileUrl;
        response = await taskAttachmentService.downloadFile(filename);
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download attachment:", err);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      setIsSaving(true);
      await taskAttachmentService.deleteAttachment(attachmentId);
      fetchData();
    } catch (err) {
      console.error("Failed to delete attachment:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    taskId,
    projectId,
    navigate,
    user,
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
    fetchData,
    // Subtask stuff
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
    // Attachment stuff
    handleUploadAttachment,
    handleDownloadAttachment,
    handleDeleteAttachment,
  };
};
