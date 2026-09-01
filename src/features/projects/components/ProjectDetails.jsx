import React from "react";
import { Label } from "../../../common/components/ui/label";
import { Badge } from "../../../common/components/ui/badge";
import { Calendar, Briefcase, User, Info, MessageSquare, Image as ImageIcon, LayoutGrid } from "lucide-react";
import { getFullAvatarUrl } from "../../../core/utils/utils";

const InfoItem = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <div className="flex items-center gap-2 text-slate-500">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-xs font-semibold text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-100">
      {value || <span className="text-slate-400 italic font-normal">Not provided</span>}
    </div>
  </div>
);

const ProjectDetails = ({ project }) => {
  if (!project) return null;

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { className: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Active" },
      on_hold: { className: "bg-amber-100 text-amber-700 border-amber-200", label: "On Hold" },
      completed: { className: "bg-blue-100 text-blue-700 border-blue-200", label: "Completed" },
      cancelled: { className: "bg-red-100 text-red-700 border-red-200", label: "Cancelled" },
    };
    const config = statusMap[status] || statusMap.active;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Get created by display name
  const createdByDisplay = project.created_by_person?.name || project.created_by_person?.email || "Not available";

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg border-2 border-slate-100 bg-slate-50 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
            {project.project_logo ? (
              <img src={getFullAvatarUrl(project.project_logo)} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-slate-900 flex items-center justify-center text-white text-lg font-bold">
                {project.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">{project.name}</h2>
            <div className="flex items-center gap-2">
              {getStatusBadge(project.status)}
              <span className="text-[10px] text-slate-400 font-medium italic">
                Created on {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoItem 
          icon={Calendar} 
          label="Start Date" 
          value={project.start_date} 
        />
        <InfoItem 
          icon={Calendar} 
          label="End Date" 
          value={project.end_date} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoItem 
          icon={User} 
          label="Client Name" 
          value={project.client_name} 
        />
        <InfoItem 
          icon={LayoutGrid} 
          label="Project Group" 
          value={project.group_name} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoItem 
          icon={User} 
          label="Created By" 
          value={createdByDisplay} 
        />
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500">
              <Info className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Project Flags</span>
            </div>
            <div className="flex gap-1.5 flex-wrap bg-slate-50 p-2 rounded-lg border border-slate-100">
              {project.by_tl_managed ? (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">By TL Managed</Badge>
              ) : null}
              {project.team_managed ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">Team Managed</Badge>
              ) : null}
              {project.company_managed ? (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">Company Managed</Badge>
              ) : null}
              {!project.by_tl_managed && !project.team_managed && !project.company_managed ? (
                <span className="text-slate-400 italic font-normal text-[10px]">No flags set</span>
              ) : null}
            </div>
          </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <div className="h-3 w-1 bg-slate-900 rounded-full" />
          <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Project Description</h3>
        </div>
        <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[80px]">
          {project.description || "No description provided."}
        </div>
      </div>

      {project.remark && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="h-3 w-1 bg-slate-200 rounded-full" />
            <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Remarks</h3>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-600 italic bg-slate-50/50 p-3 rounded-lg">
            <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-slate-400" />
            {project.remark}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
