export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  dueDate?: string; // YYYY-MM-DD
  priority: Priority;
  status: TaskStatus;
  projectId: string;
  tags: string[];
  subtasks: SubTask[];
  isPinned?: boolean;
  estimatedPomodoros?: number;
  completedPomodoros?: number;
}

export interface Project {
  id: string;
  name: string;
  color: string; // CSS color string (e.g., '#3b82f6')
  description?: string;
}

export type ViewMode = 'list' | 'board' | 'matrix' | 'calendar';

export type ActiveFilterView = 'all' | 'today' | 'upcoming' | 'matrix' | 'completed' | string; // or specific projectId

export interface FilterState {
  view: ActiveFilterView;
  search: string;
  priority: Priority | 'all';
  tag: string | 'all';
  sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  groupBy: 'none' | 'dueDate' | 'priority' | 'project';
}

export interface TaskHistoryEvent {
  id: string;
  taskId: string;
  taskTitle: string;
  action: 'created' | 'completed' | 'uncompleted' | 'deleted' | 'priority_changed' | 'pomodoro_completed';
  timestamp: string;
  details?: string;
}

export interface PomodoroSession {
  isActive: boolean;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  secondsLeft: number;
  taskId: string | null;
  sessionsCompletedToday: number;
}
