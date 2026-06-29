import React from "react";
import {
  Dialog,
  DialogContent,
} from "../../../common/components/ui/dialog";

const StatusBadge = ({ name, color, className = "h-24 w-24" }) => {
  return (
    <div 
      className={`${className} rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white`}
      style={{ backgroundColor: color || "#000000" }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
};

const TaskStatusDetails = ({ status, open, onOpenChange }) => {
  if (!status) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col">
          {/* Header Banner */}
          <div className="h-32 bg-slate-900 w-full relative">
            <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-3xl shadow-xl">
              <StatusBadge 
                name={status.name} 
                color={status.color} 
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="pt-16 pb-8 px-8 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {status.name}
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                  Task Status
                </span>
              </div>
              <p className="text-slate-500 font-medium uppercase tracking-tighter text-xs">
                Stage ID: #{status.id}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t pt-6 max-h-[400px] overflow-y-auto">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color Code</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full border border-slate-200" 
                    style={{ backgroundColor: status.color || "#000000" }} 
                  />
                  <p className="text-sm font-bold text-slate-900 font-mono uppercase">
                    {status.color || "#000000"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort Order</p>
                <p className="text-sm font-bold text-slate-900">{status.sort_order}</p>
              </div>

              <div className="col-span-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remark / Description</p>
                <p className="text-sm font-bold text-slate-900 leading-relaxed">
                  {status.remark || "No description provided for this status."}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Is Confidential</p>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${status.is_confidential ? 'bg-red-500' : 'bg-slate-300'}`} />
                  <p className="text-sm font-bold text-slate-900">
                    {status.is_confidential ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Is Backlog</p>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${status.is_backlog ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  <p className="text-sm font-bold text-slate-900">
                    {status.is_backlog ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Is Todo</p>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${status.is_todo ? 'bg-cyan-500' : 'bg-slate-300'}`} />
                  <p className="text-sm font-bold text-slate-900">
                    {status.is_todo ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Is In Progress</p>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${status.is_in_progress ? 'bg-yellow-500' : 'bg-slate-300'}`} />
                  <p className="text-sm font-bold text-slate-900">
                    {status.is_in_progress ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Is Completed</p>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${status.is_completed ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <p className="text-sm font-bold text-slate-900">
                    {status.is_completed ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="col-span-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created At</p>
                <p className="text-sm font-bold text-slate-900">
                  {status.created_at ? new Date(status.created_at).toLocaleString() : "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskStatusDetails;
