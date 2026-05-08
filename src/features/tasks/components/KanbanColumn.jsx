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
    id: status.id,
  });

  const getStatusColor = (status) => {
    if (status.color) {
      return { 
        bg: `bg-[${status.color}]/10`, 
        text: `text-[${status.color}]`, 
        dot: `bg-[${status.color}]`,
        border: `border-[${status.color}]/20`
      };
    }

    const statusMap = {
      'TO DO': { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' },
      'IN PROGRESS': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-100' },
      'ON HOLD': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-100' },
      'IN REVIEW': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-100' },
      'COMPLETED': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-100' },
      'CANCELLED': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-100' },
    };
    return statusMap[status.name.toUpperCase()] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' };
  };

  const colors = getStatusColor(status);

  return (
    <div className="flex flex-col w-[300px] min-w-[300px] h-full group">
      {/* Column Header - Professional & Dynamic */}
      <div className="flex items-center justify-between mb-4 px-1 shrink-0">
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${colors.bg} ${colors.border} transition-all duration-300`}>
          <div className={`w-2 h-2 rounded-full ${colors.dot} shadow-sm animate-pulse`} />
          <h2 className={`text-[12px] font-black uppercase tracking-widest ${colors.text}`}>
            {status.name}
          </h2>
          <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white/50 text-[10px] font-black text-slate-500 shadow-sm border border-white/50">
            {tasks.length}
          </div>
        </div>
        
        <button 
          onClick={onAddTask} 
          className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-slate-900 transition-all active:scale-95"
          title="Add Task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <div 
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-3 p-2 rounded-2xl transition-all duration-500 border-2 border-transparent ${
          isOver ? 'bg-slate-100/80 border-dashed border-slate-300 scale-[0.99]' : 'bg-transparent'
        }`}
      >
        <SortableContext 
          items={tasks.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3 h-full overflow-y-auto scrollbar-hide pb-20">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            
            {/* Contextual Empty State */}
            {tasks.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className={`h-10 w-10 rounded-full ${colors.bg} flex items-center justify-center mb-3`}>
                  <Plus className={`h-5 w-5 ${colors.text}`} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Drop here or <br/>
                  <span className="text-blue-500 cursor-pointer hover:underline" onClick={onAddTask}>add new task</span>
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
