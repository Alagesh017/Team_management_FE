import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAllocations } from "../hooks/useAllocations";
import { useProjects } from "../../projects/hooks/useProjects";
import { Button } from "../../../common/components/ui/button";
import { 
  ChevronLeft, 
  Loader2, 
  Briefcase,
  AlertCircle,
  Users
} from "lucide-react";
import AllocationForm from "../components/AllocationForm";
import { Alert, AlertDescription, AlertTitle } from "../../../common/components/ui/alert";

const ProjectAllocationDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useProjects();
  const { allocations, addAllocation, updateAllocation, updateAllocationMembers, loading: allocationsLoading } = useAllocations();
  
  const [project, setProject] = useState(null);
  const [existingAllocation, setExistingAllocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (projects.length > 0) {
      const foundProject = projects.find(p => p.id.toString() === projectId);
      setProject(foundProject);
    }
  }, [projects, projectId]);

  useEffect(() => {
    if (allocations.length > 0) {
      const foundAllocation = allocations.find(a => a.project_id.toString() === projectId);
      setExistingAllocation(foundAllocation);
    }
  }, [allocations, projectId]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      // Get user data from localStorage
      let userData = null;
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          userData = JSON.parse(storedUser);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
      
      if (existingAllocation) {
        // Only update members
        await updateAllocationMembers(existingAllocation.id, data.members);
      } else {
        // Shell must exist, but if not we create it (fallback)
        await addAllocation({
          ...data,
          project_id: Number(projectId),
          role_id: userData?.roleId,
          role: userData?.role
        });
      }
      // Stay on page or show success message if needed
    } catch (err) {
      setError(err.msg || err.error || "Failed to save allocation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (projectsLoading || allocationsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading team details...</p>
      </div>
    );
  }

  if (!project || !existingAllocation) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Allocation Shell Found</AlertTitle>
          <AlertDescription>
            You must create the allocation (Project, Dates, Remark) on the main page first before managing the team hierarchy.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/project-allocation")} className="mt-4 bg-slate-900">
          Back to Allocations
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex flex-col h-[calc(100vh-80px)] bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b pb-3 md:pb-4 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/project-allocation")}
            className="rounded-full hover:bg-slate-100 h-8 w-8 md:h-10 md:w-10"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 truncate">
              <Users className="h-4 w-4 md:h-6 md:w-6 text-slate-900 shrink-0" />
              <span className="truncate">Manage Team: {project.name}</span>
            </h1>
            <p className="text-[10px] md:text-sm text-slate-500 font-medium truncate">
              Build and organize the team hierarchy for this project.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 min-h-0 w-full bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm p-2 md:p-4 overflow-hidden">
        <AllocationForm 
          mode="members"
          onSubmit={onSubmit} 
          onCancel={() => navigate("/project-allocation")}
          initialData={{
            ...existingAllocation,
            project_id: existingAllocation.project_id.toString()
          }} 
          submitting={submitting}
          error={error}
        />
      </div>
    </div>
  );
};

export default ProjectAllocationDetailPage;
