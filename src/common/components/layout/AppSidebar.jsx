import React, { useEffect, useState } from "react";
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
  BarChart3
} from "lucide-react";

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
import { projectGroupService } from "../../../features/projects/services/projectGroupService";
import { useAuth } from "../../../features/auth/contexts/AuthContext";
import ProjectGroupForm from "../../../features/projects/components/ProjectGroupForm";

// Draggable Project Component
const DraggableProject = ({ project, isActive, isRestricted }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `project-${project.id}`,
    data: { project },
    disabled: isRestricted,
  });
  const { state } = useSidebar();

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isRestricted ? {} : listeners)}
      {...(isRestricted ? {} : attributes)}
      className={`group/project-item transition-all duration-200 ${
        isDragging ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'
      }`}
    >
      <SidebarMenuSubItem className="list-none group-data-[collapsible=icon]:hidden">
        <SidebarMenuSubButton 
          asChild 
          isActive={isActive}
          className="group/project-link flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-slate-50 border-2 border-transparent transition-all duration-200 relative pr-6"
        >
          <Link to={`/tasks/project/${project.id}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-50 group-hover/project-link:bg-white transition-colors">
                <Folder className="h-4.5 w-4.5 text-slate-400 group-hover/project-link:text-blue-500 transition-colors" />
              </div>
              <span className="text-[13px] font-semibold text-slate-600 group-hover/project-link:text-slate-900 truncate">
                {project.name}
              </span>
            </div>
            {isActive && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-600">
                <ChevronRight className="h-3 w-3" />
              </div>
            )}
            {!isRestricted && (
              <GripVertical className="h-4 w-4 ml-auto opacity-0 group-hover/project-link:opacity-40 text-slate-300 transition-opacity" />
            )}
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    </div>
  );
};

// Droppable Group Component
const DroppableGroup = ({ group, projects, currentPath, searchQuery, isRestricted }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: group ? group.id.toString() : "uncategorized",
    disabled: isRestricted,
  });
  const { state } = useSidebar();

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
    <SidebarMenuItem ref={setNodeRef} className="mb-1">
      <Collapsible open={open} onOpenChange={setOpen} className="group/group-collapsible">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton 
            tooltip={group ? group.name : "Uncategorized"} 
            className={`font-medium transition-all duration-300 py-3 px-4 rounded-xl ${
              isOver ? 'text-blue-600 bg-blue-50/20 shadow-sm' : 'text-slate-600 hover:bg-slate-100/50'
            }`}
          >
            <div className={`h-8 w-8 rounded-xl ${group ? getGroupColor(group.name) : 'bg-slate-900'} flex items-center justify-center text-[12px] font-black text-white shadow-lg group-hover/group-collapsible:scale-110 group-hover/group-collapsible:rotate-3 transition-all duration-300`}>
              {group ? group.name[0].toUpperCase() : 'U'}
            </div>
            <span className={`font-bold tracking-tight ${isOver ? 'scale-105' : ''} transition-transform group-data-[collapsible=icon]:hidden`}>
              {group ? group.name : "Uncategorized"}
            </span>
            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-300 group-data-[state=open]/group-collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
          <SidebarMenuSub className="ml-4 border-l-2 border-slate-200/50 pl-4 py-2 space-y-1">
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
                  />
                ))
            ) : (
              <div className="text-[11px] font-medium text-slate-400 italic px-3 py-4 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                {isOver ? 'Drop here' : 'Empty group'}
              </div>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
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
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isNewGroupSheetOpen, setIsNewGroupSheetOpen] = useState(false);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [activeProject, setActiveProject] = useState(null);

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

  const fetchData = async () => {
    try {
      const params = {};
      if (user?.role) params.role = user.role;
      if (user?.roleId) params.role_id = user.roleId;
      
      const [projectsData, groupsData] = await Promise.all([
        projectService.getAllProjects(params),
        projectGroupService.getAllGroups()
      ]);
      setProjects(Array.isArray(projectsData) ? projectsData : projectsData.projects || []);
      setGroups(groupsData.groups || []);
    } catch (error) {
      console.error("Failed to fetch sidebar data:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCreateGroup = async (data) => {
    try {
      setIsSubmittingGroup(true);
      setGroupError("");
      await projectGroupService.createGroup(data);
      await fetchData();
      setIsNewGroupSheetOpen(false);
    } catch (err) {
      setGroupError(err.msg || "Failed to create group");
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

    // Optimistic UI update
    const updatedProjects = projects.map(p => 
      p.id.toString() === projectId ? { ...p, group_id: newGroupId } : p
    );
    setProjects(updatedProjects);

    try {
      await projectService.updateProject(projectId, { group_id: newGroupId });
    } catch (error) {
      console.error("Failed to update project group:", error);
      await fetchData(); // Rollback
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isRestrictedRole = user?.role === "team_leader" || user?.role === "worker";
  
  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Reports", url: "/reports", icon: BarChart3 },
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
      { title: "Attendance", url: "/attendance", icon: Calendar },
      { title: "Clients", url: "/clients", icon: Users },
      { title: "Projects", url: "/projects", icon: FolderKanban },
      { title: "Project Allocation", url: "/project-allocation", icon: UserPlus },
      { title: "Meetings", url: "/meetings", icon: MessageSquare },
      { title: "Permission Request", url: "/permission-request", icon: ShieldAlert },
    ]),
  ];

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b px-2 py-4 flex items-center justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex items-center gap-3 font-bold text-xl px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center w-full">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg transition-all duration-300">
              T
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
                            {[
                              { title: "Admin", url: "/admin", icon: UserCog },
                              { title: "Workers", url: "/workers", icon: HardHat },
                              { title: "Task Status", url: "/task-status", icon: ClipboardList },
                              { title: "Project Grouping", url: "/project-grouping", icon: LayoutGrid },
                            ].map((subItem) => {
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
                    </SidebarMenuItem>
                  )}

                  {/* Always show Project Groups section here */}
                  <div key="groups-section" className="mt-2 mb-4 group-data-[collapsible=icon]:mt-0">
                    <div className="px-4 py-2 mb-3 group-data-[collapsible=icon]:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => navigate("/tasks-dashboard")}
                            className={`p-1.5 rounded-md transition-all ${
                              location.pathname === "/tasks-dashboard" 
                                ? "bg-blue-100 text-blue-600" 
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            }`}
                            title="Task Dashboard"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                          </button>
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
                        />
                      );
                    })()}
                  </div>

                  {/* Render remaining menu items (exclude Groups since we show project groups) */}
                  {menuItems.filter(item => item.title !== "Dashboard" && item.title !== "Master" && item.title !== "Groups").map((item) => {
                    return (
                      <SidebarMenuItem key={item.title}>
                        {item.subItems ? (
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
                        ) : (
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
                        )}
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
                  <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white shadow-2xl ring-1 ring-slate-200 border-2 border-blue-500/20 scale-105 opacity-90 cursor-grabbing min-w-[200px]">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-50">
                      <Folder className="h-4.5 w-4.5 text-blue-500" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-900">
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
    </>
  );
}
