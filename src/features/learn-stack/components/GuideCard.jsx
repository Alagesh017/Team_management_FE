import React from "react";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { Badge } from "../../../common/components/ui/badge";
import { cn } from "../../../core/utils/utils";

export default function GuideCard({ card, onOpen, className }) {
  const authorName =
    [card.author?.first_name, card.author?.last_name].filter(Boolean).join(" ") || "—";

  return (
    <button
      type="button"
      onClick={() => onOpen(card.id)}
      className={cn(
        "flex h-full w-full flex-col rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm",
        "transition hover:border-violet-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
        className
      )}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="h-5 bg-violet-50 text-[10px] font-normal text-violet-800">
          {card.domain_name}
        </Badge>
        <Badge variant="outline" className="h-5 text-[10px] font-normal text-slate-600">
          {card.technology_name}
        </Badge>
      </div>
      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{card.title}</h3>
      {card.description ? (
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">{card.description}</p>
      ) : (
        <div className="flex-1" />
      )}
      <div className="mt-3 flex items-end justify-between gap-2 border-t border-slate-100 pt-2">
        <span className="truncate text-[11px] text-slate-500">{authorName}</span>
        <div className="flex shrink-0 items-center gap-2 text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-0.5">
            <Heart className="h-3 w-3" />
            {card.like_count}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <MessageCircle className="h-3 w-3" />
            {card.comment_count}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {card.view_count}
          </span>
        </div>
      </div>
    </button>
  );
}
