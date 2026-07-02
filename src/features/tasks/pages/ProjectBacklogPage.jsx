import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../../common/components/ui/sidebar';
import { useProjectBacklog } from '../hooks/useProjectBacklog';
import { Loader2, LayoutGrid, Flame, Calendar, Clock, ListTodo, Plus, Edit } from "lucide-react";
import { Button } from '../../../common/components/ui/button';
import AddTaskPanel from '../components/board/AddTaskPanel';
import AssignMemberDialog from '../components/board/AssignMemberDialog';
import AvatarStack from '../components/board/AvatarStack';
import ContextMenu from '../components/board/ContextMenu';
import InlineEditTaskPanel from '../components/board/InlineEditTaskPanel';

const PRIORITY = {
  high: { bg: "#fee2e2", text: "#dc2626", label: "High" },
  medium: { bg: "#fef3c7", text: "#d97706", label: "Medium" },
  low: { bg: "#dcfce7", text: "#16a34a", label: "Low" },
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const TaskItem = ({ 
  task, 
  isSelected, 
  isDragging, 
  onDragStart, 
  onDragEnd, 
  onClick, 
  color, 
  onContextMenu, 
  todoStatusId, 
  backlogStatusId,
  isEditing,
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
  onEditClick
}) => {
  const p = PRIORITY[task.priority] || PRIORITY.medium;
  const displayColor = task.status_color || color || "#6366f1";
  
  // Only allow dragging if it's a backlog task OR a todo status task in a sprint
  const isDraggable = task.status_id === backlogStatusId || task.status_id === todoStatusId;

  if (isEditing) {
    return (
      <InlineEditTaskPanel
        task={task}
        editTaskPriority={editTaskPriority}
        setEditTaskPriority={setEditTaskPriority}
        editTaskStartDate={editTaskStartDate}
        setEditTaskStartDate={setEditTaskStartDate}
        editTaskDueDate={editTaskDueDate}
        setEditTaskDueDate={setEditTaskDueDate}
        editTaskEstimatedHours={editTaskEstimatedHours}
        setEditTaskEstimatedHours={setEditTaskEstimatedHours}
        editTaskActualHours={editTaskActualHours}
        setEditTaskActualHours={setEditTaskActualHours}
        isSaving={isSaving}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div
      key={task.task_id}
      onClick={(e) => onClick && onClick(task, e)}
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart && onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, task)}
      className={`group relative rounded-xl p-3 transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${isSelected ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200" : ""} ${
        isDraggable ? "cursor-pointer" : "cursor-default"
      }`}
      style={{
        background: isSelected ? "#eff6ff" : "#ffffff",
        border: isSelected ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        opacity: isDraggable ? 1 : 0.7
      }}
      onMouseEnter={(e) => {
        if (!isDragging && isDraggable) {
          e.currentTarget.style.border = isSelected ? "1px solid #93c5fd" : "1px solid #cbd5e1";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.border = isSelected ? "1px solid #bfdbfe" : "1px solid #e2e8f0";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-start gap-2 flex-1">
          <h4 className="font-medium text-slate-800 text-sm leading-snug flex-1">
            {task.title}
          </h4>
        </div>
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
              onEditClick(task);
            }}
            className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Status display */}
      {task.status_name && (
        <div className="mb-2">
          <div 
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block"
            style={{ 
              backgroundColor: `${displayColor}20`, 
              color: displayColor 
            }}
          >
            {task.status_name}
          </div>
        </div>
      )}

      {/* workers */}
      {task.assigned_workers?.length > 0 && (
        <div className="mb-2.5">
          <AvatarStack workers={task.assigned_workers} size={7} />
        </div>
      )}
      {/* Fallback to members if assigned_workers not present */}
      {!task.assigned_workers?.length && task.members?.length > 0 && (
        <div className="mb-2.5">
          <AvatarStack workers={task.members} size={7} />
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {task.start_date && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.start_date)}</span>
          </div>
        )}
        {task.due_date && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.due_date)}</span>
          </div>
        )}
        {task.estimated_hours && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{task.estimated_hours}h</span>
          </div>
        )}
      </div>

      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: displayColor }}
      />
    </div>
  );
};

const ProjectBacklogPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { sidebarWidth } = useSidebar();
  const [contextMenu, setContextMenu] = useState(null);

  const {
    loading,
    project,
    backlogStatus,
    todoStatus,
    backlogTasks,
    sprints,
    selectedTasks,
    setSelectedTasks,
    draggedTasks,
    toggleTaskSelection,
    handleDragStart,
    handleDragEnd,
    handleDropToSprint,
    handleDropToBacklog,
    handleMoveTasksToSprint,
    handleMoveToBacklog,
    // Add task props
    isAddPanelOpen,
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
    filteredMembers,
    openAddPanel,
    closeAddPanel,
    handleAddTask,
    toggleMember,
    getSelectedMembersData,
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
  } = useProjectBacklog(projectId);

  const handleRightClick = (e, task) => {
    e.preventDefault();
    
    // If task isn't already selected, select it first
    if (!selectedTasks.has(task.task_id)) {
      setSelectedTasks(new Set([task.task_id]));
    }
    
    // Check if selected tasks are eligible for moving
    const areEligible = areTasksEligibleForMoving();
    if (areEligible) {
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleMoveToSprint = async (sprintId) => {
    await handleMoveTasksToSprint(sprintId);
    setContextMenu(null);
  };

  // Helper to check if selected tasks are eligible for moving (backlog or todo status)
  const areTasksEligibleForMoving = () => {
    if (selectedTasks.size === 0) return false;
    
    const allTasks = [
      ...backlogTasks,
      ...sprints.flatMap(s => s.tasks || [])
    ];
    
    return Array.from(selectedTasks).every(taskId => {
      const task = allTasks.find(t => t.task_id === taskId);
      return task && (task.status_id === backlogStatus?.id || task.status_id === todoStatus?.id);
    });
  };

  // Helper to check if selected tasks are eligible for moving to backlog
  const areTasksEligibleForBacklog = () => {
    if (selectedTasks.size === 0) return false;
    
    const allTasks = [
      ...backlogTasks,
      ...sprints.flatMap(s => s.tasks || [])
    ];
    
    return Array.from(selectedTasks).every(taskId => {
      const task = allTasks.find(t => t.task_id === taskId);
      return task && task.status_id === todoStatus?.id;
    });
  };

  const handleMoveSelectedToBacklog = async () => {
    await handleMoveToBacklog();
    setContextMenu(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-400 font-medium">Loading project…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden"
      style={{ 
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        width: `calc(100vw - ${sidebarWidth}px)`
      }}
    >
      {/* Left: Backlog */}
      <div className="w-full md:w-[28%] lg:w-[24%] border-r border-slate-200 flex flex-col bg-white shrink-0">
        <div className="px-4 pt-4 pb-3 shrink-0 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: backlogStatus?.color || "#6366f1" }}
              />
              <span className="font-semibold text-slate-700 text-sm tracking-wide uppercase">
                {backlogStatus?.name || "Backlog"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${backlogStatus?.color || "#6366f1"}18`, color: backlogStatus?.color || "#6366f1" }}
              >
                {backlogTasks.length}
              </span>
              <button
                onClick={openAddPanel}
                className="rounded-full p-1.5 hover:bg-slate-200 transition-colors"
              >
                <Plus className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
          <div
            className="h-0.5 rounded-full mt-2"
            style={{ backgroundColor: backlogStatus?.color || "#6366f1", opacity: 0.3 }}
          />
        </div>
        
        <div 
          className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropToBacklog}
        >
          {isAddPanelOpen && (
            <AddTaskPanel
              statusId={backlogStatus?.id}
              newTaskTitle={newTaskTitle}
              setNewTaskTitle={setNewTaskTitle}
              newTaskStartDate={newTaskStartDate}
              setNewTaskStartDate={setNewTaskStartDate}
              newTaskDueDate={newTaskDueDate}
              setNewTaskDueDate={setNewTaskDueDate}
              newTaskPriority={newTaskPriority}
              setNewTaskPriority={setNewTaskPriority}
              newTaskEstimatedHours={newTaskEstimatedHours}
              setNewTaskEstimatedHours={setNewTaskEstimatedHours}
              newTaskActualHours={newTaskActualHours}
              setNewTaskActualHours={setNewTaskActualHours}
              selectedMembers={selectedMembers}
              getSelectedMembersData={getSelectedMembersData}
              isSaving={isSaving}
              onSave={() => handleAddTask()}
              onClose={closeAddPanel}
              onOpenMemberDialog={() => setIsMemberDialogOpen(true)}
            />
          )}
          
          {backlogTasks.map(task => {
            const isSelected = selectedTasks.has(task.task_id);
            const isDragging = draggedTasks.includes(task.task_id);
            const isEditing = editingTaskId === task.task_id;
            
            return (
              <TaskItem
                key={task.task_id}
                task={task}
                isSelected={isSelected}
                isDragging={isDragging}
                onDragStart={(e, t) => handleDragStart(e, t)}
                onDragEnd={handleDragEnd}
                onClick={(t, e) => toggleTaskSelection(t.task_id, e)}
                onContextMenu={handleRightClick}
                color={backlogStatus?.color}
                todoStatusId={todoStatus?.id}
                backlogStatusId={backlogStatus?.id}
                isEditing={isEditing}
                editTaskPriority={editTaskPriority}
                setEditTaskPriority={setEditTaskPriority}
                editTaskStartDate={editTaskStartDate}
                setEditTaskStartDate={setEditTaskStartDate}
                editTaskDueDate={editTaskDueDate}
                setEditTaskDueDate={setEditTaskDueDate}
                editTaskEstimatedHours={editTaskEstimatedHours}
                setEditTaskEstimatedHours={setEditTaskEstimatedHours}
                editTaskActualHours={editTaskActualHours}
                setEditTaskActualHours={setEditTaskActualHours}
                isSaving={isSaving}
                onSave={saveInlineEdit}
                onCancel={cancelInlineEdit}
                onEditClick={startInlineEdit}
              />
            );
          })}
          
          {backlogTasks.length === 0 && !isAddPanelOpen && (
            <div className="text-center py-12 px-4">
              <div className="rounded-xl bg-slate-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ListTodo className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No tasks in backlog</p>
              <p className="text-slate-300 text-xs mt-1">Click the + button to add a task</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Sprints */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">
            {project?.name || 'Project'} - Sprints
          </h2>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(`/tasks/project/${projectId}/board`)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800"
          >
            <LayoutGrid className="h-4 w-4" />
            View Task Board
          </Button>
        </div>
        
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 h-full min-w-max">
            {sprints.length > 0 ? (
              sprints.map(sprint => {
                const isOver = draggedTasks.length > 0;
                
                return (
                  <div
                    key={sprint.id}
                    className={`w-[260px] md:w-[280px] flex flex-col h-full rounded-xl overflow-hidden transition-all duration-200 ${
                      isOver ? "ring-2 ring-blue-300 ring-offset-2" : ""
                    }`}
                    style={{
                      background: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="px-3 pt-2 pb-1.5 shrink-0 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="font-semibold text-slate-700 text-xs tracking-wide uppercase">
                            {sprint.sprint_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                          {sprint.tasks?.length || 0}
                        </span>
                      </div>
                      
                      {(sprint.start_date || sprint.end_date) && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {sprint.start_date ? new Date(sprint.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ''} 
                          {sprint.end_date ? ` - ${new Date(sprint.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ''}
                        </p>
                      )}
                      
                      <div className="h-0.5 rounded-full mt-1.5 bg-emerald-500/20" />
                    </div>
                    
                    <div
                      className="flex-1 overflow-y-auto px-2.5 py-2.5"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropToSprint(e, sprint.id)}
                    >
                      {(() => {
                        const tasks = sprint.tasks || [];
                        
                        if (tasks.length === 0) {
                          return (
                            <div className="text-center py-10">
                              <div className="rounded-xl border-2 border-dashed border-slate-200 w-full h-20 flex items-center justify-center">
                                <p className="text-[10px] text-slate-400 font-medium">Drop tasks here</p>
                              </div>
                            </div>
                          );
                        }
                        
                        return tasks.map(task => {
                            const isSelected = selectedTasks.has(task.task_id);
                            const isDragging = draggedTasks.includes(task.task_id);
                            const isEditing = editingTaskId === task.task_id;
                            
                            return (
                              <div key={task.task_id} className="mb-2 last:mb-0">
                                <TaskItem
                                  task={task}
                                  isSelected={isSelected}
                                  isDragging={isDragging}
                                  onDragStart={(e, t) => handleDragStart(e, t)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(t, e) => toggleTaskSelection(t.task_id, e)}
                                  onContextMenu={handleRightClick}
                                  color="#6366f1"
                                  todoStatusId={todoStatus?.id}
                                  backlogStatusId={backlogStatus?.id}
                                  isEditing={isEditing}
                                  editTaskPriority={editTaskPriority}
                                  setEditTaskPriority={setEditTaskPriority}
                                  editTaskStartDate={editTaskStartDate}
                                  setEditTaskStartDate={setEditTaskStartDate}
                                  editTaskDueDate={editTaskDueDate}
                                  setEditTaskDueDate={setEditTaskDueDate}
                                  editTaskEstimatedHours={editTaskEstimatedHours}
                                  setEditTaskEstimatedHours={setEditTaskEstimatedHours}
                                  editTaskActualHours={editTaskActualHours}
                                  setEditTaskActualHours={setEditTaskActualHours}
                                  isSaving={isSaving}
                                  onSave={saveInlineEdit}
                                  onCancel={cancelInlineEdit}
                                  onEditClick={startInlineEdit}
                                />
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center w-full">
                <div className="text-center">
                  <div className="rounded-xl bg-slate-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">No sprints created yet</p>
                  <p className="text-slate-300 text-xs mt-1">Create a sprint to start organizing tasks</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Dialog */}
      <AssignMemberDialog
        open={isMemberDialogOpen}
        onOpenChange={setIsMemberDialogOpen}
        filteredMembers={filteredMembers}
        selectedMembers={selectedMembers}
        memberSearch={memberSearch}
        setMemberSearch={setMemberSearch}
        onToggleMember={toggleMember}
        onClose={() => { setIsMemberDialogOpen(false); setMemberSearch(""); }}
      />
      
      {/* Context Menu */}
      <ContextMenu
        position={contextMenu}
        onClose={handleCloseContextMenu}
        sprints={sprints}
        onMoveToSprint={handleMoveToSprint}
        onMoveToBacklog={handleMoveSelectedToBacklog}
        isMoveToBacklogDisabled={!areTasksEligibleForBacklog()}
      />
    </div>
  );
};

export default ProjectBacklogPage;
