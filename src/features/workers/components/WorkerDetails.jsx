import React from "react";
import { Button } from "../../../common/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "../../../common/components/ui/dialog";
import { Link as LinkIcon, Globe } from "lucide-react";
import { getFullAvatarUrl } from "../../../core/utils/utils";

const UserAvatar = ({ url, email, firstName, className = "h-10 w-10" }) => {
  const fullUrl = getFullAvatarUrl(url);
  if (fullUrl) {
    return (
      <img 
        src={fullUrl}
        alt="Avatar" 
        className={`${className} rounded-full border-2 border-slate-100 shadow-sm object-cover`} 
      />
    );
  }

  const initial = (firstName?.[0] || email?.[0] || "?").toUpperCase();
  return (
    <div className={`${className} rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm border-2 border-slate-100 shadow-sm`}>
      {initial}
    </div>
  );
};

const WorkerDetails = ({ worker, open, onOpenChange }) => {
  if (!worker) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col">
          <div className="h-32 bg-slate-900 w-full relative">
            <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-3xl shadow-xl">
              <UserAvatar 
                url={worker.avatar_url} 
                email={worker.email} 
                firstName={worker.first_name} 
                className="h-24 w-24 rounded-2xl"
              />
            </div>
          </div>
          <div className="pt-16 pb-8 px-8 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {`${worker.first_name} ${worker.last_name}`}
                </h2>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${worker.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {worker.status}
                </span>
              </div>
              <p className="text-slate-500 font-medium">{worker.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t pt-6 max-h-[400px] overflow-y-auto">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation</p>
                <p className="text-sm font-bold text-slate-900">{worker.job_title || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</p>
                <p className="text-sm font-bold text-slate-900">{worker.department || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</p>
                <p className="text-sm font-bold text-slate-900">
                  {worker.is_tl ? "Team Leader" : "Worker"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employment</p>
                <p className="text-sm font-bold text-slate-900">{worker.employment_type || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-bold text-slate-900">{worker.phone || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Mode</p>
                <p className="text-sm font-bold text-slate-900">{worker.work_mode || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joining Date</p>
                <p className="text-sm font-bold text-slate-900">{worker.joining_date || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                <p className="text-sm font-bold text-slate-900">{worker.experience_years ? `${worker.experience_years} Years` : "Not provided"}</p>
              </div>
              
              <div className="col-span-2 flex gap-4">
                {worker.linkedin_url && (
                  <a href={worker.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                )}
                {worker.github_url && (
                      <a href={worker.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:underline">
                        <LinkIcon className="h-3 w-3" /> Github
                      </a>
                    )}
                {worker.portfolio_url && (
                  <a href={worker.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline">
                    <Globe className="h-3 w-3" /> Portfolio
                  </a>
                )}
              </div>

              <div className="col-span-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Address</p>
                <p className="text-sm font-bold text-slate-900">
                  {[worker.address_line1, worker.address_line2, worker.city, worker.state, worker.country, worker.pincode].filter(Boolean).join(", ") || "Not provided"}
                </p>
              </div>
              {worker.remark && (
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarks</p>
                  <p className="text-sm text-slate-600">{worker.remark}</p>
                </div>
              )}
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="font-bold">Close Details</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkerDetails;
