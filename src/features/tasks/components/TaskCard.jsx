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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-white rounded-lg p-3 border border-slate-200 hover:border-blue-400 transition-all duration-200 cursor-pointer ${
        isDragging ? 'opacity-30 grayscale-[0.5]' : ''
      } ${isOverlay ? 'shadow-xl ring-1 ring-blue-500 scale-[1.02] cursor-grabbing' : 'shadow-sm'}`}
    >
      <div className="flex flex-col gap-2">
        {/* Title - Professional Typography */}
        <h3 className="text-[12.5px] font-semibold text-slate-800 leading-[1.4] tracking-tight group-hover:text-blue-600 transition-colors">
          {task.title}
        </h3>

        {/* Info Row: Assignee & Date */}
        <div className="flex items-center gap-3 mt-1">
          {/* Avatar Circle */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-black text-white shadow-sm ring-1 ring-white">
              {getInitials(task.assigned_to_name)}
            </div>
          </div>

          {/* Date with Icon */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="h-3 w-3" />
            <span className="text-[10px] font-bold tracking-tight">
              {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Starts Today'}
            </span>
          </div>

          {/* Time Estimate (Mock) */}
          <div className="flex items-center gap-1.5 text-slate-400 ml-auto">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-bold tracking-tight">4h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
