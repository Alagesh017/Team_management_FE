import React, { useEffect, useState } from "react";
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
  ShieldAlert
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
import { projectService } from "../../../features/projects/services/projectService";
import { useAuth } from "../../../features/auth/contexts/AuthContext";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAllProjects();
        // Assuming data is an array of projects or has a projects property
        setProjects(Array.isArray(data) ? data : data.projects || []);
      } catch (error) {
        console.error("Failed to fetch projects for sidebar:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
      title: "Master",
      icon: Settings,
      subItems: [
        { title: "Admin", url: "/admin", icon: UserCog },
        { title: "Workers", url: "/workers", icon: HardHat },
        { title: "Task Status", url: "/task-status", icon: ClipboardList },
      ],
    },
    { title: "Attendance", url: "/attendance", icon: Calendar },
    { title: "Clients", url: "/clients", icon: Users },
    { title: "Projects", url: "/projects", icon: FolderKanban },
    { title: "Project Allocation", url: "/project-allocation", icon: UserPlus },
    {
      title: "Tasks",
      icon: CheckSquare,
      isProjectsSubmenu: true,
    },
    { title: "Meetings", url: "/meetings", icon: MessageSquare },
    { title: "Permission Request", url: "/permission-request", icon: ShieldAlert },
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
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {menuItems.map((item) => (
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
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={location.pathname === subItem.url}>
                                  <Link to={subItem.url}>
                                    {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : item.isProjectsSubmenu ? (
                      <Collapsible className="group/collapsible">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {projects.length > 0 ? (
                              projects.map((project) => (
                                <SidebarMenuSubItem key={project.id}>
                                  <SidebarMenuSubButton asChild isActive={location.pathname === `/tasks/project/${project.id}`}>
                                    <Link to={`/tasks/project/${project.id}`}>
                                      <span>{project.name}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))
                            ) : (
                              <SidebarMenuSubItem>
                                <span className="px-2 py-1.5 text-xs text-muted-foreground italic">No projects found</span>
                              </SidebarMenuSubItem>
                            )}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild tooltip={item.title} isActive={location.pathname === item.url}>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setIsLogoutDialogOpen(true)}
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
    </>
  );
}
