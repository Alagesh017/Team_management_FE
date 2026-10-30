import React, { useEffect, useState } from "react";
import { ChevronRight, History, Search, Calendar, Clock } from "lucide-react";
import { Input } from "../../../../common/components/ui/input";
import { Button } from "../../../../common/components/ui/button";
import { avatarColor, getMemberInitials } from "./constants";
import { Checkbox } from "../../../../common/components/ui/checkbox";
import { formatDate, getFullAvatarUrl } from "../../../../core/utils/utils";
import SprintStatusHistoryDialog from "./SprintStatusHistoryDialog";
import { isAdminRole } from "../../utils/projectPermissions";

function endOfDay(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatRemaining(endDateStr) {
  const end = endOfDay(endDateStr);
  if (!end) return null;
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "Sprint ended";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

const BoardHeader = ({
  project,
  sprint,
  statuses,
  searchQuery,
  setSearchQuery,
  meMode,
  setMeMode,
  availableMembers,
  userRole,
}) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [remaining, setRemaining] = useState("");
  const showHistory = Boolean(sprint?.id) && isAdminRole(userRole);

  useEffect(() => {
    if (!sprint?.end_date) {
      setRemaining("");
      return undefined;
    }
    const tick = () => setRemaining(formatRemaining(sprint.end_date) || "");
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [sprint?.end_date]);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/70 backdrop-blur shrink-0 lg:px-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 truncate">
              {project ? project.name : "Project Tasks"}
            </h1>
            {sprint && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-slate-700 truncate">
                  {sprint.sprint_name}
                </h2>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-slate-300 hidden lg:block shrink-0" />
            <span className="text-sm text-slate-400 font-medium hidden lg:block">Board</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {statuses.reduce((acc, s) => acc + (s.tasks?.length || 0), 0)} tasks across{" "}
            {statuses.length} columns
          </p>
          {sprint && (sprint.start_date || sprint.end_date) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-slate-600">
              {sprint.start_date && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  Start {formatDate(sprint.start_date)}
                </span>
              )}
              {sprint.end_date && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  End {formatDate(sprint.end_date)}
                </span>
              )}
              {remaining && (
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    remaining === "Sprint ended" ? "text-red-600" : "text-indigo-700"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {remaining}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {showHistory && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 bg-white text-slate-700 shadow-sm"
              title="Status change history (admins)"
              onClick={() => setHistoryOpen(true)}
            >
              <History className="h-4 w-4" />
            </Button>
            <SprintStatusHistoryDialog
              open={historyOpen}
              onOpenChange={setHistoryOpen}
              sprintId={sprint.id}
              sprintName={sprint.sprint_name}
            />
          </>
        )}
        <div className="relative hidden lg:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-64 bg-slate-50/50 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-3 lg:pl-3">
          <label className="text-xs font-semibold text-slate-600 select-none cursor-pointer flex items-center gap-2">
            Me Mode
            <Checkbox checked={meMode} onCheckedChange={(checked) => setMeMode(checked)} />
          </label>
        </div>

        <div className="hidden lg:flex -space-x-2">
          {availableMembers.slice(0, 5).map((m) => (
            <div
              key={m.user_id}
              title={`${m.first_name} ${m.last_name}`}
              className="h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow overflow-hidden"
              style={{ backgroundColor: avatarColor(m.user_id) }}
            >
              {m.avatar_url ? (
                <img
                  src={getFullAvatarUrl(m.avatar_url)}
                  alt={`${m.first_name} ${m.last_name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                getMemberInitials(m)
              )}
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
