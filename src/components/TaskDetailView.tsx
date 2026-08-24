import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Send, MoreHorizontal } from 'lucide-react';
import { Task, ChatMessage } from '../types';
import { currentUser, mockUsers } from '../data';

interface TaskDetailViewProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

export function TaskDetailView({ task, onClose, onUpdate }: TaskDetailViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description);
  
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(-1);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewMessage(text);
    
    // Check for @mention trigger
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1].toLowerCase());
      setMentionIndex(mentionMatch.index!);
    } else {
      setMentionSearch(null);
    }
  };

  const handleMentionSelect = (user: typeof mockUsers[0]) => {
    if (mentionIndex === -1) return;
    
    const textBeforeMention = newMessage.slice(0, mentionIndex);
    const textAfterMention = newMessage.slice(mentionIndex + (mentionSearch?.length || 0) + 1);
    
    setNewMessage(`${textBeforeMention}@${user.name} ${textAfterMention}`);
    setMentionSearch(null);
  };

  const filteredUsers = mockUsers.filter(u => 
    mentionSearch !== null && 
    (u.name.toLowerCase().includes(mentionSearch) || u.initials.toLowerCase().includes(mentionSearch))
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    const message: ChatMessage = {
      id: `m${Date.now()}`,
      authorId: currentUser.id,
      text: messageText,
      timestamp: Date.now(),
    };

    const mentionedUsers = mockUsers.filter(u => messageText.includes(`@${u.name}`));
    const newAssignees = [...(task.assignees || [])];
    let assigneesUpdated = false;

    mentionedUsers.forEach(u => {
      if (!newAssignees.some(a => a.id === u.id)) {
        newAssignees.push(u);
        assigneesUpdated = true;
      }
    });

    onUpdate({
      ...task,
      messages: [...(task.messages || []), message],
      ...(assigneesUpdated ? { assignees: newAssignees } : {})
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-slate-800">{task.title}</h2>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Pane - Details */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 border-r-0 md:border-r border-slate-200">
          <div className="grid grid-cols-2 gap-x-6 md:gap-x-12 gap-y-6 mb-8 max-w-3xl">
            <div>
              <span className="block text-sm font-medium text-slate-500 mb-1">Project</span>
              <span className="text-sm text-slate-800 font-medium">TTM Main</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-500 mb-1">Assignees</span>
              {task.assignees && task.assignees.length > 0 ? (
                <div className="flex items-center -space-x-2">
                  {task.assignees.map((assignee) => (
                    <div key={assignee.id} className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner border-2 border-white z-[1] hover:z-10" title={assignee.name}>
                      {assignee.initials}
                    </div>
                  ))}
                  {task.assignees.length === 1 && (
                    <span className="text-sm font-medium text-slate-700 ml-3">{task.assignees[0].name}</span>
                  )}
                  {task.assignees.length > 1 && (
                    <span className="text-sm font-medium text-slate-700 ml-3">{task.assignees.length} assignees</span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-slate-400">Unassigned</span>
              )}
            </div>
            
            <div>
              <span className="block text-sm font-medium text-slate-500 mb-1">Deadline</span>
              {task.deadline ? (
                <div className="flex items-center gap-1.5 text-rose-600 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{task.deadline.value} {task.deadline.unit}</span>
                </div>
              ) : (
                <span className="text-sm text-slate-400">No deadline</span>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-500 mb-1">Priority</span>
              {task.priority ? (
                 <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  task.priority === 'Urgent' 
                    ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}>
                  {task.priority}
                </span>
              ) : (
                <span className="text-sm text-slate-400">Normal</span>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-500 mb-1">Created By</span>
              {task.createdBy ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-inner">
                    {task.createdBy.initials}
                  </div>
                  <span className="text-sm text-slate-700">{task.createdBy.name}</span>
                </div>
              ) : (
                <span className="text-sm text-slate-400">Unknown</span>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Description</h3>
              {!isEditingDescription && (
                <button 
                  onClick={() => setIsEditingDescription(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 hover:bg-indigo-50 rounded transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            
            {isEditingDescription ? (
              <div className="space-y-3">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Add details about this task..."
                  className="w-full min-h-[120px] p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      onUpdate({ ...task, description: editedDescription });
                      setIsEditingDescription(false);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setEditedDescription(task.description);
                      setIsEditingDescription(false);
                    }}
                    className="px-3 py-1.5 text-slate-600 text-sm font-medium rounded hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className={`text-sm whitespace-pre-wrap ${task.description ? 'text-slate-600' : 'text-slate-400 italic cursor-pointer hover:text-slate-600'}`}
                onClick={() => !task.description && setIsEditingDescription(true)}
              >
                {task.description || 'Add details about this task...'}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Chat/Activity */}
        <div className="w-full md:w-96 flex flex-col bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-200 min-h-[400px] md:min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Initial Task Creation Activity */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
                {task.createdBy?.initials || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800">{task.createdBy?.name || 'System'}</span>
                  <span className="text-xs text-slate-400">
                    {task.createdAtTimestamp ? new Date(task.createdAtTimestamp).toLocaleString() : 'Just now'}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  Task created
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            {(task.messages || []).map((msg) => {
              const author = mockUsers.find(u => u.id === msg.authorId) || currentUser;
              return (
                <div key={msg.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${author.id === currentUser.id ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                    {author.initials}
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800">{author.name}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-slate-200 relative">
            {mentionSearch !== null && filteredUsers.length > 0 && (
              <div className="absolute bottom-full left-4 mb-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mention a team member
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                  {filteredUsers.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleMentionSelect(user)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-md transition-colors text-left"
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                          {user.initials}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-700">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="relative">
              <textarea
                value={newMessage}
                onChange={handleMessageChange}
                placeholder="Type a message... Use @ to mention someone"
                className="w-full pl-3 pr-12 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20 bg-slate-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
