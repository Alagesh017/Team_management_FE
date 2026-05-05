import React, { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/layout/AppSidebar";
import { Search, Bell, User, Settings, LogOut, Moon, Sun, Trash2, Shield } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

export function MainLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-4 flex-1">
            <SidebarTrigger className="-ml-1 text-slate-900 hover:bg-slate-100 transition-colors h-10 w-10" />
            <div className="relative w-full max-w-md group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <Input 
                placeholder="Search tasks, members, or projects..." 
                className="pl-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-slate-200 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-500 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border-2 border-slate-100 hover:border-slate-200 transition-all">
                  <div className="h-full w-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                    JD
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 shadow-2xl border-slate-100">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-slate-900">John Doe</p>
                    <p className="text-xs leading-none text-slate-500 font-medium">john.doe@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                
                <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="font-bold text-sm text-slate-700">My Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={toggleTheme}
                  className="flex items-center justify-between p-3 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Sun className="h-4 w-4 text-slate-500" /> : <Moon className="h-4 w-4 text-slate-500" />}
                    <span className="font-bold text-sm text-slate-700">Theme Toggle</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full transition-colors relative ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${isDarkMode ? 'right-1' : 'left-1'}`} />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors">
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span className="font-bold text-sm text-slate-700">Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-100" />
                
                <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  <span className="font-bold text-sm">Delete Account</span>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-slate-500" />
                  <span className="font-bold text-sm">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-auto bg-slate-50/50">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
