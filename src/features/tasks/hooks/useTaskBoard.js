import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../../projects/services/projectService";
import { taskService } from "../services/taskService";
import { projectTaskService } from "../services/projectTaskService";
import { useAuth } from "../../auth/contexts/AuthContext";
import { getMemberKey } from "../components/board/constants";

export const useTaskBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject]               = useState(null);
  const [searchQuery, setSearchQuery]       = useState("");
  const [meMode, setMeMode]                 = useState(false);
  const [allocation, setAllocation]         = useState(null);
  const [statuses, setStatuses]             = useState([]);
  const [allocatedMembers, setAllocatedMembers] = useState([]);
  const [allAdmins, setAllAdmins]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [draggedTask, setDraggedTask]       = useState(null);
  const columnRefs = { current: {} };

  /* ── add task state ── */
  const [activeColumn, setActiveColumn]     = useState(null);
  const [newTaskTitle, setNewTaskTitle]     = useState("");
  const [newTaskStartDate, setNewTaskStartDate] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskEstimatedHours, setNewTaskEstimatedHours] = useState("");
  const [newTaskActualHours, setNewTaskActualHours] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSaving, setIsSaving]             = useState(false);

  /* ── inline edit task state ── */
  const [editingTaskId, setEditingTaskId]   = useState(null);
  const [editTaskPriority, setEditTaskPriority] = useState("medium");
  const [editTaskStartDate, setEditTaskStartDate] = useState("");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskEstimatedHours, setEditTaskEstimatedHours] = useState("");
  const [editTaskActualHours, setEditTaskActualHours] = useState("");

  /* ── member dialog ── */
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [memberSearch, setMemberSearch]     = useState("");

  /* ── task details dialog ── */
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask]     = useState(null);
  const [isEditingTask, setIsEditingTask]   = useState(false);
  const [editTaskData, setEditTaskData]     = useState({});
  const [editSelectedMembers, setEditSelectedMembers] = useState([]);

  /* ── delete dialog ── */
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete]     = useState(null);

  /* ── permissions ── */
  const canAddEditDelete = useMemo(() => {
    if (!project) return false;
    const userRole = user?.role?.toLowerCase() || "";
    if (userRole !== "team_leader" && userRole !== "worker") return true;
    if (project.company_managed === true) return false;
    if (project.by_tl_managed === true) return userRole === "team_leader";
    if (project.team_managed === true) return true;
    return false;
  }, [project, user?.role]);

  const canMoveCards = useMemo(() => {
    if (!project) return false;
    const userRole = user?.role?.toLowerCase() || "";
    if (userRole !== "team_leader" && userRole !== "worker") return true;
    return true; // all managed types allow moving
  }, [project, user?.role]);

  /* ── derived members ── */
  const availableMembers = useMemo(() => {
    const seen = new Set();
    const combined = [];
    [...allAdmins, ...allocatedMembers].forEach((m) => {
      const memberType = m.type || (m.is_admin || m.is_superadmin ? "admin" : "worker");
      const uniqueKey = `${memberType}-${m.user_id}`;
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        combined.push({ ...m, type: memberType });
      }
    });
    return combined;
  }, [allAdmins, allocatedMembers]);

  const filteredMembers = useMemo(() =>
    availableMembers.filter((m) =>
      `${m.first_name} ${m.last_name} ${m.email}`
        .toLowerCase().includes(memberSearch.toLowerCase())
    ), [availableMembers, memberSearch]);

  /* ── data fetch ── */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectData, projectTaskData] = await Promise.all([
        projectService.getProjectById(id),
        projectTaskService.getProjectTaskData(id),
      ]);
      const proj = projectData.project || projectData;
      setProject(proj);
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

  useEffect(() => {
    if (newTaskEstimatedHours) setNewTaskActualHours(newTaskEstimatedHours);
  }, [newTaskEstimatedHours]);

  /* ── add task panel ── */
  const openAddPanel = (statusId) => {
    setActiveColumn(statusId);
    setNewTaskTitle("");
    setNewTaskStartDate("");
    setNewTaskDueDate("");
    setNewTaskPriority("medium");
    setSelectedMembers([]);
    setTimeout(() => {
      const ref = columnRefs.current[statusId];
      if (ref) ref.scrollTop = ref.scrollHeight;
    }, 50);
  };

  const closeAddPanel = () => {
    setActiveColumn(null);
    setNewTaskTitle("");
    setNewTaskStartDate("");
    setNewTaskDueDate("");
    setNewTaskPriority("medium");
    setNewTaskEstimatedHours("");
    setNewTaskActualHours("");
    setSelectedMembers([]);
  };

  /* ── add task ── */
  const handleAddTask = async (statusId) => {
    if (!newTaskTitle.trim()) return;
    try {
      setIsSaving(true);
      const workerIdsWithType = selectedMembers.length > 0
        ? selectedMembers.map((key) => {
            const member = availableMembers.find((m) => getMemberKey(m) === key);
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
        assigned_by_role_id: user?.roleId,
        assigned_by_role: user?.role,
        priority: newTaskPriority,
        start_date: newTaskStartDate || null,
        due_date: newTaskDueDate || null,
        estimated_hours: newTaskEstimatedHours ? parseFloat(newTaskEstimatedHours) : null,
        actual_hours: newTaskActualHours ? parseFloat(newTaskActualHours) : null,
      });
      closeAddPanel();
      fetchData();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── edit task ── */
  const handleEditTask = async () => {
    if (!editTaskData.title?.trim()) return;
    try {
      setIsSaving(true);
      const workerIdsWithType = editSelectedMembers.length > 0
        ? editSelectedMembers.map((key) => {
            const member = availableMembers.find((m) => getMemberKey(m) === key);
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

  /* ── delete task ── */
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

  /* ── member toggles ── */
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

  /* ── drag and drop ── */
  const handleDragStart = (task) => setDraggedTask(task);
  const handleDragEnd   = ()     => setDraggedTask(null);

  const handleDrop = async (statusId) => {
    if (!draggedTask || draggedTask.status_id === statusId) {
      setDraggedTask(null);
      return;
    }
    const targetStatus = statuses.find((s) => s.status_id === statusId);
    const userRole = user?.role?.toLowerCase() || "";
    if (userRole === "worker" && targetStatus?.is_confidential) {
      setDraggedTask(null);
      return;
    }
    setStatuses((prev) => {
      const updated = prev.map((s) => ({
        ...s,
        tasks: s.tasks ? s.tasks.filter((t) => t.task_id !== draggedTask.task_id) : [],
      }));
      const target = updated.find((s) => s.status_id === statusId);
      if (target) target.tasks = [...(target.tasks || []), { ...draggedTask, status_id: statusId }];
      return updated;
    });
    setDraggedTask(null);
    try {
      await taskService.updateTask(draggedTask.task_id, { status_id: statusId });
    } catch (err) {
      console.error("Failed to update task status:", err);
      await fetchData();
    }
  };

  /* ── inline edit functions ── */
  const startInlineEdit = (task) => {
    setEditingTaskId(task.task_id);
    setEditTaskPriority(task.priority || "medium");
    setEditTaskStartDate(task.start_date ? task.start_date.split("T")[0] : "");
    setEditTaskDueDate(task.due_date ? task.due_date.split("T")[0] : "");
    setEditTaskEstimatedHours(task.estimated_hours || "");
    setEditTaskActualHours(task.actual_hours || "");
  };

  const cancelInlineEdit = () => {
    setEditingTaskId(null);
    setEditTaskPriority("medium");
    setEditTaskStartDate("");
    setEditTaskDueDate("");
    setEditTaskEstimatedHours("");
    setEditTaskActualHours("");
  };

  const saveInlineEdit = async (task) => {
    try {
      setIsSaving(true);
      await taskService.updateTask(task.task_id, {
        priority: editTaskPriority,
        start_date: editTaskStartDate || null,
        due_date: editTaskDueDate || null,
        estimated_hours: editTaskEstimatedHours ? parseFloat(editTaskEstimatedHours) : null,
        actual_hours: editTaskActualHours ? parseFloat(editTaskActualHours) : null,
      });
      cancelInlineEdit();
      fetchData();
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── task card click ── */
  const openTaskDetails = (task, e) => {
    // Don't open if clicking a button
    if (e && e.target.closest("button")) return;
    
    // Navigate to task detail page
    navigate(`/tasks/project/${id}/task/${task.task_id}`);
  };

  const openEditTask = (task, e) => {
    if (e && e.target.closest("button")) return;
    startInlineEdit(task);
  };

  return {
    id,
    navigate,
    user,
    project, setProject,
    searchQuery, setSearchQuery,
    meMode, setMeMode,
    allocation, setAllocation,
    statuses, setStatuses,
    allocatedMembers, setAllocatedMembers,
    allAdmins, setAllAdmins,
    loading, setLoading,
    draggedTask, setDraggedTask,
    columnRefs,
    activeColumn, setActiveColumn,
    newTaskTitle, setNewTaskTitle,
    newTaskStartDate, setNewTaskStartDate,
    newTaskDueDate, setNewTaskDueDate,
    newTaskPriority, setNewTaskPriority,
    newTaskEstimatedHours, setNewTaskEstimatedHours,
    newTaskActualHours, setNewTaskActualHours,
    selectedMembers, setSelectedMembers,
    isSaving, setIsSaving,
    isMemberDialogOpen, setIsMemberDialogOpen,
    memberSearch, setMemberSearch,
    isTaskDetailsOpen, setIsTaskDetailsOpen,
    selectedTask, setSelectedTask,
    isEditingTask, setIsEditingTask,
    editTaskData, setEditTaskData,
    editSelectedMembers, setEditSelectedMembers,
    isDeleteDialogOpen, setIsDeleteDialogOpen,
    taskToDelete, setTaskToDelete,
    canAddEditDelete,
    canMoveCards,
    availableMembers,
    filteredMembers,
    fetchData,
    openAddPanel,
    closeAddPanel,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    toggleMember,
    toggleEditMember,
    getSelectedMembersData,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    openTaskDetails,
    openEditTask,
    // Inline edit
    editingTaskId,
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
    startInlineEdit,
    cancelInlineEdit,
    saveInlineEdit
  };
};
