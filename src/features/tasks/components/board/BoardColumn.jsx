import React from "react";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import AddTaskPanel from "./AddTaskPanel";

const BoardColumn = ({
  status,
  statusTasks,
  draggedTask,
  canAddEditDelete,
  canMoveCards,
  isAddOpen,
  columnRef,
  // add task props
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
  // handlers
  onOpenAddPanel,
  onCloseAddPanel,
  onAddTask,
  onOpenMemberDialog,
  onDragStart,
  onDragEnd,
  onDrop,
  onTaskClick,
  onDeleteClick,
}) => {
  const color = status.color || "#6366f1";
  const cantDropHere =
    draggedTask &&
    status.is_confidential;

  return (
    <div
      className={`flex-shrink-0 w-72 flex flex-col h-full rounded-lg overflow-hidden transition-all duration-200 ${
        cantDropHere
          ? "ring-2 ring-red-300 opacity-60"
          : draggedTask
          ? "ring-2 ring-indigo-200 ring-offset-2"
          : ""
      }`}
      style={{
        background: cantDropHere ? "#fef2f2" : "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      {/* Column header */}
      <div className="px-3 pt-3 pb-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span
              className="font-semibold text-slate-700 text-sm tracking-wide uppercase"
              style={{ letterSpacing: "0.04em" }}
            >
              {status.name}
            </span>
            {status.is_confidential && (
              <span className="text-[9px] font-bold text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                CONFIDENTIAL
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {statusTasks.length}
            </span>
            {canAddEditDelete && (
              <button
                onClick={() => onOpenAddPanel(status.status_id)}
                className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {/* color bar */}
        <div
          className="h-0.5 rounded-full mt-3"
          style={{ backgroundColor: color, opacity: 0.3 }}
        />
      </div>

      {/* Tasks scrollable area */}
      <div
        ref={columnRef}
        className="flex-1 overflow-y-auto px-3 pb-3 space-y-2"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
        onDragOver={(e) => {
          if (cantDropHere) {
            e.dataTransfer.dropEffect = "none";
          } else {
            e.preventDefault();
          }
        }}
        onDrop={() => onDrop(status.status_id)}
      >
        {statusTasks.map((task) => (
          <TaskCard
            key={task.task_id}
            task={task}
            color={color}
            draggedTask={draggedTask}
            canAddEditDelete={canAddEditDelete}
            canMoveCards={canMoveCards}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onTaskClick}
            onDeleteClick={onDeleteClick}
          />
        ))}

        {/* Add task panel or button */}
        {isAddOpen ? (
          <AddTaskPanel
            statusId={status.status_id}
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
            onSave={onAddTask}
            onClose={onCloseAddPanel}
            onOpenMemberDialog={onOpenMemberDialog}
          />
        ) : (
          canAddEditDelete && (
            <button
              onClick={() => onOpenAddPanel(status.status_id)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium border-2 border-dashed border-slate-100 hover:border-slate-200 group"
            >
              <div className="h-5 w-5 rounded-md bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                <Plus className="h-3 w-3 group-hover:text-indigo-500 transition-colors" />
              </div>
              Add task
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default BoardColumn;