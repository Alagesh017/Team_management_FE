import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpCircle,
  MoreHorizontal,
  GripVertical
} from "lucide-react";
import { Badge } from "../../../common/components/ui/badge";

export default function TaskCard({ task, isOverlay }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500'];
    let hash = 0;
    if (!name) return colors[0];
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-white rounded-lg p-3.5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer flex flex-col gap-3 ${
        isDragging ? 'opacity-30 grayscale-[0.5]' : ''
      } ${isOverlay ? 'shadow-xl ring-2 ring-indigo-500 scale-[1.02] cursor-grabbing' : ''}`}
    >
      {/* 1. Task Title */}
      <h3 className="text-[13px] font-bold text-slate-800 leading-snug tracking-tight group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h3>

      {/* 2. Task Meta Info */}
      <div className="flex flex-wrap items-center gap-2 mt-auto">
        {/* Assignee Avatar */}
        <div 
          className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm ring-1 ring-white ${getAvatarColor(task.assigned_to_name)}`}
          title={task.assigned_to_name || "Unassigned"}
        >
          {getInitials(task.assigned_to_name)}
        </div>

        {/* Date Badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-slate-500 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
          <Calendar className="h-3 w-3" />
          <span className="text-[10px] font-black tracking-tight whitespace-nowrap">
            {task.due_date ? `Started ${new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Starts Today'}
          </span>
        </div>

        {/* Hour Badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-slate-500 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
          <Clock className="h-3 w-3" />
          <span className="text-[10px] font-black tracking-tight">{task.estimated_hours || '4'}h</span>
        </div>

        {/* Extra info badge (Optional) */}
        {task.remark && (
          <div className="ml-auto text-slate-300">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    </div>
  );
}
