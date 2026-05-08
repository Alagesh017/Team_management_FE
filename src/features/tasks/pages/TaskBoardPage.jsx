import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCorners,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  SortableContext, 
  arrayMove, 
  verticalListSortingStrategy,
  horizontalListSortingStrategy 
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  User, 
  Folder,
  CheckCircle2, 
  AlertCircle, 
  ArrowUpCircle,
  GripVertical,
  ChevronDown,
  Hash,
  Users as UsersIcon,
  List,
  Kanban,
  CalendarDays,
  GanttChartSquare,
  Search,
  Settings2,
  Filter
} from "lucide-react";

import { taskService } from "../services/taskService";
import { taskStatusService } from "../../task-status/services/taskStatusService";
import { projectService } from "../../projects/services/projectService";
import { allocationService } from "../../project-allocation/services/allocationService";
import { useAuth } from "../../auth/contexts/AuthContext";

import { Button } from "../../../common/components/ui/button";
import { Card } from "../../../common/components/ui/card";
import { Badge } from "../../../common/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../../../common/components/ui/dialog";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../../common/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../common/components/ui/sheet";

import KanbanColumn from "../components/KanbanColumn";
import TaskCard from "../components/TaskCard";

export default function TaskBoardPage() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    goal: "",
    priority: "medium",
    worker_id: "",
    responsibility_person_id: "",
    status_id: "",
    start_date: "",
    due_date: "",
    estimated_hours: "",
    actual_hours: "",
    remark: ""
  });

  const teamLeaders = useMemo(() => {
    if (!allocation?.members) return [];
    return allocation.members.filter(m => m.role === "Team Leader");
  }, [allocation]);

  const allStaff = useMemo(() => {
    if (!allocation?.members) return [];
    return allocation.members;
  }, [allocation]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectData, statusData, tasksData, allocationData] = await Promise.all([
        projectService.getProjectById(projectId),
        taskStatusService.getAllTaskStatuses(),
        taskService.getTasksByProject(projectId),
        allocationService.getAllocationByProjectId(projectId)
      ]);

      setProject(projectData.project);
      // Sort statuses by sort_order
      const sortedStatuses = (statusData.task_statuses || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setStatuses(sortedStatuses);
      setTasks(tasksData.tasks);
      setAllocation(allocationData.allocation);
    } catch (error) {
      console.error("Failed to fetch task board data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    // If dropped on a column, overId is the status ID
    // If dropped on another task, overId is that task's ID
    let newStatusId;
    if (statuses.some(s => s.id === overId)) {
      newStatusId = overId;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      newStatusId = overTask ? overTask.status_id : null;
    }

    if (!newStatusId) return;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate.status_id === newStatusId) return;

    // Optimistic UI update
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status_id: newStatusId, status_name: statuses.find(s => s.id === newStatusId).name } : t
    ));

    try {
      await taskService.updateTask(taskId, { status_id: newStatusId });
    } catch (error) {
      console.error("Failed to update task status:", error);
      fetchData(); // Rollback
    }
  };

  const openCreateDialog = (statusId = "") => {
    setNewTask(prev => ({ ...prev, status_id: statusId }));
    setIsCreateDialogOpen(true);
  };

  const handleCreateTask = async () => {
    try {
      const taskData = {
        ...newTask,
        project_id: parseInt(projectId),
        allocation_id: allocation?.id || null,
        assigned_by: user?.id || null // Get from auth context
      };
      await taskService.createTask(taskData);
      setIsCreateDialogOpen(false);
      setNewTask({ 
        title: "", 
        description: "", 
        goal: "",
        priority: "medium", 
        worker_id: "", 
        responsibility_person_id: "",
        status_id: "",
        start_date: "",
        due_date: "",
        estimated_hours: "",
        actual_hours: "",
        remark: ""
      });
      fetchData();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Board Header - Professional & Integrated */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <Folder className="h-3.5 w-3.5" />
              </div>
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">
                {project?.name || "Project Board"}
              </h1>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 ml-8">Task Management Board</p>
          </div>

          <div className="h-8 w-px bg-slate-100 hidden md:block" />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl transition-all cursor-pointer shadow-sm border border-blue-100">
              <Kanban className="h-3.5 w-3.5" />
              <span className="text-[11px] font-black uppercase tracking-tight">Board</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer group">
              <CalendarDays className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Calendar</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all cursor-pointer group">
              <GanttChartSquare className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold uppercase tracking-tight">Gantt</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-48 hidden lg:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <Input 
              placeholder="Quick search..." 
              className="h-9 pl-9 rounded-xl bg-slate-50 border-none text-[11px] font-bold text-slate-700 focus-visible:ring-1 focus-visible:ring-slate-200 transition-all"
            />
          </div>
          
          <div className="flex -space-x-2 overflow-hidden hover:space-x-1 transition-all">
            {allStaff.slice(0, 5).map((staff, i) => (
              <div 
                key={staff.role_id} 
                className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm cursor-help ring-1 ring-slate-100"
                title={`${staff.username} (${staff.role})`}
              >
                {staff.username[0].toUpperCase()}
              </div>
            ))}
            {allStaff.length > 5 && (
              <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[9px] font-black text-white shadow-sm ring-1 ring-slate-100">
                +{allStaff.length - 5}
              </div>
            )}
          </div>

          <Button 
            onClick={() => openCreateDialog()}
            className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest rounded-xl px-5 shadow-lg shadow-slate-200 transition-all active:scale-95 gap-2"
          >
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Board Area - Scrollable Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#F8FAFC]">
        <div className="h-full inline-flex p-6 gap-6 min-w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {statuses.map((status) => (
              <KanbanColumn 
                key={status.id} 
                status={status} 
                tasks={tasks.filter(t => t.status_id === status.id)} 
                onAddTask={() => openCreateDialog(status.id)}
              />
            ))}

            {createPortal(
              <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: '0.5',
                    },
                  },
                }),
              }}>
                {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </div>
      </div>

      {/* Create Task Sheet */}
      <Sheet open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <SheetContent className="sm:max-w-[540px] p-0 overflow-hidden flex flex-col">
          <SheetHeader className="px-6 py-4 bg-slate-50 border-b">
            <SheetTitle className="text-lg font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Plus className="h-5 w-5" />
              </div>
              Create New Task
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Task Title *</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Implement user authentication" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="rounded-xl border-slate-200 focus:ring-blue-500 h-11 font-bold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Status</Label>
                  <Select value={newTask.status_id.toString()} onValueChange={(val) => setNewTask({...newTask, status_id: parseInt(val)})}>
                    <SelectTrigger className="rounded-xl border-slate-200 h-11 font-bold text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {statuses.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(val) => setNewTask({...newTask, priority: val})}>
                    <SelectTrigger className="rounded-xl border-slate-200 h-11 font-bold text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="low" className="text-blue-600 font-bold">Low</SelectItem>
                      <SelectItem value="medium" className="text-orange-600 font-bold">Medium</SelectItem>
                      <SelectItem value="high" className="text-rose-600 font-bold">High</SelectItem>
                      <SelectItem value="critical" className="text-red-700 font-black">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Description</Label>
                <textarea 
                  id="description" 
                  rows={4}
                  className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-600"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal" className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Goal</Label>
                <textarea 
                  id="goal" 
                  rows={4}
                  className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-600"
                  value={newTask.goal}
                  onChange={(e) => setNewTask({...newTask, goal: e.target.value})}
                />
              </div>
            </div>

            {/* Section 3: Hierarchy */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Responsibility (TL Only)</Label>
                <Select 
                  value={newTask.responsibility_person_id?.toString()} 
                  onValueChange={(val) => setNewTask({...newTask, responsibility_person_id: parseInt(val)})}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 font-bold text-slate-700 bg-white">
                    <SelectValue placeholder="Select TL" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {teamLeaders.map(m => (
                      <SelectItem key={m.role_id} value={m.role_id.toString()}>
                        {m.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Assign To (Staff)</Label>
                <Select 
                  value={newTask.worker_id?.toString()} 
                  onValueChange={(val) => setNewTask({...newTask, worker_id: parseInt(val)})}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 font-bold text-slate-700 bg-white">
                    <SelectValue placeholder="Select Staff" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {allStaff.map(m => (
                      <SelectItem key={m.role_id} value={m.role_id.toString()}>
                        {m.username} ({m.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Section 4: Timeline & Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date" className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Start Date</Label>
                <Input 
                  id="start_date" 
                  type="date"
                  value={newTask.start_date}
                  onChange={(e) => setNewTask({...newTask, start_date: e.target.value})}
                  className="rounded-xl border-slate-200 h-11 font-bold text-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due_date" className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Due Date</Label>
                <Input 
                  id="due_date" 
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  className="rounded-xl border-slate-200 h-11 font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="estimated_hours" className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Estimated Hours</Label>
                <div className="relative">
                  <Input 
                    id="estimated_hours" 
                    type="number"
                    step="0.5"
                    value={newTask.estimated_hours}
                    onChange={(e) => setNewTask({...newTask, estimated_hours: e.target.value})}
                    className="rounded-xl border-slate-200 h-11 font-bold text-slate-700 pr-8"
                  />
                  <Clock className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="actual_hours" className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Actual Hours</Label>
                <div className="relative">
                  <Input 
                    id="actual_hours" 
                    type="number"
                    step="0.5"
                    value={newTask.actual_hours}
                    onChange={(e) => setNewTask({...newTask, actual_hours: e.target.value})}
                    className="rounded-xl border-slate-200 h-11 font-bold text-slate-700 pr-8"
                  />
                  <Clock className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Section 5: Remarks */}
            <div className="grid gap-2 pb-10">
              <Label htmlFor="remark" className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Remark</Label>
              <Input 
                id="remark" 
                placeholder="Any additional notes..." 
                value={newTask.remark}
                onChange={(e) => setNewTask({...newTask, remark: e.target.value})}
                className="rounded-xl border-slate-200 h-11 font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-white border-t flex items-center justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl font-bold px-6 h-11 border-slate-200 hover:bg-slate-50 transition-all">Cancel</Button>
            <Button onClick={handleCreateTask} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-10 h-11 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Create Task</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
