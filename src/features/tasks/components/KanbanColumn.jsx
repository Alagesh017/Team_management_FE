import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { Plus, MoreHorizontal } from "lucide-react";
import TaskCard from "./TaskCard";

export default function KanbanColumn({ status, tasks, onAddTask }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status.id}`,
    data: {
      type: 'Column',
      statusId: status.id
    }
  });

  const getStatusColor = (status) => {
    const statusMap = {
      'TO DO': { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', header: '#F1F5F9', cardBg: '#F8FAFC' },
      'IN PROGRESS': { bg: '#FFFBEB', text: '#B45309', dot: '#F59E0B', header: '#FEF3C7', cardBg: '#FFFDF5' },
      'ON HOLD': { bg: '#FFF1F2', text: '#BE123C', dot: '#F43F5E', header: '#FFE4E6', cardBg: '#FFF5F6' },
      'CODE REVIEW': { bg: '#FAF5FF', text: '#7E22CE', dot: '#A855F7', header: '#F3E8FF', cardBg: '#FBF7FF' },
      'FUNCTIONAL': { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6', header: '#DBEAFE', cardBg: '#F5F9FF' },
      'COMPLETED': { bg: '#ECFDF5', text: '#047857', dot: '#10B981', header: '#D1FAE5', cardBg: '#F6FFFA' },
    };

    const base = statusMap[status.name.toUpperCase()] || { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', header: '#F1F5F9', cardBg: '#F8FAFC' };
    
    if (status.color) {
      return {
        bg: `${status.color}10`,
        text: status.color,
        dot: status.color,
        header: `${status.color}25`,
        cardBg: `${status.color}05`
      };
    }
    
    return base;
  };

  const colors = getStatusColor(status);

  return (
    <div 
      className="flex flex-col w-[300px] min-w-[300px] h-full rounded-xl overflow-hidden shadow-sm border border-slate-100/50"
      style={{ backgroundColor: colors.cardBg }}
    >
      {/* Column Header - Square-ish with color background */}
      <div 
        className="flex items-center justify-between px-3 py-2 shrink-0 border-b border-white/20"
        style={{ backgroundColor: colors.header }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div 
              className="h-4 w-4 rounded-full flex items-center justify-center border border-white/50"
              style={{ backgroundColor: colors.text }}
            >
              <Plus className="h-2.5 w-2.5 text-white stroke-[3px]" />
            </div>
            <h2 
              className="text-[12px] font-black uppercase tracking-wider"
              style={{ color: colors.text }}
            >
              {status.name}
            </h2>
          </div>
          <span className="text-[12px] font-bold opacity-40" style={{ color: colors.text }}>
            {tasks.length}
          </span>
        </div>
        
        <button className="p-1 hover:bg-black/5 rounded transition-colors">
          <MoreHorizontal className="h-4 w-4 opacity-40" style={{ color: colors.text }} />
        </button>
      </div>

      {/* Droppable Area */}
      <div 
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2.5 p-2.5 transition-all duration-300 ${
          isOver ? 'bg-black/5 ring-1 ring-black/5' : ''
        }`}
      >
        <SortableContext 
          items={tasks.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2.5 h-full overflow-y-auto scrollbar-hide pb-20">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            
            <button 
              onClick={onAddTask}
              className="flex items-center gap-2 px-1 py-1 text-slate-400 hover:text-slate-900 transition-colors mt-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="text-[12px] font-bold">Add Task</span>
            </button>
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
