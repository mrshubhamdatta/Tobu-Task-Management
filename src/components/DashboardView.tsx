import React from 'react';
import { Task } from '../types';
import { CheckCircle2, Clock, PlayCircle, AlertCircle } from 'lucide-react';

interface DashboardViewProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
}

export function DashboardView({ tasks, onTaskSelect }: DashboardViewProps) {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
      case 'in-progress':
        return <PlayCircle className="w-4 h-4 text-indigo-500" />;
      case 'review':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'review': return 'Review';
      case 'done': return 'Done';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">Task Dashboard</h2>
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr 
                    key={task.id} 
                    onClick={() => onTaskSelect(task)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {task.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm text-slate-600 font-medium">
                          {getStatusText(task.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {task.assignees && task.assignees.length > 0 ? (
                          <div className="flex items-center -space-x-2">
                            {task.assignees.map((assignee, idx) => (
                              <div key={assignee.id} className="relative z-[1] hover:z-10" title={assignee.name}>
                                {assignee.avatarUrl ? (
                                  <img src={assignee.avatarUrl} alt={assignee.name} className="w-6 h-6 rounded-full border-2 border-white" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                    {assignee.initials}
                                  </div>
                                )}
                              </div>
                            ))}
                            {task.assignees.length === 1 && (
                              <span className="text-sm text-slate-700 ml-3">{task.assignees[0].name}</span>
                            )}
                            {task.assignees.length > 1 && (
                              <span className="text-sm text-slate-700 ml-3">{task.assignees.length} assignees</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {task.createdBy ? (
                          <>
                            {task.createdBy.avatarUrl ? (
                              <img src={task.createdBy.avatarUrl} alt={task.createdBy.name} className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                {task.createdBy.initials}
                              </div>
                            )}
                            <span className="text-sm text-slate-700">{task.createdBy.name}</span>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400 italic">System</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
