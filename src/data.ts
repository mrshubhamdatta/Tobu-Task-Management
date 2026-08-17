import { Task, User } from './types';

export const currentUser: User = {
  id: 'u1',
  name: 'Shubham Datta',
  initials: 'SD',
  role: 'Admin',
};

export const mockUsers: User[] = [
  currentUser,
  { id: 'u2', name: 'John Doe', initials: 'JD', role: 'Employee' },
  { id: 'u3', name: 'Jane Smith', initials: 'JS', role: 'Employee' },
];

export const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Design new landing page concepts',
    status: 'todo',
    assignees: [mockUsers[1]],
    timeSpent: 270, // 4:30h
    tags: ['Design'],
  },
  {
    id: 't2',
    title: 'Update authentication flow',
    status: 'in-progress',
    assignees: [currentUser],
    timeSpent: 120, // 2:00h
    tags: ['Development', 'Security'],
  },
  {
    id: 't3',
    title: 'Fix navigation bug on mobile',
    status: 'review',
    assignees: [mockUsers[2]],
    timeSpent: 45, // 0:45h
    tags: ['Bug'],
  },
  {
    id: 't4',
    title: 'Write release notes for v2.0',
    status: 'done',
    assignees: [],
    timeSpent: 60, // 1:00h
    tags: ['Documentation'],
  },
  {
    id: 't5',
    title: 'Set up CI/CD pipeline',
    status: 'todo',
    assignees: [currentUser],
    timeSpent: 0,
    tags: ['DevOps'],
  }
];
