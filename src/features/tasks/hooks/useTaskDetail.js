import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/contexts/AuthContext";
import { taskService } from "../services/taskService";
import { subTaskService } from "../services/subTaskService";
import { projectTaskService } from "../services/projectTaskService";
import { projectService } from "../../projects/services/projectService";

export const useTaskDetail = () => {
  const { taskId, projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Per-field editing state
  const [editingField, setEditingField] = useState(null); // 'title', 'description', etc.
  const [editValues, setEditValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Subtask state
  const [isSubTaskSheetOpen, setIsSubTaskSheetOpen] = useState(false);
  const [isSubTaskSidebarOpen, setIsSubTaskSidebarOpen] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState(null);
  const [subTaskForm, setSubTaskForm] = useState({});
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
      } finally {
        setIsSaving(false);
        debounceTimerRef.current = null;
      }
    }, 1000); // 1 second debounce
  }, [task]);

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
    } finally {
      setIsSaving(false);
    }
  };

  // Subtask handlers
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
    isSubTaskSheetOpen,
    setIsSubTaskSheetOpen,
    isSubTaskSidebarOpen,
    setIsSubTaskSidebarOpen,
    editingSubTask,
    subTaskForm,
    setSubTaskForm,
    isSavingSubTask,
    openAddSubTask,
    openEditSubTask,
    handleSaveSubTask,
    handleDeleteSubTask,
    handleSubTaskStatusChange,
  };
};
