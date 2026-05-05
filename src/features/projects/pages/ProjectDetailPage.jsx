import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { Button } from "../../../common/components/ui/button";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  User, 
  MessageSquare, 
  Folder,
  Loader2,
  ExternalLink,
  Briefcase
} from "lucide-react";
import { getFullAvatarUrl } from "../../../core/utils/utils";
import { Badge } from "../../../common/components/ui/badge";

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById } = useProjects();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getProjectById(id);
        setProject(data.project);
      } catch (error) {
        console.error("Failed to fetch project details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, getProjectById]);

  const handleDownloadLogo = () => {
    if (!project?.project_logo) return;
    
    const logoUrl = getFullAvatarUrl(project.project_logo);
    const link = document.createElement("a");
    link.href = logoUrl;
    link.download = `${project.name.replace(/\s+/g, '_')}_logo`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { className: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Active" },
      on_hold: { className: "bg-amber-100 text-amber-700 border-amber-200", label: "On Hold" },
      completed: { className: "bg-blue-100 text-blue-700 border-blue-200", label: "Completed" },
      cancelled: { className: "bg-red-100 text-red-700 border-red-200", label: "Cancelled" },
    };
    const config = statusMap[status] || statusMap.active;
    return (
      <Badge variant="outline" className={`${config.className} font-bold px-3 py-1`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Project Details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center bg-white h-screen flex flex-col items-center justify-center gap-4">
        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
           <Folder className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Project Not Found</h2>
        <Button onClick={() => navigate("/projects")} variant="outline" className="font-bold">
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 space-y-8 max-w-6xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/projects")}
          className="group flex items-center gap-2 font-bold text-slate-600 hover:text-slate-900 transition-colors px-2 md:px-4"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="hidden md:inline">Back to Directory</span>
        </Button>
        
        <div className="flex items-center gap-3">
           {project.project_logo && (
             <Button 
               onClick={handleDownloadLogo}
               className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-lg shadow-slate-100 transition-all active:scale-95 px-3 md:px-6"
               title="Download Logo"
             >
               <Download className="h-5 w-5" />
               <span className="hidden md:inline">Download Logo</span>
             </Button>
           )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
        <div className="h-48 w-48 rounded-3xl border-4 border-slate-50 bg-white overflow-hidden shadow-2xl flex items-center justify-center mx-auto md:mx-0 group relative">
          {project.project_logo ? (
            <img 
              src={getFullAvatarUrl(project.project_logo)} 
              alt="Logo" 
              className="h-full w-full object-cover" 
            />
          ) : (
            <div className="h-full w-full bg-slate-900 flex items-center justify-center text-white text-5xl font-bold">
              {project.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="space-y-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center md:justify-start">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {project.name}
              </h1>
              <div>{getStatusBadge(project.status)}</div>
            </div>
            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
              <Calendar className="h-4 w-4" />
              Created on {new Date(project.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* Full Width Meta Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
               <Briefcase className="h-6 w-6 text-slate-900" />
            </div>
            <div className="min-w-0 flex-1">
               <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Client</p>
               <p className="text-base font-bold text-slate-900 truncate">
                  {project.client_name || "Internal Project"}
               </p>
            </div>
         </div>

         <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
               <Calendar className="h-6 w-6 text-slate-900" />
            </div>
            <div className="min-w-0 flex-1">
               <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Duration</p>
               <p className="text-base font-bold text-slate-900">
                  {project.start_date} — {project.end_date}
               </p>
            </div>
         </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t">
        <div className="lg:col-span-2 space-y-8">
           <section className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="h-6 w-1 bg-slate-900 rounded-full" />
                 <h2 className="text-lg font-bold text-slate-900">Project Overview</h2>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 min-h-[200px] text-slate-700 leading-relaxed shadow-inner">
                 {project.description || "No detailed description provided for this project."}
              </div>
           </section>

           {project.remark && (
             <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-500">
                   <MessageSquare className="h-5 w-5" />
                   <h2 className="text-lg font-bold">Admin Remarks</h2>
                </div>
                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 italic text-slate-600">
                   "{project.remark}"
                </div>
             </section>
           )}
        </div>

        <div className="space-y-8">
           <section className="space-y-4">
              <div className="flex items-center gap-2">
                 <h2 className="text-lg font-bold text-slate-900">Project Info</h2>
              </div>
              <div className="space-y-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Project ID</span>
                    <span className="text-sm font-bold text-slate-900">#{project.id}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 font-medium">Last Updated</span>
                    <span className="text-sm font-bold text-slate-900">Just now</span>
                 </div>
              </div>
           </section>

           <section className="bg-slate-900 p-6 rounded-3xl text-white space-y-4 shadow-xl">
              <h3 className="font-bold flex items-center gap-2">
                 <ExternalLink className="h-4 w-4" /> Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                 <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800 font-bold" onClick={() => navigate(`/tasks/project/${project.id}`)}>
                    View Project Tasks
                 </Button>
                 <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-slate-800 font-bold">
                    Manage Team
                 </Button>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
