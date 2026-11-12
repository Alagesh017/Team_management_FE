import React from "react";
import { getFullAvatarUrl } from "../../../core/utils/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../common/components/ui/tooltip";

function ReaderAvatar({ person, className = "h-7 w-7" }) {
  const url = getFullAvatarUrl(person?.avatar_url);
  const name =
    [person?.first_name, person?.last_name].filter(Boolean).join(" ") ||
    person?.email ||
    "User";
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${className} rounded-full border-2 border-white shadow-sm object-cover ring-1 ring-slate-200`}
      />
    );
  }
  const initial = (person?.first_name?.[0] || person?.email?.[0] || "?").toUpperCase();
  return (
    <div
      className={`${className} rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center border-2 border-white ring-1 ring-slate-200`}
    >
      {initial}
    </div>
  );
}

export default function LearnStackReaderRow({ readers = [], label = "Read by" }) {
  if (!readers.length) {
    return (
      <p className="text-xs text-slate-400">No views yet — open this guide to be the first.</p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label} <span className="text-slate-400">({readers.length})</span>
      </p>
      <TooltipProvider delayDuration={200}>
        <div className="flex flex-wrap items-center gap-1">
          {readers.map((r, idx) => {
            const key = `${r.role}-${r.role_id}-${idx}`;
            const name =
              [r.first_name, r.last_name].filter(Boolean).join(" ") || r.email || "User";
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <span className="inline-flex -ml-1 first:ml-0 hover:z-10 transition-transform hover:scale-110">
                    <ReaderAvatar person={r} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
