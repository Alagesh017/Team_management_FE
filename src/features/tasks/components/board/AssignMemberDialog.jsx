import React from "react";
import { Check } from "lucide-react";
import { Button } from "../../../../common/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../common/components/ui/dialog";
import { Input } from "../../../../common/components/ui/input";
import { avatarColor, getMemberInitials, getMemberKey } from "./constants";

const AssignMemberDialog = ({
  open,
  onOpenChange,
  filteredMembers,
  selectedMembers,
  memberSearch,
  setMemberSearch,
  onToggleMember,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-100">
          <DialogTitle className="text-base font-semibold text-slate-800">Assign people</DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3 border-b border-slate-100">
          <Input
            placeholder="Search by name or email…"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            className="h-9 text-sm border-slate-200 focus-visible:ring-indigo-500"
          />
        </div>

        <div className="max-h-64 overflow-y-auto px-2 py-2 space-y-0.5">
          {filteredMembers.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">No members found</p>
          ) : (
            filteredMembers.map((member) => {
              const key = getMemberKey(member);
              const selected = selectedMembers.includes(key);
              return (
                <div
                  key={key}
                  onClick={() => onToggleMember(member)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    selected ? "bg-indigo-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
                    style={{ backgroundColor: avatarColor(member.user_id) }}
                  >
                    {getMemberInitials(member)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${selected ? "text-indigo-700" : "text-slate-800"}`}>
                      {member.first_name} {member.last_name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          member.type === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {member.type === "admin" ? "Admin" : "Worker"}
                      </span>
                      <span className="text-xs text-slate-400 truncate">{member.email}</span>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selected ? "bg-indigo-600 border-indigo-600" : "border-slate-200 bg-white"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-400">
            {selectedMembers.length > 0 ? `${selectedMembers.length} selected` : "No one selected"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={onClose}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignMemberDialog;