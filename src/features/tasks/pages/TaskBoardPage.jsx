import React, { useRef, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTaskBoard } from "../hooks/useTaskBoard";
import { useSidebar } from "../../../common/components/ui/sidebar";
import BoardHeader from "../components/board/BoardHeader";
import BoardColumn from "../components/board/BoardColumn";
import AssignMemberDialog from "../components/board/AssignMemberDialog";
import TaskDetailsDialog from "../components/board/TaskDetailsDialog";
import DeleteTaskDialog from "../components/board/DeleteTaskDialog";

const TaskBoardPage = () => {
  const navigate = useNavigate();
  const { sidebarWidth } = useSidebar();
  const scrollContainerRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const {
  id: projectId,
  project,
  sprint,
  searchQuery,
  setSearchQuery,
  meMode,
  setMeMode,
  availableMembers,
  statuses,
  loading,
  draggedTask,
  canAddEditDelete,
  canMoveCards,
  activeColumn,
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
  getSelectedMembersData,
  isSaving,
  columnRefs,
  openAddPanel,
  closeAddPanel,
  handleAddTask,
  isMemberDialogOpen,
  setIsMemberDialogOpen,
  filteredMembers,
  memberSearch,
  setMemberSearch,
  toggleMember,
  handleDragStart,
  handleDragEnd: handleDragEndFromHook,
  handleDrop,
  openTaskDetails,
  openEditTask,
  setTaskToDelete,
  setIsDeleteDialogOpen,
  isTaskDetailsOpen,
  setIsTaskDetailsOpen,
  selectedTask,
  setSelectedTask,
  isEditingTask,
  setIsEditingTask,
  editTaskData,
  setEditTaskData,
  editSelectedMembers,
  setEditSelectedMembers,
  handleEditTask,
  toggleEditMember,
  isDeleteDialogOpen,
  setTaskToDelete: setTaskToDeleteFn,
  taskToDelete,
  handleDeleteTask,
  user,
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
  cancelInlineEdit,
  saveInlineEdit
} = useTaskBoard();

  /* ── Auto-scroll during drag ── */
  const handleDragOver = (e) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Threshold for auto-scroll (100px from edges)
    const scrollThreshold = 100;
    const scrollSpeed = 15;
    
    const mouseX = e.clientX;
    
    // Clean up any existing interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    
    // Check if mouse is near left edge
    if (mouseX < rect.left + scrollThreshold) {
      scrollIntervalRef.current = setInterval(() => {
        container.scrollLeft -= scrollSpeed;
      }, 16);
    } 
    // Check if mouse is near right edge
    else if (mouseX > rect.right - scrollThreshold) {
      scrollIntervalRef.current = setInterval(() => {
        container.scrollLeft += scrollSpeed;
      }, 16);
    }
  };

  const handleDragEnd = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    // Also call the drag end from useTaskBoard
    handleDragEndFromHook();
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

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

  return (
    <div
      className="flex flex-col h-[calc(100vh-80px)] overflow-hidden"
      style={{ 
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        width: `calc(100vw - ${sidebarWidth}px)`
      }}
    >
      {/* Header */}
      <BoardHeader
        project={project}
        sprint={sprint}
        statuses={statuses}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        meMode={meMode}
        setMeMode={setMeMode}
        availableMembers={availableMembers}
      />

      {/* Columns */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto h-full px-5 py-4 pb-4"
          onDragOver={handleDragOver}
          onDragEnd={() => {
            handleDragEnd();
          }}
        >
          {statuses.filter(status => !status.is_backlog).map((status) => {
            let statusTasks = status.tasks || [];
            if (searchQuery) {
              statusTasks = statusTasks.filter((t) =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase())
              );
            }
            if (meMode && user?.roleId) {
              statusTasks = statusTasks.filter((t) =>
                (t.assigned_workers || []).some((m) => m.user_id === user.roleId)
              );
            }

            return (
              <BoardColumn
              key={status.status_id}
              status={status}
              statusTasks={statusTasks}
              draggedTask={draggedTask}
              canAddEditDelete={canAddEditDelete}
              canMoveCards={canMoveCards}
              isAddOpen={activeColumn === status.status_id}
              columnRef={(el) => (columnRefs.current[status.status_id] = el)}
              user={user}
              // add task props
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
              // handlers
              onOpenAddPanel={openAddPanel}
              onCloseAddPanel={closeAddPanel}
              onAddTask={handleAddTask}
              onOpenMemberDialog={() => setIsMemberDialogOpen(true)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onTaskClick={openTaskDetails}
              onTaskDoubleClick={openEditTask}
              onDeleteClick={(task) => {
                setTaskToDeleteFn(task);
                setIsDeleteDialogOpen(true);
              }}
              onEditClick={openEditTask}
              // inline edit props
              editingTaskId={editingTaskId}
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
              onSaveInlineEdit={saveInlineEdit}
              onCancelInlineEdit={cancelInlineEdit}
            />
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

      {/* Dialogs */}
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

      <TaskDetailsDialog
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
        selectedTask={selectedTask}
        isEditingTask={isEditingTask}
        setIsEditingTask={setIsEditingTask}
        editTaskData={editTaskData}
        setEditTaskData={setEditTaskData}
        editSelectedMembers={editSelectedMembers}
        setEditSelectedMembers={setEditSelectedMembers}
        availableMembers={availableMembers}
        statuses={statuses}
        canAddEditDelete={canAddEditDelete}
        isSaving={isSaving}
        onSave={handleEditTask}
        onToggleEditMember={toggleEditMember}
      />

      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        taskToDelete={taskToDelete}
        isSaving={isSaving}
        onConfirm={handleDeleteTask}
        onCancel={() => { setIsDeleteDialogOpen(false); setTaskToDeleteFn(null); }}
      />
    </div>
  );
};

export default TaskBoardPage;
