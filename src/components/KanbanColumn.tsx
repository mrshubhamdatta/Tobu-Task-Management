import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '../types';

interface KanbanColumnProps {
  key?: React.Key;
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskSelect?: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, onTaskUpdate, onTaskDelete, onTaskEdit, onTaskSelect }: KanbanColumnProps) {
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-[280px] sm:w-80 flex-shrink-0 flex flex-col max-h-full bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-300 opacity-50"
      >
        <div className="p-4 flex items-center justify-between mb-4 px-1">
          <h3 className="font-semibold text-slate-400">{title}</h3>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-[280px] sm:w-80 flex-shrink-0 flex flex-col max-h-full bg-slate-50/50 rounded-xl"
    >
      <div 
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-3 mb-2 cursor-grab touch-none group"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase">{title}</h3>
          <span className="bg-slate-200 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 px-2 pb-2 min-h-[150px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
              onEdit={onTaskEdit}
              onSelect={onTaskSelect}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
