import React from "react";
import { Label } from "../../../common/components/ui/label";
import { Badge } from "../../../common/components/ui/badge";
import { Calendar, Briefcase, User, Info, MessageSquare, Image as ImageIcon } from "lucide-react";
import { getFullAvatarUrl } from "../../../core/utils/utils";

const InfoItem = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`space-y-1.5 ${className}`}>
    <div className="flex items-center gap-2 text-slate-500">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-sm font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
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
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl border-2 border-slate-100 bg-slate-50 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
            {project.project_logo ? (
              <img src={getFullAvatarUrl(project.project_logo)} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-slate-900 flex items-center justify-center text-white text-xl font-bold">
                {project.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{project.name}</h2>
            <div className="flex items-center gap-2">
              {getStatusBadge(project.status)}
              <span className="text-xs text-slate-400 font-medium italic">
                Created on {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
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

      <div className="grid grid-cols-2 gap-6">
        <InfoItem 
          icon={User} 
          label="Client Name" 
          value={project.client_name} 
        />
        <InfoItem 
          icon={User} 
          label="Created By" 
          value={project.creator_email} 
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <div className="h-4 w-1 bg-slate-900 rounded-full" />
          <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Project Description</h3>
        </div>
        <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[100px]">
          {project.description || "No description provided."}
        </div>
      </div>

      {project.remark && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="h-4 w-1 bg-slate-200 rounded-full" />
            <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider">Remarks</h3>
          </div>
          <div className="flex items-start gap-3 text-sm text-slate-600 italic bg-slate-50/50 p-4 rounded-xl">
            <MessageSquare className="h-4 w-4 mt-0.5 text-slate-400" />
            {project.remark}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
