import React from "react";
import {
  Dialog,
  DialogContent,
} from "../../../common/components/ui/dialog";

const ClientAvatar = ({ name, className = "h-24 w-24" }) => {
  const initial = (name?.[0] || "?").toUpperCase();
  return (
    <div className={`${className} rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg`}>
      {initial}
    </div>
  );
};

const ClientDetails = ({ client, open, onOpenChange }) => {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col">
          <div className="h-32 bg-slate-900 w-full relative">
            <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-3xl shadow-xl">
              <ClientAvatar name={client.name} />
            </div>
          </div>
          <div className="pt-16 pb-8 px-8 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {client.name}
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                  Client
                </span>
              </div>
              <p className="text-slate-500 font-medium">{client.email || "No email provided"}</p>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t pt-6 max-h-[400px] overflow-y-auto">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</p>
                <p className="text-sm font-bold text-slate-900">{client.company || "Not set"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-bold text-slate-900">{client.phone || "Not provided"}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
                <p className="text-sm font-bold text-slate-900 leading-relaxed">{client.address || "Not set"}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remark / Notes</p>
                <p className="text-sm font-bold text-slate-900 leading-relaxed">{client.remark || "No additional notes."}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created At</p>
                <p className="text-sm font-bold text-slate-900">
                  {client.created_at ? new Date(client.created_at).toLocaleString() : "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetails;
