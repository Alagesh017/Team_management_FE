import React from "react";
import { Briefcase, ChevronRight, Mail, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "./CircularProgress";
import { useProfile } from "../contexts/ProfileContext";
import { useAuth } from "../../auth/contexts/AuthContext";
import { UserAvatar } from "../../../common/components/UserAvatar";
import { getFullAvatarUrl } from "../../../core/utils/utils";

export function ProfileMenuContent({ onNavigateAway }) {
  const { profile, completion, allocations, roleLabel, openOnboarding } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const percent = completion?.percent ?? user?.completionPercent ?? 0;

  const goComplete = () => {
    onNavigateAway?.();
    openOnboarding();
  };

  return (
    <div className="p-1 w-80">
      <div className="rounded-xl border border-slate-100 bg-white p-4 mb-2 shadow-sm">
        <div className="flex gap-3">
          <UserAvatar
            url={profile?.avatar_url}
            email={profile?.email || user?.email}
            firstName={profile?.first_name}
            lastName={profile?.last_name}
            className="h-14 w-14 ring-2 ring-white shadow-md"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900 truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-slate-500 truncate">{profile?.email || user?.email}</p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">{roleLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={goComplete}
          className="mt-4 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-left transition-all hover:border-slate-300 hover:bg-white hover:shadow-md"
        >
          <CircularProgress value={percent} size={52} strokeWidth={5} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">Profile completion</p>
            <p className="text-xs text-slate-500">
              {percent >= 100 ? "All set!" : "Tap to complete remaining details"}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
        </button>
      </div>

      <div className="px-2 py-1 space-y-2 text-sm">
        {profile?.phone && (
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            {profile.phone}
          </div>
        )}
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          {profile?.email || user?.email}
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3 px-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1">
          <Briefcase className="h-3 w-3" />
          Project allocation
        </p>
        {allocations?.length ? (
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {allocations.map((a) => (
              <li
                key={`${a.project_id}-${a.allocation_id}`}
                className="rounded-lg bg-slate-50 px-3 py-2 text-xs"
              >
                <p className="font-semibold text-slate-800">{a.project_name}</p>
                <p className="text-slate-700 font-medium mt-0.5">{a.member_role}</p>
                {a.reports_to ? (
                  <p className="text-slate-500 mt-1">
                    Under{" "}
                    <span className="font-medium text-slate-700">
                      {a.reports_to.first_name} {a.reports_to.last_name}
                    </span>
                    {a.reports_to.display_role ? ` · ${a.reports_to.display_role}` : ""}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">No project allocations yet.</p>
        )}
      </div>

      <button
        type="button"
        className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        onClick={() => {
          onNavigateAway?.();
          navigate("/profile/complete");
        }}
      >
        <User className="h-4 w-4 text-slate-500" />
        Edit profile details
      </button>
    </div>
  );
}
