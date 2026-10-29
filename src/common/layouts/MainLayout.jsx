import React, { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/layout/AppSidebar";
import { Search, Bell, User, Settings, LogOut, Trash2, ShieldAlert, LayoutDashboard, Users, Briefcase, CheckSquare, ClipboardList, Calendar, Lock, UserCog, HardHat, LayoutGrid, Folder, FolderKanban, UserPlus, MessageSquare } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useAuth } from "../../features/auth/contexts/AuthContext";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { ProfileMenuContent } from "../../features/profile/components/ProfileMenuContent";
import { UserAvatar } from "../components/UserAvatar";
import { getFullAvatarUrl } from "../../core/utils/utils";
import { useProfile } from "../../features/profile/contexts/ProfileContext";
import { projectService } from "../../features/projects/services/projectService";
import { projectGroupService } from "../../features/projects/services/projectGroupService";

// Icon mapper for menu items
const iconMap = {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  ClipboardList,
  Calendar,
  Lock,
  UserCog,
  HardHat,
  LayoutGrid,
  Folder,
  FolderKanban,
  UserPlus,
  MessageSquare,
  ShieldAlert,
};

export function MainLayout({ children }) {
  const page = children ?? <Outlet />;
  const { logout, user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [projects, setProjects] = useState([]);

  // Fetch groups and projects for search
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, groupsData] = await Promise.all([
          projectService.getAllProjects(),
          projectGroupService.getAllGroups()
        ]);
        setProjects(Array.isArray(projectsData) ? projectsData : projectsData.projects || []);
        setGroups(groupsData.groups || []);
      } catch (error) {
        console.error("Failed to fetch search data:", error);
      }
    };
    fetchData();
  }, []);

  const isRestrictedRole = user?.role === "team_leader" || user?.role === "worker";

  // Define menu items (matching AppSidebar's structure exactly)
  const menuItems = useMemo(() => [
    { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard", type: "menu" },
    ...(isRestrictedRole ? [] : [
      { id: "admin", title: "Admin", url: "/admin", icon: "UserCog", type: "submenu", parent: "Master" },
      { id: "workers", title: "Workers", url: "/workers", icon: "HardHat", type: "submenu", parent: "Master" },
      { id: "task-status", title: "Task Status", url: "/task-status", icon: "ClipboardList", type: "submenu", parent: "Master" },
      { id: "project-grouping", title: "Project Grouping", url: "/project-grouping", icon: "LayoutGrid", type: "submenu", parent: "Master" },
      { id: "attendance", title: "Attendance", url: "/attendance", icon: "Calendar", type: "menu" },
      { id: "clients", title: "Clients", url: "/clients", icon: "Users", type: "menu" },
      { id: "projects-page", title: "Projects", url: "/projects", icon: "FolderKanban", type: "menu" },
      { id: "project-allocation", title: "Project Allocation", url: "/project-allocation", icon: "UserPlus", type: "menu" },
      { id: "meetings", title: "Meetings", url: "/meetings", icon: "MessageSquare", type: "menu" },
      { id: "permission-request", title: "Permission Request", url: "/permission-request", icon: "ShieldAlert", type: "menu" },
    ]),
  ], [isRestrictedRole]);

  // Combine all searchable items
  const allSearchItems = useMemo(() => {
    const items = [...menuItems];
    groups.forEach(group => {
      items.push({ id: `group-${group.id}`, title: group.name, type: "group", groupId: group.id });
    });
    projects.forEach(project => {
      items.push({ id: `project-${project.id}`, title: project.name, type: "project", url: `/tasks/project/${project.id}`, groupId: project.group_id });
    });
    return items;
  }, [menuItems, groups, projects]);

  // Filter search results
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allSearchItems.filter(item => 
      item.title.toLowerCase().includes(query)
    );
  }, [allSearchItems, searchQuery]);

  const getInitials = (email) => {
    if (!email) return "JD";
    const namePart = email.split("@")[0];
    return namePart.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleItemClick = (item) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    if (item.url) {
      navigate(item.url);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh flex flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-white z-50">
          <div className="flex items-center gap-4 flex-1">
            <SidebarTrigger className="-ml-1 text-slate-900 hover:bg-slate-100 transition-colors h-10 w-10" />
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <Input 
                placeholder="Search tasks, members, or projects..." 
                className="pl-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-slate-200 transition-all"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              />
              {/* Search dropdown */}
              {isSearchOpen && filteredResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 overflow-y-auto z-[1000]">
                  <div className="p-2">
                    {filteredResults.map((item) => {
                      const IconComponent = item.icon ? iconMap[item.icon] : (item.type === "project" ? Folder : FolderKanban);
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 text-left transition-colors"
                        >
                          {IconComponent && <IconComponent className="h-4 w-4 text-slate-500" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {item.title}
                            </p>
                            {item.type === "submenu" && (
                              <p className="text-xs text-slate-500">{item.parent}</p>
                            )}
                            {item.type === "project" && (
                              <p className="text-xs text-slate-500">Project</p>
                            )}
                            {item.type === "group" && (
                              <p className="text-xs text-slate-500">Group</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-500 relative" onClick={() => navigate('/404')}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border-2 border-violet-100 hover:border-violet-200 transition-all ring-offset-2 focus-visible:ring-violet-400">
                  <UserAvatar
                    url={profile?.avatar_url}
                    email={user?.email}
                    firstName={profile?.first_name}
                    lastName={profile?.last_name}
                    className="h-full w-full border-0 shadow-none"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-0 shadow-2xl border-slate-100 overflow-hidden">
                <ProfileMenuContent onNavigateAway={() => {}} />
                <DropdownMenuSeparator className="bg-slate-100 m-0" />
                <div className="p-2">
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-slate-500" />
                  <span className="font-bold text-sm">Log out</span>
                </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-y-auto bg-[#f4f7fb] px-3 py-2 md:px-4 md:py-3">
          {page}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
