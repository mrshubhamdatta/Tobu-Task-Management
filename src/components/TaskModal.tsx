import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { currentUser, mockUsers } from '../data';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  initialTask?: Task | null;
}

export function TaskModal({ isOpen, onClose, onSave, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [createdById, setCreatedById] = useState<string>(currentUser.id);
  const [assignedDate, setAssignedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deadlineValue, setDeadlineValue] = useState<number | ''>('');
  const [deadlineUnit, setDeadlineUnit] = useState<'days' | 'hours' | 'minutes'>('days');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setStatus(initialTask.status);
      setAssigneeIds(initialTask.assignees?.map(a => a.id) || []);
      setCreatedById(initialTask.createdBy?.id || currentUser.id);
      setAssignedDate(initialTask.assignedDate || new Date().toISOString().split('T')[0]);
      setDeadlineValue(initialTask.deadline?.value || '');
      setDeadlineUnit(initialTask.deadline?.unit || 'days');
    } else {
      setTitle('');
      setStatus('todo');
      setAssigneeIds([]);
      setCreatedById(currentUser.id);
      setAssignedDate(new Date().toISOString().split('T')[0]);
      setDeadlineValue('');
      setDeadlineUnit('days');
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const assignees = mockUsers.filter(u => assigneeIds.includes(u.id));
    const createdBy = mockUsers.find(u => u.id === createdById);

    onSave({
      title,
      status,
      timeSpent: 0,
      tags: [],
      assignees,
      createdBy,
      assignedDate,
      deadline: deadlineValue ? { value: Number(deadlineValue), unit: deadlineUnit } : undefined,
    });
    
    setTitle('');
    setStatus('todo');
    setAssigneeIds([]);
    setCreatedById(currentUser.id);
    setAssignedDate(new Date().toISOString().split('T')[0]);
    setDeadlineValue('');
    setDeadlineUnit('days');
    onClose();
  };

  const toggleAssignee = (userId: string) => {
    setAssigneeIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-full overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">{initialTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Update user dashboard"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="createdBy" className="block text-sm font-medium text-slate-700 mb-1">Task Created By</label>
              <select
                id="createdBy"
                value={createdById}
                onChange={(e) => setCreatedById(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                {mockUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Task Given To</label>
              <div className="border border-slate-200 rounded-lg p-2 max-h-32 overflow-y-auto bg-white">
                {mockUsers.map(user => (
                  <label key={user.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={assigneeIds.includes(user.id)}
                      onChange={() => toggleAssignee(user.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold">
                          {user.initials}
                        </div>
                      )}
                      <span className="text-sm text-slate-700">{user.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="assignedDate" className="block text-sm font-medium text-slate-700 mb-1">Assigned Date</label>
              <input
                id="assignedDate"
                type="date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline Duration</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={deadlineValue}
                  onChange={(e) => setDeadlineValue(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 3"
                />
                <select
                  value={deadlineUnit}
                  onChange={(e) => setDeadlineUnit(e.target.value as any)}
                  className="w-24 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="days">Days</option>
                  <option value="hours">Hours</option>
                  <option value="minutes">Mins</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="pt-4 mt-2 flex items-center justify-end gap-3 shrink-0 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
