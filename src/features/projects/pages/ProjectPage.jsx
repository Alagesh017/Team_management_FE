import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { Button } from "../../../common/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../common/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../common/components/ui/dropdown-menu";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Eye, 
  Search,
  LayoutDashboard,
  Calendar
} from "lucide-react";
import { Input } from "../../../common/components/ui/input";
import ProjectForm from "../components/ProjectForm";
import ProjectDetails from "../components/ProjectDetails";
import FolderIcon from "../components/FolderIcon";
import { ContextMenu, ContextMenuItem } from "../../../common/components/ui/context-menu";
import { formatDate } from "../../../core/utils/utils";
import { useToast } from "../../../common/hooks/use-toast";

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleFolderClick = (e) => {
    // Only navigate if it's a left click
    if (e.button === 0) {
      navigate(`/projects/${project.id}`);
    }
  };

  const contextContent = (
    <div className="flex flex-col">
      <ContextMenuItem onClick={() => navigate(`/projects/${project.id}`)} className="gap-3">
        <Eye className="h-4 w-4 text-slate-500" /> 
        <span>View Details</span>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => onEdit(project)} className="gap-3">
        <Pencil className="h-4 w-4 text-slate-500" />
        <span>Edit Project</span>
      </ContextMenuItem>
      <div className="h-px bg-slate-100 my-1 mx-1" />
      <ContextMenuItem onClick={() => onDelete(project.id)} className="gap-3" destructive>
        <Trash2 className="h-4 w-4" />
        <span>Delete Project</span>
      </ContextMenuItem>
    </div>
  );

  return (
    <ContextMenu content={contextContent}>
      <div 
        className="group flex flex-col items-center gap-2 cursor-pointer outline-none"
        onClick={handleFolderClick}
      >
        <div className="relative transition-all duration-300 group-hover:scale-105 active:scale-95 group-hover:-translate-y-1">
          <FolderIcon 
            className="h-24 w-32 md:h-28 md:w-36" 
            previewUrl={project.project_logo}
          />
        </div>

        <div className="w-full text-center max-w-[140px] mt-1">
          <span 
            className="text-[13px] font-semibold text-slate-700 leading-tight line-clamp-1 break-all transition-colors group-hover:text-slate-900"
            title={project.name}
          >
            {project.name}
          </span>
        </div>
      </div>
    </ContextMenu>
  );
};

const ProjectPage = () => {
  const { 
    projects, 
    loading, 
    addProject, 
    updateProject, 
    deleteProject,
    fetchProjects,
    fetchGroups
  } = useProjects();

  useEffect(() => {
    fetchProjects();
    fetchGroups();
  }, [fetchProjects, fetchGroups]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsSheetOpen(true);
  };

  const handleDelete = (id) => {
    setProjectToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete);
        toast({
          title: "Success",
          description: "Project deleted successfully",
          variant: "success",
        });
        setIsDeleteDialogOpen(false);
        setProjectToDelete(null);
      } catch (err) {
        console.error("Delete failed:", err);
        toast({
          title: "Error",
          description: err.msg || err.error || err.message || "Failed to delete project",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
        toast({
          title: "Success",
          description: "Project updated successfully",
          variant: "success",
        });
      } else {
        await addProject(data);
        toast({
          title: "Success",
          description: "Project created successfully",
          variant: "success",
        });
      }
      
      setIsSheetOpen(false);
      setEditingProject(null);
    } catch (err) {
      const errorMsg = err.msg || err.error || err.message || "Operation failed. Please try again.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-8 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between gap-4 border-b pb-6">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 truncate">
            <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6 text-slate-900 shrink-0" />
            Projects
          </h1>
          <p className="text-sm text-slate-500 font-medium hidden md:block">Browse and manage your project directories.</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-48 lg:w-64 group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <Input 
              placeholder="Search folders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-300 transition-all"
            />
          </div>
          <Button 
            onClick={() => {
              setEditingProject(null);
              setIsSheetOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 px-6 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> New Folder
          </Button>
        </div>
      </div>

      {/* Grid View (File Management Style) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading directories...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-8 gap-y-12">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center gap-6">
          <div className="h-20 w-24 relative">
             <FolderIcon className="w-full h-full opacity-20" />
          </div>
          <div className="space-y-2 max-w-xs">
            <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
            <p className="text-slate-500 text-xs">
              {searchQuery ? "Try adjusting your search query." : "Create your first project folder to get started."}
            </p>
          </div>
          {!searchQuery && (
            <Button 
              onClick={() => setIsSheetOpen(true)}
              variant="outline"
              className="font-bold border-slate-200 hover:bg-white"
            >
              Create Project
            </Button>
          )}
        </div>
      )}

      {/* Sheet for Add/Edit */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[450px] md:max-w-[500px] lg:max-w-[540px] border-l shadow-2xl p-0 flex flex-col">
          <SheetHeader className="border-b pb-6 px-6 pt-6">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              {editingProject ? (
                <><Pencil className="h-5 w-5" /> Edit Project</>
              ) : (
                <><Plus className="h-5 w-5" /> Create New Project</>
              )}
            </SheetTitle>
            <SheetDescription className="font-medium">
              {editingProject 
                ? `Update details for project "${editingProject.name}"` 
                : "Fill in the details below to create a new project for your team."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6">
            <ProjectForm 
              onSubmit={onSubmit} 
              initialData={editingProject} 
              submitting={submitting}
              error={error}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Project?"
        description="This action cannot be undone. This will permanently delete the project and all associated tasks."
        confirmText="Delete Project"
        variant="destructive"
      />
    </div>
  );
};

export default ProjectPage;
