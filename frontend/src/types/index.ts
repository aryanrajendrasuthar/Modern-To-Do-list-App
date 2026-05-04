export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'done';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ViewMode = 'list' | 'board' | 'calendar' | 'table';

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Recurrence {
  enabled: boolean;
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek: number[]; // 0=Sun … 6=Sat
  endDate: string | null;
  nextDue: string | null;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  richDescription: string;
  priority: Priority;
  status: Status;
  completed: boolean;
  dueDate: string | null;
  dueTime: string | null; // "HH:MM"
  startDate: string | null;
  tags: string[];
  order: number;
  icon: string;
  coverColor: string;
  subtasks: Subtask[];
  recurrence: Recurrence;
  estimatedMinutes: number | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  taskId: string;
  userId: Pick<User, '_id' | 'name' | 'email'>;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TaskFilters {
  status?: Status;
  priority?: Priority;
  tag?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}
