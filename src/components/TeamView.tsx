import React, { useState } from 'react';
import { User } from '../types';
import { Shield, ShieldAlert, MoreVertical, Plus, Mail } from 'lucide-react';

interface TeamViewProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: User) => void;
  onUpdateRole: (userId: string, newRole: User['role']) => void;
  onRemoveUser: (userId: string) => void;
}

export function TeamView({ users, currentUser, onAddUser, onUpdateRole, onRemoveUser }: TeamViewProps) {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<User['role']>('Employee');

  const isAdmin = currentUser.role === 'Admin';

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    // Generate initials
    const initials = newUserName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newUser: User = {
      id: `u${Date.now()}`,
      name: newUserName.trim(),
      initials,
      role: newUserRole,
    };

    onAddUser(newUser);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Employee');
    setIsAddingUser(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">Team Management</h2>
            <p className="text-sm text-slate-500">Manage your workspace members and their roles.</p>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setIsAddingUser(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          )}
        </div>

        {/* Lock Screen for non-admins to prevent managing team (Example Suggestion) */}
        {!isAdmin && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-800">Restricted Access</h4>
              <p className="text-sm text-amber-700 mt-1">
                You are viewing the team directory as an Employee. Only Administrators can add members, remove users, or change accessibility roles.
              </p>
            </div>
          </div>
        )}

        {isAddingUser && isAdmin && (
          <form onSubmit={handleAddUser} className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Invite New Member</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Alex Morgan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="alex@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role / Accessibility</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as User['role'])}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Employee">Employee (Standard Access)</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Send Invitation
              </button>
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                          {user.initials}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {user.name}
                          {user.id === currentUser.id && (
                            <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold uppercase">You</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{user.name.toLowerCase().replace(' ', '.')}@company.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {user.role === 'Admin' ? (
                        <Shield className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                      <span className={`text-sm font-medium ${user.role === 'Admin' ? 'text-indigo-700' : 'text-slate-600'}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      {user.id !== currentUser.id ? (
                        <div className="flex justify-end gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => onUpdateRole(user.id, e.target.value as User['role'])}
                            className="text-xs border border-slate-200 rounded p-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="Employee">Employee</option>
                            <option value="Admin">Admin</option>
                          </select>
                          <button
                            onClick={() => onRemoveUser(user.id)}
                            className="text-xs text-red-600 hover:bg-red-50 px-2 py-1.5 rounded transition-colors font-medium border border-transparent hover:border-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Cannot modify self</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
