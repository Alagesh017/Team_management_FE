import React from "react";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "../../../../common/components/ui/input";
import { avatarColor, getMemberInitials } from "./constants";
import { Checkbox } from "../../../../common/components/ui/checkbox";

const BoardHeader = ({
  project,
  statuses,
  searchQuery,
  setSearchQuery,
  meMode,
  setMeMode,
  availableMembers,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/70 backdrop-blur shrink-0 md:px-5">
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 truncate">
              {project ? project.name : "Project Tasks"}
            </h1>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className="text-sm text-slate-400 font-medium">Board</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {statuses.reduce((acc, s) => acc + (s.tasks?.length || 0), 0)} tasks across{" "}
            {statuses.length} columns
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* search input - hidden on mobile */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-64 bg-slate-50/50 focus:bg-white transition-all"
          />
        </div>

        {/* me mode toggle */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3 md:pl-3">
          <label className="text-xs font-semibold text-slate-600 select-none cursor-pointer flex items-center gap-2">
            Me Mode
            <Checkbox
              checked={meMode}
              onCheckedChange={(checked) => setMeMode(checked)}
            />
          </label>
        </div>

        {/* member pile - hidden on mobile */}
        <div className="hidden md:flex -space-x-2">
          {availableMembers.slice(0, 5).map((m) => (
            <div
              key={m.user_id}
              title={`${m.first_name} ${m.last_name}`}
              className="h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow"
              style={{ backgroundColor: avatarColor(m.user_id) }}
            >
              {getMemberInitials(m)}
            </div>
          ))}
          {availableMembers.length > 5 && (
            <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
              +{availableMembers.length - 5}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;