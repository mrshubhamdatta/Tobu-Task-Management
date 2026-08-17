import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MoreVertical, Edit2 } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { currentUser } from '../data';

interface TaskCardProps {
  key?: React.Key;
  task: Task;
  isOverlay?: boolean;
  onUpdate?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onSelect?: (task: Task) => void;
}

export function TaskCard({ task, isOverlay, onUpdate, onDelete, onEdit, onSelect }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!task.deadline) {
      setTimeLeftStr('');
      return;
    }

    const startTime = task.createdAtTimestamp || Date.now();
    const { value, unit } = task.deadline;
    
    const durationMs = 
      unit === 'days' ? value * 24 * 60 * 60 * 1000 :
      unit === 'hours' ? value * 60 * 60 * 1000 :
      value * 60 * 1000;
    
    const updateTimer = () => {
      if (task.status === 'done') {
        setTimeLeftStr('Completed');
        return;
      }

      const now = Date.now();
      const totalPaused = (task.totalPausedMs || 0) + (task.status === 'review' && task.lastPausedAt ? now - task.lastPausedAt : 0);
      const targetTime = startTime + durationMs + totalPaused;
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeftStr('Overdue');
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const m = Math.floor(totalSeconds / 60) % 60;
      const h = Math.floor(totalSeconds / 3600) % 24;
      const d = Math.floor(totalSeconds / 86400);
      const s = totalSeconds % 60;

      let timeStr = '';
      if (d > 0) {
        timeStr = `${d}d ${h}h ${m}m remaining`;
      } else if (h > 0) {
        timeStr = `${h}h ${m}m ${s}s remaining`;
      } else {
        timeStr = `${m}m ${s}s remaining`;
      }

      if (task.status === 'review') {
        setTimeLeftStr(`Paused (${timeStr})`);
      } else {
        setTimeLeftStr(timeStr);
      }
    };

    updateTimer();
    
    if (task.status !== 'done' && task.status !== 'review') {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [task.deadline, task.createdAtTimestamp, task.status, task.totalPausedMs, task.lastPausedAt]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-32 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect?.(task)}
      className={cn(
        "bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md cursor-grab touch-none",
        isDragging && "opacity-50",
        isOverlay && "shadow-xl rotate-2 cursor-grabbing"
      )}
    >
      <div className="flex items-start justify-end mb-2">
        <div className="relative" ref={menuRef}>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="text-slate-400 hover:text-slate-600 -mr-1 -mt-1 p-1 rounded-md hover:bg-slate-50 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-sm">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</div>
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onUpdate?.({ ...task, priority: 'Casual' }); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700"
              >
                Casual
              </button>
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onUpdate?.({ ...task, priority: 'Urgent' }); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-rose-600"
              >
                Urgent
              </button>
              {currentUser.role === 'Admin' && (
                <>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onEdit?.(task); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-indigo-600 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Task
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {task.priority && (
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit mb-2 ${
          task.priority === 'Urgent' 
            ? 'bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.5)]' 
            : 'bg-teal-400 text-slate-900 shadow-[0_0_8px_rgba(45,212,191,0.5)]'
        }`}>
          {task.priority}
        </div>
      )}

      <h4 className="font-medium text-slate-900 text-sm mb-3 line-clamp-2">{task.title}</h4>
      
      {task.deadline && (
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md w-fit mb-3 ${
          timeLeftStr === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
          timeLeftStr.startsWith('Paused') ? 'bg-amber-50 text-amber-600' :
          timeLeftStr === 'Overdue' ? 'bg-red-50 text-red-600' : 'bg-rose-50 text-rose-500'
        }`}>
          <Calendar className="w-3.5 h-3.5" />
          <span className="font-mono whitespace-nowrap">{timeLeftStr || `Due in ${task.deadline.value} ${task.deadline.unit}`}</span>
        </div>
      )}

      <div className="flex items-center justify-end mt-auto">
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex items-center -space-x-1.5 pl-1 pr-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100/50 shadow-sm transition-colors hover:bg-indigo-100/50">
            {task.assignees.map((assignee, idx) => (
              <div key={assignee.id} className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white shadow-inner border border-white z-[1] hover:z-10" title={assignee.name}>
                {assignee.initials}
              </div>
            ))}
            {task.assignees.length === 1 && (
              <span className="text-[11px] font-medium text-indigo-700 truncate max-w-[80px] ml-1.5">
                {task.assignees[0].name}
              </span>
            )}
            {task.assignees.length > 1 && (
               <span className="text-[11px] font-medium text-indigo-700 ml-1.5">
                 {task.assignees.length} members
               </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
