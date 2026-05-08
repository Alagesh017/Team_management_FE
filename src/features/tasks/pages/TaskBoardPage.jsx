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
  List as ListIcon,
  Kanban,
  CalendarDays,
  GanttChartSquare,
  Search,
  Settings2,
  Filter,
  ChevronRight,
  Star,
  Share2,
  Bot,
  Zap,
  MessageSquare,
  LayoutGrid
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

const TabItem = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-1.5 px-1 py-4 border-b-2 transition-all cursor-pointer group ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
    <Icon className={`h-4 w-4 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
    <span className="text-[13px] font-semibold whitespace-nowrap">{label}</span>
  </div>
);

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
      
      // Fetch statuses first as they are critical for the board
      try {
        const statusData = await taskStatusService.getAllTaskStatuses();
        const apiStatuses = statusData.task_statuses || [];
        
        if (apiStatuses.length > 0) {
          const sortedStatuses = [...apiStatuses].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setStatuses(sortedStatuses);
        } else {
          // Fallback if API returns empty array
          setStatuses([
            { id: 1, name: 'TO DO', color: '#94A3B8', sort_order: 1 },
            { id: 2, name: 'IN PROGRESS', color: '#3B82F6', sort_order: 2 },
            { id: 3, name: 'COMPLETED', color: '#10B981', sort_order: 3 }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch statuses:", err);
        // Fallback default statuses if call fails
        setStatuses([
          { id: 1, name: 'TO DO', color: '#94A3B8', sort_order: 1 },
          { id: 2, name: 'IN PROGRESS', color: '#3B82F6', sort_order: 2 },
          { id: 3, name: 'COMPLETED', color: '#10B981', sort_order: 3 }
        ]);
      }

      // Fetch other data in parallel
      const [projectRes, tasksRes, allocationRes] = await Promise.allSettled([
        projectService.getProjectById(projectId),
        taskService.getTasksByProject(projectId),
        allocationService.getAllocationByProjectId(projectId)
      ]);

      if (projectRes.status === 'fulfilled') setProject(projectRes.value.project);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.tasks || []);
      if (allocationRes.status === 'fulfilled') setAllocation(allocationRes.value.allocation);

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

    let newStatusId = null;

    // Check if dropped on a column (id format: column-{statusId})
    if (typeof overId === 'string' && overId.startsWith('column-')) {
      newStatusId = parseInt(overId.replace('column-', ''));
    } 
    // Check if dropped on another task
    else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatusId = overTask.status_id;
      }
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
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      {/* 1. Top Breadcrumb Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
          <div className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer">
            <LayoutGrid className="h-4 w-4 text-pink-500" />
            <span>All Projects</span>
          </div>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <div className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer">
            <Folder className="h-4 w-4 text-slate-400" />
            <span>{project?.name || "Project"}</span>
          </div>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <div className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer">
            <ListIcon className="h-4 w-4 text-slate-400" />
            <span>List</span>
          </div>
          <Star className="h-3.5 w-3.5 ml-1 text-slate-300 hover:text-yellow-400 cursor-pointer transition-colors" />
          <div className="h-5 w-7 rounded flex items-center justify-center hover:bg-slate-100 cursor-pointer ml-1">
            <ChevronDown className="h-3 w-3" />
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer text-[12px] font-semibold">
            <MessageSquare className="h-4 w-4" />
            <span>Agents</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer text-[12px] font-semibold">
            <Zap className="h-4 w-4" />
            <span>Automate</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 cursor-pointer text-[12px] font-bold">
            <Bot className="h-4 w-4" />
            <span>Ask AI</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-slate-900 cursor-pointer text-[12px] font-semibold">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </div>
        </div>
      </div>

      {/* 2. Secondary Navigation Tabs */}
      <div className="flex items-center px-4 py-1.5 bg-white border-b border-slate-100 shrink-0 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-6">
          <TabItem icon={Hash} label="Channel" />
          <TabItem icon={UsersIcon} label="Team" />
          <TabItem icon={ListIcon} label="List" />
          <TabItem icon={Kanban} label="Board" active />
          <TabItem icon={CalendarDays} label="Calendar" />
          <TabItem icon={GanttChartSquare} label="Gantt" />
          <div className="flex items-center gap-1 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors ml-2">
            <Plus className="h-3.5 w-3.5" />
            <span className="text-[12px] font-semibold">View</span>
          </div>
        </div>
      </div>

      {/* 3. Utility Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-all border border-indigo-100/50 group shadow-sm">
            <LayoutGrid className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[12px] font-black uppercase tracking-wider">Status</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </div>
          <div className="h-4 w-px bg-slate-100" />
          <div className="flex items-center gap-1 text-slate-400 cursor-pointer hover:text-slate-900">
            <Filter className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-slate-400 mr-2">
            <Settings2 className="h-4 w-4 hover:text-slate-900 cursor-pointer" />
            <Filter className="h-4 w-4 hover:text-slate-900 cursor-pointer" />
            <CheckCircle2 className="h-4 w-4 hover:text-slate-900 cursor-pointer" />
            <UsersIcon className="h-4 w-4 hover:text-slate-900 cursor-pointer" />
            <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-2 ring-white">
              JD
            </div>
            <Search className="h-4 w-4 hover:text-slate-900 cursor-pointer" />
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <Button 
            onClick={() => openCreateDialog()}
            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-widest rounded-lg px-4 shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[3px]" /> Task
            <div className="h-4 w-px bg-white/20 mx-0.5" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* 4. Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50/30">
        <div className="h-full inline-flex p-4 gap-4 min-w-full">
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
