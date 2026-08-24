export type TaskStatus = "todo" | "doing" | "done" | "blocked";
export type TaskBoard = "inbox" | "daily" | "weekly";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface CategoryColor {
  name: string;
  dot: string;
  badge: string;
}

export interface Category {
  id: string;
  name: string;
  color: CategoryColor;
}

export interface Task {
  id: string;
  title: string;
  categoryId: string;
  dueDate: string | null;
  status: TaskStatus;
  favorite: boolean;
  board: TaskBoard;
  description: string;
  subtasks: Subtask[];
  links: string[];
  archivedAt: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export type EventColor = "primary" | "danger" | "success" | "warning";

export interface ScheduleBlock {
  id: string;
  taskId: string | null;
  title: string;
  date: string;
  startMinutes: number;
  durationMinutes: number;
  color: EventColor;
}

export interface OceanStore {
  version: 1;
  categories: Category[];
  tasks: Task[];
  schedule: ScheduleBlock[];
}

export const TASK_DRAG_MIME = "text/ocean-task-id";
export const STORAGE_KEY = "oceanquiet.store.v1";
export const TRASH_RETENTION_DAYS = 30;
