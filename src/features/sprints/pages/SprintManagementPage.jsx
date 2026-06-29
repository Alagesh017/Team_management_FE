import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Calendar, MoreHorizontal, Play, CheckCircle } from "lucide-react";
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
  DropdownMenuTrigger,
} from "../../../common/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../common/components/ui/table";
import { Badge } from "../../../common/components/ui/badge";
import { Input } from "../../../common/components/ui/input";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import SprintForm from "../components/SprintForm";
import StartSprintConfirmDialog from "../components/StartSprintConfirmDialog";
import { sprintService } from "../services/sprintService";
import { taskService } from "../../tasks/services/taskService";
import { projectService } from "../../projects/services/projectService";
import { useProjects } from "../../projects/contexts/ProjectContext";
import { useToast } from "../../../common/hooks/use-toast";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";
    case "COMPLETED":
      return "bg-blue-100 text-blue-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const SprintManagementPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchProjects } = useProjects();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New state for start sprint with move
  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);
  const [sprintToStart, setSprintToStart] = useState(null);
  const [currentActiveSprint, setCurrentActiveSprint] = useState(null);
  const [tasksToMove, setTasksToMove] = useState([]);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectData, sprintsData] = await Promise.all([
        projectService.getProjectById(projectId),
        sprintService.getAllSprints({ project_id: projectId }),
      ]);
      setProject(projectData.project || projectData);
      setSprints(sprintsData.sprints || sprintsData || []);
      await fetchProjects();
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast({
        title: "Error",
        description: "Failed to load sprints",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const getCurrentActiveSprint = () => {
    return sprints.find(
      s => s.sprint_status === 1 || s.status === "ACTIVE"
    );
  };

  const handleCreate = () => {
    setEditingSprint(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (sprint) => {
    setEditingSprint(sprint);
    setIsSheetOpen(true);
  };

  const handleDelete = (sprint) => {
    setSprintToDelete(sprint);
    setIsDeleteDialogOpen(true);
  };

  const handleStartSprint = async (sprint) => {
    // Check if there's an active sprint already
    const activeSprint = getCurrentActiveSprint();
    if (activeSprint) {
      // Show confirm dialog
      setSprintToStart(sprint);
      setCurrentActiveSprint(activeSprint);
      try {
        // Load tasks from active sprint
        const tasksData = await taskService.getTasksBySprintId(activeSprint.id);
        const allTasks = tasksData.tasks || [];
        // Filter out completed tasks
        const nonCompletedTasks = allTasks.filter(task => {
          // For now, just show all tasks (we'll filter on backend too)
          return true;
        });
        setTasksToMove(nonCompletedTasks);
      } catch (err) {
        console.error("Failed to load tasks:", err);
        setTasksToMove([]);
      }
      setIsStartConfirmOpen(true);
      return;
    }
    
    // No active sprint, just start normally
    try {
      await sprintService.startSprint(sprint.id);
      toast({
        title: "Success",
        description: "Sprint started successfully",
        variant: "success",
      });
      await fetchData();
      await fetchProjects();
    } catch (err) {
      console.error("Start sprint failed:", err);
      toast({
        title: "Error",
        description: err.msg || err.error || err.message || "Failed to start sprint",
        variant: "destructive",
      });
    }
  };

  const handleConfirmStartSprint = async () => {
    if (!sprintToStart || !currentActiveSprint) return;
    
    try {
      setIsSubmittingMove(true);
      await sprintService.startSprintWithMove(
        sprintToStart.id, 
        currentActiveSprint.id
      );
      toast({
        title: "Success",
        description: "Sprint started, tasks moved successfully",
        variant: "success",
      });
      setIsStartConfirmOpen(false);
      await fetchData();
      await fetchProjects();
    } catch (err) {
      console.error("Start sprint with move failed:", err);
      toast({
        title: "Error",
        description: err.msg || err.error || err.message || "Failed to start sprint",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingMove(false);
    }
  };

  const handleEndSprint = async (sprint) => {
    try {
      await sprintService.endSprint(sprint.id);
      toast({
        title: "Success",
        description: "Sprint ended successfully",
        variant: "success",
      });
      await fetchData();
      await fetchProjects();
    } catch (err) {
      console.error("End sprint failed:", err);
      toast({
        title: "Error",
        description: err.msg || err.error || err.message || "Failed to end sprint",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (sprintToDelete) {
      try {
        await sprintService.deleteSprint(sprintToDelete.id);
        toast({
          title: "Success",
          description: "Sprint deleted successfully",
          variant: "success",
        });
        await fetchData();
        await fetchProjects();
        setIsDeleteDialogOpen(false);
        setSprintToDelete(null);
      } catch (err) {
        console.error("Delete failed:", err);
        toast({
          title: "Error",
          description: err.msg || err.error || err.message || "Failed to delete sprint",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingSprint) {
        await sprintService.updateSprint(editingSprint.id, data);
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
      await fetchData();
      await fetchProjects();
      setIsSheetOpen(false);
      setEditingSprint(null);
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

  const filteredSprints = sprints.filter(s =>
    s.sprint_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading sprints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between gap-4 border-b pb-6">
        <div className="min-w-0 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-0 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 truncate">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-slate-900 shrink-0" />
              Sprint Management
            </h1>
            <p className="text-sm text-slate-500 font-medium hidden md:block">
              Manage sprints for project: {project?.name || "Project"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-48 lg:w-64 group hidden sm:block">
            <Input
              placeholder="Search sprints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-300 transition-all"
            />
          </div>
          <Button
            onClick={handleCreate}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 px-6 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> New Sprint
          </Button>
        </div>
      </div>

      {/* Table View */}
      {filteredSprints.length > 0 ? (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sprint Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSprints.map((sprint) => (
                <TableRow key={sprint.id}>
                  <TableCell className="font-medium">{sprint.sprint_name}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(sprint.status)}>
                      {sprint.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(sprint.start_date)}</TableCell>
                  <TableCell>{formatDate(sprint.end_date)}</TableCell>
                  <TableCell>{sprint.task_count || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Start Button */}
                      {(sprint.sprint_status === 0 || sprint.status === "PLANNED") && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStartSprint(sprint)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Play className="h-3.5 w-3.5 mr-1.5" />
                          Start
                        </Button>
                      )}
                      {/* End Button - only show if no non-completed tasks */}
                      {(sprint.sprint_status === 1 || sprint.status === "ACTIVE") && !sprint.has_non_completed_tasks && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEndSprint(sprint)}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          End
                        </Button>
                      )}
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sprint)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {/* Delete Button - only show if no tasks */}
                      {(sprint.task_count === 0 || sprint.task_count === undefined || sprint.task_count === null) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(sprint)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center gap-6">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
            <Calendar className="h-10 w-10 text-slate-300" />
          </div>
          <div className="space-y-2 max-w-xs">
            <h3 className="text-lg font-bold text-slate-900">No sprints found</h3>
            <p className="text-slate-500 text-xs">
              {searchQuery ? "Try adjusting your search query." : "Create your first sprint to get started."}
            </p>
          </div>
          {!searchQuery && (
            <Button
              onClick={handleCreate}
              variant="outline"
              className="font-bold border-slate-200 hover:bg-white"
            >
              Create Sprint
            </Button>
          )}
        </div>
      )}

      {/* Sheet for Add/Edit */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[450px] md:max-w-[500px] lg:max-w-[540px] border-l shadow-2xl p-0 flex flex-col">
          <SheetHeader className="border-b pb-6 px-6 pt-6">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              {editingSprint ? (
                <><Pencil className="h-5 w-5" /> Edit Sprint</>
              ) : (
                <><Plus className="h-5 w-5" /> Create New Sprint</>
              )}
            </SheetTitle>
            <SheetDescription className="font-medium">
              {editingSprint
                ? `Update details for sprint "${editingSprint.sprint_name}"`
                : "Fill in the details below to create a new sprint for your project."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6">
            <SprintForm
              onSubmit={onSubmit}
              initialData={editingSprint}
              submitting={submitting}
              error={error}
              projectId={projectId}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Sprint?"
        description="This action cannot be undone. This will permanently delete the sprint and all associated tasks."
        confirmText="Delete Sprint"
        variant="destructive"
      />
      
      <StartSprintConfirmDialog
        isOpen={isStartConfirmOpen}
        onClose={() => setIsStartConfirmOpen(false)}
        currentActiveSprint={currentActiveSprint}
        newSprint={sprintToStart}
        tasks={tasksToMove}
        onConfirm={handleConfirmStartSprint}
        isLoading={isSubmittingMove}
      />
    </div>
  );
};

export default SprintManagementPage;
