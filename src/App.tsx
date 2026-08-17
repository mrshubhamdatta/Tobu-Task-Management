/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Briefcase, CheckSquare, Users, Search, Bell, Settings, Plus, X, LayoutDashboard } from 'lucide-react';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskModal } from './components/TaskModal';
import { TaskDetailView } from './components/TaskDetailView';
import { DashboardView } from './components/DashboardView';
import { TeamView } from './components/TeamView';
import { initialTasks, mockUsers, currentUser } from './data';
import { Task, TaskStatus, User } from './types';

interface Toast {
  id: string;
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'default'
  );

  const requestNotificationPermission = () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
      return;
    }
    Notification.requestPermission().then((permission) => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('TTM Notifications Enabled!', {
          body: 'You will now receive alerts for new tasks and updates.',
          icon: '/icon.svg'
        });
      }
    });
  };

  const addToast = (message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    
    // Trigger native notification if granted
    if (notificationPermission === 'granted') {
      try {
        new Notification('TTM Update', {
          body: message,
          icon: '/icon.svg'
        });
      } catch (e) {
        console.error('Error sending notification', e);
      }
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleAddUser = (user: User) => {
    setUsers(prev => [...prev, user]);
    addToast(`👤 New team member added: ${user.name}`);
  };

  const handleUpdateRole = (userId: string, newRole: User['role']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    addToast(`🛡️ Role updated to ${newRole}`);
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    addToast(`❌ Team member removed`);
  };

  const processTaskStatusChange = (task: Task, oldStatus: TaskStatus, newStatus: TaskStatus): Task => {
    let finalTask = { ...task, status: newStatus };
    
    let newTotalPausedMs = task.totalPausedMs || 0;
    let newLastPausedAt = task.lastPausedAt;
    
    if (oldStatus === 'review' && newLastPausedAt) {
      newTotalPausedMs += (Date.now() - newLastPausedAt);
      newLastPausedAt = undefined;
    }
    
    if (newStatus === 'review' && oldStatus !== 'review') {
      newLastPausedAt = Date.now();
    }
    
    finalTask.totalPausedMs = newTotalPausedMs;
    finalTask.lastPausedAt = newLastPausedAt;

    if (newStatus === 'done' && oldStatus !== 'done') {
      finalTask.completedAt = Date.now();
    }

    const assigner = finalTask.createdBy ? finalTask.createdBy.name : 'System';
    const assignees = finalTask.assignees && finalTask.assignees.length > 0 ? finalTask.assignees.map(a => a.name).join(', ') : 'Assignees';

    if (newStatus === 'in-progress') {
      addToast(`🔔 "${finalTask.title}" moved to In Progress.\nNotified: ${assigner} & ${assignees}`);
    } else if (newStatus === 'review') {
      addToast(`🔔 "${finalTask.title}" moved to Review. Timer paused.\nNotified: ${assigner} & ${assignees}`);
    } else if (newStatus === 'done') {
      addToast(`✅ "${finalTask.title}" is Done!\nNotified: ${assigner} & ${assignees}`);
    }

    return finalTask;
  };

  const handleTaskStatusChange = (task: Task, oldStatus: TaskStatus, newStatus: TaskStatus) => {
    const processedTask = processTaskStatusChange(task, oldStatus, newStatus);
    setTasks(prev => prev.map(t => t.id === processedTask.id ? processedTask : t));
    if (selectedTask?.id === processedTask.id) {
      setSelectedTask(processedTask);
    }
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...newTaskData, createdAtTimestamp: newTaskData.deadline ? (t.createdAtTimestamp || Date.now()) : t.createdAtTimestamp } as Task : t));
    } else {
      const newTask: Task = {
        ...newTaskData,
        id: `t${Date.now()}`,
        createdAtTimestamp: Date.now(),
      };
      setTasks([...tasks, newTask]);
      
      const assigneeName = newTask.assignees && newTask.assignees.length > 0 ? newTask.assignees.map(a => a.name).join(', ') : 'Unassigned';
      addToast(`🔔 Task Created: "${newTask.title}"\nAssigned to: ${assigneeName}`);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
            <CheckSquare className="w-6 h-6" />
            <span>TTM</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => { setActiveTab('Dashboard'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Briefcase className="w-5 h-5" />} label="Projects" active={activeTab === 'Projects'} onClick={() => { setActiveTab('Projects'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<CheckSquare className="w-5 h-5" />} label="My Tasks" active={activeTab === 'My Tasks'} onClick={() => { setActiveTab('My Tasks'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Users className="w-5 h-5" />} label="Team" active={activeTab === 'Team'} onClick={() => { setActiveTab('Team'); setIsMobileMenuOpen(false); }} />
        </nav>
        <div className="p-4 border-t border-slate-200">
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" active={activeTab === 'Settings'} onClick={() => { setActiveTab('Settings'); setIsMobileMenuOpen(false); }} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button className="md:hidden text-slate-500 hover:text-slate-700 p-1" onClick={() => setIsMobileMenuOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800 truncate">Tobu Task Management</h1>
            <span className="hidden sm:inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Active</span>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative hidden md:block">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64 bg-slate-50"
              />
            </div>
            <button className="text-slate-400 hover:text-slate-600 transition-colors hidden sm:block">
              <Search className="w-5 h-5 md:hidden" />
            </button>
            <button 
              onClick={requestNotificationPermission}
              title={notificationPermission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
              className={`transition-colors ${notificationPermission === 'granted' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium text-sm shrink-0">
              SD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTask ? (
            <div className="flex-1 p-0 md:p-6 overflow-hidden">
              <TaskDetailView 
                task={selectedTask} 
                onClose={() => setSelectedTask(null)} 
                onUpdate={handleTaskUpdate} 
              />
            </div>
          ) : (
            <>
              {activeTab === 'Projects' ? (
                <>
                  {/* Board Actions */}
                  <div className="px-4 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                      <button className="bg-white border border-slate-200 px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm shrink-0">
                        Filter
                      </button>
                      <button className="bg-white border border-slate-200 px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm shrink-0">
                        Group By
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      New Task
                    </button>
                  </div>

                  <div className="flex-1 overflow-x-auto px-4 md:px-8 pb-4 md:pb-8 hide-scrollbar">
                    <KanbanBoard 
                      tasks={tasks} 
                      setTasks={setTasks} 
                      onTaskEdit={handleEditTask} 
                      onTaskSelect={setSelectedTask}
                      onTaskStatusChange={handleTaskStatusChange}
                    />
                  </div>
                </>
              ) : activeTab === 'Dashboard' ? (
                <DashboardView 
                  tasks={tasks} 
                  onTaskSelect={(task) => {
                    setSelectedTask(task);
                  }}
                />
              ) : activeTab === 'My Tasks' ? (
                <DashboardView 
                  tasks={tasks.filter(t => t.assignees?.some(a => a.id === currentUser.id))} 
                  onTaskSelect={(task) => {
                    setSelectedTask(task);
                  }}
                />
              ) : activeTab === 'Team' ? (
                <TeamView 
                  users={users}
                  currentUser={currentUser}
                  onAddUser={handleAddUser}
                  onUpdateRole={handleUpdateRole}
                  onRemoveUser={handleRemoveUser}
                />
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl m-8 bg-slate-50/50 text-slate-500 font-medium text-sm">
                  {activeTab} View Placeholder
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleAddTask} 
        initialTask={editingTask}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="bg-white border border-slate-200 shadow-lg rounded-xl p-4 flex items-start gap-3 w-[calc(100vw-3rem)] sm:w-80 animate-in slide-in-from-bottom-8 sm:slide-in-from-right-8 fade-in duration-300 pointer-events-auto">
            <div className="flex-1 text-sm font-medium text-slate-800 whitespace-pre-wrap">
              {toast.message}
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 shrink-0 -mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon}
      {label}
    </button>
  );
}
