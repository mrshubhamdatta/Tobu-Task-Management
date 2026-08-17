export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export type DeadlineUnit = 'days' | 'hours' | 'minutes';

export interface Deadline {
  value: number;
  unit: DeadlineUnit;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  role: 'Admin' | 'Employee';
}

export type Priority = 'Casual' | 'Urgent';

export interface ChatMessage {
  id: string;
  authorId: string;
  text: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: Priority;
  assignees: User[];
  createdBy?: User;
  assignedDate?: string;
  deadline?: Deadline;
  timeSpent: number; // in minutes
  tags: string[];
  createdAtTimestamp?: number;
  totalPausedMs?: number;
  lastPausedAt?: number;
  completedAt?: number;
  messages?: ChatMessage[];
}
