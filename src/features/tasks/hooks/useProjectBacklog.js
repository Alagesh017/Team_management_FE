import { useState, useEffect } from "react";
import { projectService } from "../../projects/services/projectService";
import { taskService } from "../services/taskService";
import { useAuth } from "../../auth/contexts/AuthContext";
import { getMemberKey } from "../components/board/constants";

export const useProjectBacklog = (projectId) => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [backlogStatus, setBacklogStatus] = useState(null);
  const [todoStatus, setTodoStatus] = useState(null);
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [allocatedMembers, setAllocatedMembers] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedTasks, setDraggedTasks] = useState([]);
  const { user } = useAuth();

  // Add task state
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStartDate, setNewTaskStartDate] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskEstimatedHours, setNewTaskEstimatedHours] = useState("");
  const [newTaskActualHours, setNewTaskActualHours] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  // Inline edit task state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskPriority, setEditTaskPriority] = useState("medium");
  const [editTaskStartDate, setEditTaskStartDate] = useState("");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskEstimatedHours, setEditTaskEstimatedHours] = useState("");
  const [editTaskActualHours, setEditTaskActualHours] = useState("");

  const availableMembers = [];
  const seen = new Set();
  
  // First collect all unique members
  const allMembers = [...allAdmins, ...allocatedMembers];
  const uniqueMembersMap = {};
  
  allMembers.forEach((m) => {
    const memberType = m.type || (m.is_admin || m.is_superadmin ? "admin" : "worker");
    const uniqueKey = `${memberType}-${m.user_id}`;
    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey);
      uniqueMembersMap[uniqueKey] = { ...m, type: memberType };
    }
  });
  
  // Now sort: workers first, then admins
  const sortedMembers = Object.values(uniqueMembersMap).sort((a, b) => {
    const typeOrder = { worker: 0, admin: 1 };
    return typeOrder[a.type] - typeOrder[b.type];
  });
  
  availableMembers.push(...sortedMembers);

  const filteredMembers = availableMembers.filter((m) =>
    `${m.first_name} ${m.last_name} ${m.email}`
      .toLowerCase().includes(memberSearch.toLowerCase())
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [projectData, backlogData, availableUsersData] = await Promise.all([
        projectService.getProjectById(projectId),
        taskService.getProjectBacklog(projectId),
        projectService.getAvailableUsersByProject(projectId)
      ]);

      const proj = projectData.project || projectData;
      setProject(proj);

      // Set data from the new endpoint
      setBacklogStatus(backlogData.backlog_status);
      setTodoStatus(backlogData.todo_status);
      setBacklogTasks(backlogData.backlog_tasks || []);
      setSprints(backlogData.sprints || []);
      
      // Update available members from the new API
      const availableUsers = availableUsersData.available_users || [];
      // Clear the previous arrays and add new members
      setAllocatedMembers(availableUsers.filter(m => m.type === "worker"));
      setAllAdmins(availableUsers.filter(m => m.type === "admin"));

    } catch (err) {
      console.error("Failed to fetch project data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  const toggleTaskSelection = (taskId, e) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
          newSet.delete(taskId);
        } else {
          newSet.add(taskId);
        }
        return newSet;
      });
    } else {
      // If not holding modifier keys, select only this task
      setSelectedTasks(new Set([taskId]));
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    
    // If task is selected, drag all selected tasks
    if (selectedTasks.has(task.task_id)) {
      setDraggedTasks(Array.from(selectedTasks));
    } else {
      setDraggedTasks([task.task_id]);
      // Also select it if not already selected
      setSelectedTasks(new Set([task.task_id]));
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedTasks([]);
  };

  const handleDropToSprint = async (e, sprintId) => {
    e.preventDefault();
    
    if (draggedTasks.length === 0) return;

    try {
      // Update each selected task with the sprint ID and todo status
      for (const taskId of draggedTasks) {
        await taskService.updateTask(taskId, { 
          sprint_id: sprintId,
          status_id: todoStatus?.id
        });
      }
      
      // Refresh data
      await fetchData();
      
      // Clear selection
      setSelectedTasks(new Set());
      
    } catch (err) {
      console.error("Failed to update tasks:", err);
    }
    
    handleDragEnd();
  };

  // Helper to find a task by ID from backlog and sprints
  const findTaskById = (taskId) => {
    // Check backlog tasks first
    let task = backlogTasks.find(t => t.task_id === taskId);
    if (task) return task;
    
    // Check sprint tasks
    for (const sprint of sprints) {
      task = sprint.tasks?.find(t => t.task_id === taskId);
      if (task) return task;
    }
    
    return null;
  };

  const handleDropToBacklog = async (e) => {
    e.preventDefault();
    
    if (draggedTasks.length === 0) return;

    try {
      if (!backlogStatus || !todoStatus) return;
      
      // Filter to only tasks with todo status
      const eligibleTasks = draggedTasks.filter(taskId => {
        const task = findTaskById(taskId);
        return task && task.status_id === todoStatus.id;
      });
      
      if (eligibleTasks.length === 0) return;
      
      // Update each eligible task: set sprint_id to null and status_id to backlog
      for (const taskId of eligibleTasks) {
        await taskService.updateTask(taskId, { 
          sprint_id: null, 
          status_id: backlogStatus.id 
        });
      }
      
      // Refresh data
      await fetchData();
      
      // Clear selection
      setSelectedTasks(new Set());
      
    } catch (err) {
      console.error("Failed to update tasks:", err);
    }
    
    handleDragEnd();
  };

  const handleMoveTasksToSprint = async (sprintId) => {
    if (selectedTasks.size === 0) return;

    try {
      // Update each selected task with the sprint ID and todo status
      const tasksToMove = Array.from(selectedTasks);
      for (const taskId of tasksToMove) {
        await taskService.updateTask(taskId, { 
          sprint_id: sprintId,
          status_id: todoStatus?.id
        });
      }
      
      // Refresh data
      await fetchData();
      
      // Clear selection
      setSelectedTasks(new Set());
      
    } catch (err) {
      console.error("Failed to update tasks:", err);
    }
  };

  const handleMoveToBacklog = async () => {
    if (selectedTasks.size === 0) return;

    try {
      if (!backlogStatus || !todoStatus) return;
      
      // Filter to only tasks with todo status
      const tasksToMove = Array.from(selectedTasks).filter(taskId => {
        const task = findTaskById(taskId);
        return task && task.status_id === todoStatus.id;
      });
      
      if (tasksToMove.length === 0) return;
      
      // Update each eligible task: set sprint_id to null and status_id to backlog
      for (const taskId of tasksToMove) {
        await taskService.updateTask(taskId, { 
          sprint_id: null, 
          status_id: backlogStatus.id 
        });
      }
      
      // Refresh data
      await fetchData();
      
      // Clear selection
      setSelectedTasks(new Set());
      
    } catch (err) {
      console.error("Failed to update tasks:", err);
    }
  };

  // Add task functions
  const openAddPanel = () => {
    setIsAddPanelOpen(true);
    setNewTaskTitle("");
    setNewTaskStartDate("");
    setNewTaskDueDate("");
    setNewTaskPriority("medium");
    setSelectedMembers([]);
  };

  const closeAddPanel = () => {
    setIsAddPanelOpen(false);
    setNewTaskTitle("");
    setNewTaskStartDate("");
    setNewTaskDueDate("");
    setNewTaskPriority("medium");
    setNewTaskEstimatedHours("");
    setNewTaskActualHours("");
    setSelectedMembers([]);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !backlogStatus) return;
    try {
      setIsSaving(true);
      const workerIdsWithType = selectedMembers.length > 0
        ? selectedMembers.map((key) => {
            const member = availableMembers.find((m) => getMemberKey(m) === key);
            return { user_id: member?.user_id, type: member?.type || "worker" };
          })
        : null;
      await taskService.createTask({
        project_id: parseInt(projectId),
        sprint_id: null,
        status_id: backlogStatus.id,
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

  const toggleMember = (member) => {
    const key = getMemberKey(member);
    setSelectedMembers((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const getSelectedMembersData = () =>
    availableMembers.filter((m) => selectedMembers.includes(getMemberKey(m)));

  // Inline edit functions
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

  return {
    loading,
    project,
    backlogStatus,
    todoStatus,
    backlogTasks,
    sprints,
    selectedTasks,
    draggedTask,
    draggedTasks,
    toggleTaskSelection,
    handleDragStart,
    handleDragEnd,
    handleDropToSprint,
    handleDropToBacklog,
    handleMoveTasksToSprint,
    handleMoveToBacklog,
    fetchData,
    // Add task props
    isAddPanelOpen,
    setIsAddPanelOpen,
    newTaskTitle,
    setNewTaskTitle,
    newTaskStartDate,
    setNewTaskStartDate,
    newTaskDueDate,
    setNewTaskDueDate,
    newTaskPriority,
    setNewTaskPriority,
    newTaskEstimatedHours,
    setNewTaskEstimatedHours,
    newTaskActualHours,
    setNewTaskActualHours,
    selectedMembers,
    isSaving,
    isMemberDialogOpen,
    setIsMemberDialogOpen,
    memberSearch,
    setMemberSearch,
    availableMembers,
    filteredMembers,
    openAddPanel,
    closeAddPanel,
    handleAddTask,
    toggleMember,
    getSelectedMembersData,
    user,
    // Inline edit props
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
