import React, { useEffect, useState } from "react";
import iconTop from "../../../assets/icon_top.png";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  ClipboardList,
  Calendar,
  Lock,
  LogOut,
  ChevronRight,
  ChevronDown,
  UserCog,
  HardHat,
  Settings,
  FolderKanban,
  UserPlus,
  MessageSquare,
  ShieldAlert,
  LayoutGrid,
  Plus,
  Folder,
  ListTodo,
  Share2,
  MoreHorizontal,
  GripVertical,
  Search,
  BarChart3,
  PlayCircle,
  Calendar as CalendarIcon,
  FileText,
} from "lucide-react";
import SprintForm from "../../../features/sprints/components/SprintForm";
import { sprintService } from "../../../features/sprints/services/sprintService";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Input } from "../ui/input";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { projectService } from "../../../features/projects/services/projectService";
import { useAuth } from "../../../features/auth/contexts/AuthContext";
import ProjectGroupForm from "../../../features/projects/components/ProjectGroupForm";
import { useProjects } from "../../../features/projects/contexts/ProjectContext";
import { useToast } from "../../hooks/use-toast";

// Draggable Project Component
const DraggableProject = ({ project, isActive, isRestricted, onToggleExpand, isExpanded, onOpenCreateSprint, onOpenEditSprint, closeSidebarOnMobile, sidebarState }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `project-${project.id}`,
    data: { project },
    disabled: isRestricted,
  });
  const navigate = useNavigate();
  const { state } = useSidebar();
  const effectiveSidebarState = sidebarState || state;

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isRestricted ? {} : listeners)}
      {...(isRestricted ? {} : attributes)}
      className={`group/project-item ${isDragging ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
    >
      <div className="list-none">
        {effectiveSidebarState === 'icon' ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                tooltip={project.name}
                className={`py-[5px] px-2 rounded-md transition-colors ${
                  isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`h-4.5 w-4.5 rounded flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-slate-900' : 'bg-slate-200'
                }`}>
                  <Folder className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-yellow-500'}`} />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-[240px]">
              <div className="p-2">
                <DropdownMenuItem
                  onClick={() => {
                    navigate(`/tasks/project/${project.id}`);
                    closeSidebarOnMobile();
                  }}
                  className={`cursor-pointer flex items-center gap-2 mb-1 ${
                    isActive ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <Folder className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">View Project</span>
                </DropdownMenuItem>
                {(project.sprints || []).length > 0 && (
                  <>
                    <div className="my-2 border-t border-slate-200" />
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                      Sprints
                    </div>
                    {(project.sprints || []).map((sprint) => (
                      <DropdownMenuItem
                        key={sprint.id}
                        onClick={() => {
                          navigate(`/tasks/project/${project.id}/sprint/${sprint.id}`);
                          closeSidebarOnMobile();
                        }}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <PlayCircle className={`h-3.5 w-3.5 shrink-0 ${
                        sprint.sprint_status === 1 ? 'text-emerald-500' :
                        sprint.sprint_status === 2 ? 'text-blue-500' :
                        'text-slate-400'
                      }`} />
                      <span className="text-sm truncate flex-1">{sprint.sprint_name}</span>
                      {sprint.sprint_status === 1 && (
                        <span className="text-[10px] font-bold text-white bg-emerald-500 rounded-full h-4 min-w-[32px] px-1 flex items-center justify-center">
                          LIVE
                        </span>
                      )}
                      {typeof sprint.task_count === 'number' && sprint.task_count > 0 && (
                        <span className="text-[10px] font-bold text-white bg-pink-500 rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                          {sprint.task_count > 99 ? '99+' : sprint.task_count}
                        </span>
                      )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                {!isRestricted && (
                  <>
                    <div className="my-2 border-t border-slate-200" />
                    <DropdownMenuItem
                      onClick={() => onOpenCreateSprint(project.id)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Create Sprint</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate(`/projects/${project.id}/sprints`)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span className="text-sm">Sprint Management</span>
                    </DropdownMenuItem>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <div
              className={`flex items-center gap-2 py-[5px] px-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ${
                isActive ? 'bg-slate-100' : ''
              }`}
            >
              {/* Expand/Collapse button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleExpand(project.id);
                }}
                className="p-0.5 rounded hover:bg-slate-200 shrink-0"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />}
              </button>

              {/* Project icon */}
              <div className={`h-4.5 w-4.5 rounded flex items-center justify-center shrink-0 ${
                isActive ? 'bg-slate-900' : ''
              }`}>
                <Folder className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-yellow-500'}`} />
              </div>

              {/* Project Link */}
              <Link
                to={`/tasks/project/${project.id}`}
                className="flex-1 min-w-0"
                onClick={closeSidebarOnMobile}
              >
                <span className="text-[13px] font-medium text-slate-600 group-hover/project-item:text-slate-900 truncate block">
                  {project.name}
                </span>
              </Link>

              {/* Actions: "..." and "+" appear on hover */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover/project-item:opacity-100 transition-opacity shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded hover:bg-slate-200"
                      title="More"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/sprints`);
                      }}
                      className="cursor-pointer"
                    >
                      <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                      Sprint Management
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenCreateSprint(project.id);
                  }}
                  className="p-1 rounded hover:bg-slate-200"
                  title="Create Sprint"
                >
                  <Plus className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {!isRestricted && (
                  <GripVertical className="h-3.5 w-3.5 text-slate-300 cursor-grab" />
                )}
              </div>
            </div>

            {/* Sprints List */}
            {isExpanded && (
              <div className="ml-[26px] mt-0.5 space-y-0.5">
                {(project.sprints || []).map((sprint) => (
                  <div
                    key={sprint.id}
                    className="flex items-center gap-2 py-[5px] px-2 rounded-md hover:bg-slate-100 cursor-pointer text-[13px] group/sprint"
                  >
                    <div
                      onClick={() => {
                        navigate(`/tasks/project/${project.id}/sprint/${sprint.id}`);
                        closeSidebarOnMobile();
                      }}
                      className="flex items-center gap-2 flex-1"
                    >
                      <PlayCircle className={`h-3.5 w-3.5 shrink-0 ${
                        sprint.sprint_status === 1 ? 'text-emerald-500' :
                        sprint.sprint_status === 2 ? 'text-blue-500' :
                        'text-slate-400'
                      }`} />
                      <span className="text-slate-500 group-hover/sprint:text-slate-900 truncate flex-1">
                        {sprint.sprint_name}
                      </span>
                      {sprint.sprint_status === 1 && (
                        <span className="text-[10px] font-bold text-white bg-emerald-500 rounded-full h-4 min-w-[32px] px-1 flex items-center justify-center">
                          LIVE
                        </span>
                      )}
                      {typeof sprint.task_count === 'number' && sprint.task_count > 0 && (
                        <span className="text-[10px] font-bold text-white bg-pink-500 rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                          {sprint.task_count > 99 ? '99+' : sprint.task_count}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditSprint(sprint);
                      }}
                      className="p-0.5 rounded hover:bg-slate-200 shrink-0 opacity-0 group-hover/sprint:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </div>
                ))}

                {/* Create Sprint inline action */}
                {!isRestricted && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenCreateSprint(project.id);
                    }}
                    className="flex items-center gap-2 py-[5px] px-2 rounded-md hover:bg-slate-100 text-[13px] text-slate-400 w-full"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Sprint</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Droppable Group Component
const DroppableGroup = ({ group, projects, currentPath, searchQuery, isRestricted, expandedProjects, onToggleExpand, onOpenCreateSprint, onOpenEditSprint, closeSidebarOnMobile, sidebarState }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: group ? group.id.toString() : "uncategorized",
    disabled: isRestricted,
  });
  const { state } = useSidebar();
  const effectiveSidebarState = sidebarState || state;
  const navigate = useNavigate();

  const groupedProjects = projects.filter(p => group ? p.group_id === group.id : !p.group_id);
  const hasMatchingProjects = searchQuery && groupedProjects.some(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const isActiveGroup = groupedProjects.some(p => currentPath === `/tasks/project/${p.id}`);

  const [open, setOpen] = useState(isActiveGroup || isOver);

  React.useEffect(() => {
    if (hasMatchingProjects) {
      setOpen(true);
    }
  }, [hasMatchingProjects]);

  return (
    <SidebarMenuItem ref={setNodeRef} className="mb-0.5">
      {effectiveSidebarState === 'icon' ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={group ? group.name : "Uncategorized"}
              className={`group/group-trigger font-medium py-[5px] px-2 rounded-md transition-colors ${
                isOver ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className={`h-4.5 w-4.5 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${group ? getGroupColor(group.name) : 'bg-slate-900'}`}>
                {group ? group.name[0].toUpperCase() : 'U'}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-[220px]">
            <div className="p-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                {group ? group.name : "Uncategorized"}
              </div>
              {groupedProjects.length > 0 ? (
                groupedProjects
                  .filter(p =>
                    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => {
                        navigate(`/tasks/project/${project.id}`);
                        closeSidebarOnMobile();
                      }}
                      className={`cursor-pointer flex items-center gap-2 ${
                        currentPath === `/tasks/project/${project.id}` ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <div className={`h-4 w-4 rounded flex items-center justify-center shrink-0 ${
                        currentPath === `/tasks/project/${project.id}` ? 'bg-slate-900' : 'bg-slate-200'
                      }`}>
                        <Folder className={`h-3 w-3 ${
                          currentPath === `/tasks/project/${project.id}` ? 'text-white' : 'text-yellow-500'
                        }`} />
                      </div>
                      <span className="text-sm truncate flex-1">{project.name}</span>
                    </DropdownMenuItem>
                  ))
              ) : (
                <div className="text-[11px] font-medium text-slate-400 italic px-1">
                  Empty group
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Collapsible open={open} onOpenChange={setOpen} className="group/group-collapsible">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={group ? group.name : "Uncategorized"}
              className={`group/group-trigger font-medium py-[5px] px-2 rounded-md transition-colors ${
                isOver ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className={`h-4.5 w-4.5 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${group ? getGroupColor(group.name) : 'bg-slate-900'}`}>
                {group ? group.name[0].toUpperCase() : 'U'}
              </div>
              <span className="font-medium text-[13px] truncate group-data-[collapsible=icon]:hidden">
                {group ? group.name : "Uncategorized"}
              </span>

              <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover/group-trigger:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="p-1 rounded hover:bg-slate-200"
                  title="More"
                >
                  <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {!isRestricted && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="p-1 rounded hover:bg-slate-200"
                    title="Add"
                  >
                    <Plus className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuSub className="ml-[9px] border-l border-slate-200 pl-2.5 py-0.5 space-y-0.5">
              {groupedProjects.length > 0 ? (
                groupedProjects
                  .filter(p =>
                    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((project) => (
                    <DraggableProject
                      key={project.id}
                      project={project}
                      isActive={currentPath === `/tasks/project/${project.id}`}
                      isRestricted={isRestricted}
                      onToggleExpand={onToggleExpand}
                      isExpanded={expandedProjects[project.id]}
                      onOpenCreateSprint={onOpenCreateSprint}
                      onOpenEditSprint={onOpenEditSprint}
                      closeSidebarOnMobile={closeSidebarOnMobile}
                      sidebarState={effectiveSidebarState}
                    />
                  ))
              ) : (
                <div className="text-[11px] font-medium text-slate-400 italic px-2 py-2.5 rounded-md border border-dashed border-slate-200 flex items-center justify-center">
                  {isOver ? 'Drop here' : 'Empty group'}
                </div>
              )}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      )}
    </SidebarMenuItem>
  );
};

const getGroupColor = (name) => {
  const colors = [
    "bg-pink-500",
    "bg-orange-500",
    "bg-blue-600",
    "bg-indigo-600",
    "bg-emerald-600",
    "bg-slate-900",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const { projects, groups, loading, fetchProjects, addGroup } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isNewGroupSheetOpen, setIsNewGroupSheetOpen] = useState(false);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [activeProject, setActiveProject] = useState(null);
  const [isSprintSheetOpen, setIsSprintSheetOpen] = useState(false);
  const [currentProjectForSprint, setCurrentProjectForSprint] = useState(null);
  const [currentSprintForEdit, setCurrentSprintForEdit] = useState(null);
  const [isSubmittingSprint, setIsSubmittingSprint] = useState(false);
  const [sprintError, setSprintError] = useState("");
  const [expandedProjects, setExpandedProjects] = useState({});
  const { toast } = useToast();
  const { state: sidebarState } = useSidebar();

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // Auto-expand projects that have active sprints (sprint_status === 1)
  useEffect(() => {
    const newExpanded = {};
    projects.forEach(project => {
      const hasActiveSprint = (project.sprints || []).some(sprint => sprint.sprint_status === 1);
      if (hasActiveSprint) {
        newExpanded[project.id] = true;
      }
    });
    setExpandedProjects(prev => ({ ...prev, ...newExpanded }));
  }, [projects]);

  const handleCreateGroup = async (data) => {
    try {
      setIsSubmittingGroup(true);
      setGroupError("");
      await addGroup(data);
      toast({
        title: "Success",
        description: "Project group created successfully",
        variant: "success",
      });
      setIsNewGroupSheetOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.msg || err.error || "Failed to create group";
      setGroupError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const project = active.data.current.project;
    setActiveProject(project);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id.replace("project-", "");
    const newGroupId = over.id === "uncategorized" ? null : parseInt(over.id);
    const sourceGroupId = active.data.current.project.group_id;

    if (newGroupId === sourceGroupId) return;

    // Optimistic UI update would be better through context, but let's just call updateProject
    try {
      await projectService.updateProject(projectId, { group_id: newGroupId });
      await fetchProjects(); // Refresh after update
    } catch (error) {
      console.error("Failed to update project group:", error);
      await fetchProjects(); // Rollback
    }
  };

  const handleCreateSprint = async (data) => {
    try {
      setIsSubmittingSprint(true);
      setSprintError("");
      if (currentSprintForEdit) {
        await sprintService.updateSprint(currentSprintForEdit.id, data);
        toast({
          title: "Success",
          description: "Sprint updated successfully",
          variant: "success",
        });
      } else {
        await sprintService.createSprint(data);
        toast({
          title: "Success",
          description: "Sprint created successfully",
          variant: "success",
        });
      }
      await fetchProjects(); // Refresh project data
      setIsSprintSheetOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.msg || err.error || "Failed to save sprint";
      setSprintError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingSprint(false);
    }
  };

  const openCreateSprint = (projectId) => {
    setCurrentProjectForSprint(projectId);
    setCurrentSprintForEdit(null);
    setIsSprintSheetOpen(true);
  };

  const openEditSprint = (sprint) => {
    setCurrentSprintForEdit(sprint);
    setCurrentProjectForSprint(sprint.project_id);
    setIsSprintSheetOpen(true);
  };

  const toggleProjectExpand = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isRestrictedRole = user?.role === "team_leader" || user?.role === "worker";

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    // { title: "Task Dashboard", url: "/tasks-dashboard", icon: BarChart3 },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Leave & Permissions", url: "/leave", icon: Calendar },
    ...(isRestrictedRole ? [] : [
      {
        title: "Master",
        icon: Settings,
        subItems: [
          { title: "Admin", url: "/admin", icon: UserCog },
          { title: "Workers", url: "/workers", icon: HardHat },
          { title: "Task Status", url: "/task-status", icon: ClipboardList },
          { title: "Project Grouping", url: "/project-grouping", icon: LayoutGrid },
        ],
      },
      { title: "Groups", url: "/groups", icon: Calendar },
      { title: "Clients", url: "/clients", icon: Users },
      { title: "Projects", url: "/projects", icon: FolderKanban },
      { title: "Project Allocation", url: "/project-allocation", icon: UserPlus },
    ]),
  ];

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b px-2 py-4 flex items-center justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex items-center gap-3 font-bold text-xl px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center w-full">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-lg transition-all duration-300 overflow-hidden">
              <img src={iconTop} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden">
              Team Manager
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
          >
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-2">
                  {/* Render Dashboard first */}
                  {menuItems.find(item => item.title === "Dashboard") && (
                    <SidebarMenuItem key="dashboard">
                      <SidebarMenuButton asChild tooltip="Dashboard" isActive={location.pathname === "/dashboard"} className="relative pr-6">
                        <Link to="/dashboard" onClick={closeSidebarOnMobile}>
                          <LayoutDashboard />
                          <span>Dashboard</span>
                          {location.pathname === "/dashboard" && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-600">
                              <ChevronRight className="h-3 w-3" />
                            </div>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}

                  {/* Render Master menu next */}
                  {!isRestrictedRole && menuItems.find(item => item.title === "Master") && (
                    <SidebarMenuItem key="master">
                      {(() => {
                        const masterSubItems = [
                          { title: "Admin", url: "/admin", icon: UserCog },
                          { title: "Workers", url: "/workers", icon: HardHat },
                          { title: "Task Status", url: "/task-status", icon: ClipboardList },
                          { title: "Project Grouping", url: "/project-grouping", icon: LayoutGrid },
                        ];
                        
                        if (sidebarState === 'icon') {
                          return (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuButton tooltip="Master">
                                  <Settings />
                                  <span>Master</span>
                                </SidebarMenuButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="right" align="start" className="w-[180px]">
                                {masterSubItems.map((subItem) => {
                                  const isActive = location.pathname === subItem.url;
                                  return (
                                    <DropdownMenuItem
                                      key={subItem.title}
                                      onClick={() => {
                                        navigate(subItem.url);
                                        closeSidebarOnMobile();
                                      }}
                                      className={`cursor-pointer ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}
                                    >
                                      {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                                      {subItem.title}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          );
                        }
                        
                        return (
                          <Collapsible defaultOpen className="group/collapsible">
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton tooltip="Master">
                                <Settings />
                                <span>Master</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {masterSubItems.map((subItem) => {
                                  const isActive = location.pathname === subItem.url;
                                  return (
                                    <SidebarMenuSubItem key={subItem.title}>
                                      <SidebarMenuSubButton asChild isActive={isActive} className="relative pr-6">
                                        <Link to={subItem.url} onClick={closeSidebarOnMobile} className="w-full flex items-center">
                                          {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                          <span>{subItem.title}</span>
                                          {isActive && (
                                            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-600">
                                              <ChevronRight className="h-3 w-3" />
                                            </div>
                                          )}
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })()}
                    </SidebarMenuItem>
                  )}

                  {/* Always show Project Groups section here */}
                  <div key="groups-section" className="mt-1 mb-2 group-data-[collapsible=icon]:mt-0">
                    <div className="px-2 py-1 mb-2 group-data-[collapsible=icon]:hidden">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Groups</span>
                        </div>
                        {!isRestrictedRole && (
                          <button
                            onClick={() => setIsNewGroupSheetOpen(true)}
                            className="h-5 w-5 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                          >
                            <Plus className="h-3 w-3 text-slate-500" />
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          placeholder="Search projects..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 bg-slate-50/50 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Grouped Projects */}
                    <div className="space-y-0.5">
                      {groups
                        .filter((group) => {
                          if (!searchQuery) return true;
                          const groupProjects = projects.filter(p => p.group_id === group.id);
                          return groupProjects.some(p =>
                            p.name.toLowerCase().includes(searchQuery.toLowerCase())
                          );
                        })
                        .map((group) => (
                          <DroppableGroup
                            key={group.id}
                            group={group}
                            projects={projects}
                            currentPath={location.pathname}
                            searchQuery={searchQuery}
                            isRestricted={isRestrictedRole}
                            expandedProjects={expandedProjects}
                            onToggleExpand={toggleProjectExpand}
                            onOpenCreateSprint={openCreateSprint}
                            onOpenEditSprint={openEditSprint}
                            closeSidebarOnMobile={closeSidebarOnMobile}
                            sidebarState={sidebarState}
                          />
                        ))}

                      {/* Uncategorized Projects */}
                      {(() => {
                        const uncategorizedProjects = projects.filter(p => !p.group_id);
                        if (searchQuery) {
                          const hasMatching = uncategorizedProjects.some(p =>
                            p.name.toLowerCase().includes(searchQuery.toLowerCase())
                          );
                          if (!hasMatching) return null;
                        }
                        return (
                          <DroppableGroup
                            group={null}
                            projects={projects}
                            currentPath={location.pathname}
                            searchQuery={searchQuery}
                            isRestricted={isRestrictedRole}
                            expandedProjects={expandedProjects}
                            onToggleExpand={toggleProjectExpand}
                            onOpenCreateSprint={openCreateSprint}
                            onOpenEditSprint={openEditSprint}
                            closeSidebarOnMobile={closeSidebarOnMobile}
                            sidebarState={sidebarState}
                          />
                        );
                      })()}
                    </div>
                  </div>

                  {/* Render remaining menu items (exclude Groups since we show project groups) */}
                  {menuItems.filter(item => item.title !== "Dashboard" && item.title !== "Master" && item.title !== "Groups").map((item) => {
                    return (
                      <SidebarMenuItem key={item.title}>
                        {(() => {
                          if (item.subItems) {
                            if (sidebarState === 'icon') {
                              return (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title}>
                                      <item.icon />
                                      <span>{item.title}</span>
                                    </SidebarMenuButton>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent side="right" align="start" className="w-[180px]">
                                    {item.subItems.map((subItem) => {
                                      const isActive = location.pathname === subItem.url;
                                      return (
                                        <DropdownMenuItem
                                          key={subItem.title}
                                          onClick={() => {
                                            navigate(subItem.url);
                                            closeSidebarOnMobile();
                                          }}
                                          className={`cursor-pointer ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}
                                        >
                                          {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                                          {subItem.title}
                                        </DropdownMenuItem>
                                      );
                                    })}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              );
                            }
                            
                            return (
                              <Collapsible defaultOpen className="group/collapsible">
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton tooltip={item.title}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub>
                                    {item.subItems.map((subItem) => {
                                      const isActive = location.pathname === subItem.url;
                                      return (
                                        <SidebarMenuSubItem key={subItem.title}>
                                          <SidebarMenuSubButton asChild isActive={isActive} className="relative pr-6">
                                            <Link to={subItem.url} onClick={closeSidebarOnMobile} className="w-full flex items-center">
                                              {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                              <span>{subItem.title}</span>
                                              {isActive && (
                                                <div className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-600">
                                                  <ChevronRight className="h-3 w-3" />
                                                </div>
                                              )}
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      );
                                    })}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          }
                          
                          return (
                            <SidebarMenuButton asChild tooltip={item.title} isActive={location.pathname === item.url} className="relative pr-6">
                              <Link to={item.url} onClick={closeSidebarOnMobile}>
                                <item.icon />
                                <span>{item.title}</span>
                                {location.pathname === item.url && (
                                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-600">
                                    <ChevronRight className="h-3 w-3" />
                                  </div>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          );
                        })()}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

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
                {activeProject ? (
                  <div className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-white shadow-2xl ring-1 ring-slate-200 border border-blue-500/20 scale-105 opacity-90 cursor-grabbing min-w-[180px]">
                    <div className="h-4.5 w-4.5 rounded flex items-center justify-center bg-slate-900">
                      <Folder className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-[13px] font-medium text-slate-900">
                      {activeProject.name}
                    </span>
                  </div>
                ) : null}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  setIsLogoutDialogOpen(true);
                  closeSidebarOnMobile();
                }}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                tooltip="Logout"
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Group Sheet */}
      <Sheet open={isNewGroupSheetOpen} onOpenChange={setIsNewGroupSheetOpen}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl font-black uppercase tracking-tight">
              Create New Group
            </SheetTitle>
            <SheetDescription className="font-medium">
              Groups help you categorize and manage multiple related projects together.
            </SheetDescription>
          </SheetHeader>
          <ProjectGroupForm
            onSubmit={handleCreateGroup}
            submitting={isSubmittingGroup}
            error={groupError}
          />
        </SheetContent>
      </Sheet>

      {/* Sprint Sheet */}
      <Sheet open={isSprintSheetOpen} onOpenChange={(open) => {
        if (!open) {
          setIsSprintSheetOpen(false);
          setCurrentSprintForEdit(null);
          setCurrentProjectForSprint(null);
        } else {
          setIsSprintSheetOpen(true);
        }
      }}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl font-black uppercase tracking-tight">
              {currentSprintForEdit ? 'Edit Sprint' : 'Create New Sprint'}
            </SheetTitle>
            <SheetDescription className="font-medium">
              {currentSprintForEdit ? 'Update the sprint details.' : 'Add a new sprint to this project.'}
            </SheetDescription>
          </SheetHeader>
          <SprintForm
            onSubmit={handleCreateSprint}
            initialData={currentSprintForEdit}
            submitting={isSubmittingSprint}
            error={sprintError}
            projectId={currentProjectForSprint}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}