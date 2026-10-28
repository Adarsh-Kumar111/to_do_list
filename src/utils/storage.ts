import { Project, Task } from '../types/todo';

export const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks_v1',
  PROJECTS: 'taskflow_projects_v1',
  THEME: 'taskflow_theme_v1',
  STREAK: 'taskflow_streak_v1',
  HISTORY: 'taskflow_history_v1',
};

export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getOffsetDateString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export const INITIAL_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Work & Product', color: '#3b82f6', description: 'Core product roadmap & deliverables' },
  { id: 'proj-2', name: 'Engineering', color: '#10b981', description: 'Infrastructure, architecture & bugs' },
  { id: 'proj-3', name: 'Personal & Health', color: '#8b5cf6', description: 'Habits, wellness & family' },
  { id: 'proj-4', name: 'Learning & Reading', color: '#f59e0b', description: 'Books, papers & technical growth' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review and finalize Q4 strategic product roadmap',
    description: 'Ensure cross-functional alignment between engineering, design, and product marketing.',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: getTodayString(),
    priority: 'urgent',
    status: 'in_progress',
    projectId: 'proj-1',
    tags: ['strategy', 'roadmap', 'q4'],
    subtasks: [
      { id: 'sub-1', title: 'Synthesize user feedback and churn survey results', completed: true },
      { id: 'sub-2', title: 'Verify capacity estimates with tech leads', completed: true },
      { id: 'sub-3', title: 'Prepare 10-slide executive executive summary', completed: false },
    ],
    isPinned: true,
    estimatedPomodoros: 4,
    completedPomodoros: 2,
  },
  {
    id: 'task-2',
    title: 'Audit API response latencies and optimize database queries',
    description: 'Profile slow endpoints exceeding 250ms p95 latency. Check indexing on workspace transactions.',
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: getTodayString(),
    priority: 'high',
    status: 'todo',
    projectId: 'proj-2',
    tags: ['backend', 'performance'],
    subtasks: [
      { id: 'sub-4', title: 'Inspect query plans for composite index gaps', completed: false },
      { id: 'sub-5', title: 'Add redis cache layer for tenant permissions', completed: false },
    ],
    isPinned: false,
    estimatedPomodoros: 3,
    completedPomodoros: 0,
  },
  {
    id: 'task-3',
    title: 'Morning 5km endurance run & mobility stretches',
    description: 'Hydrate well and complete 15-minute hamstring and hip flexor routine afterward.',
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    dueDate: getTodayString(),
    priority: 'medium',
    status: 'done',
    projectId: 'proj-3',
    tags: ['health', 'fitness'],
    subtasks: [
      { id: 'sub-6', title: '5km running session', completed: true },
      { id: 'sub-7', title: 'Static stretching & foam rolling', completed: true },
    ],
    isPinned: false,
    estimatedPomodoros: 1,
    completedPomodoros: 1,
  },
  {
    id: 'task-4',
    title: 'Read chapters 4 & 5 of Designing Data-Intensive Applications',
    description: 'Take structured notes on consensus algorithms, replication logs, and Raft leader election.',
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: getOffsetDateString(2),
    priority: 'medium',
    status: 'todo',
    projectId: 'proj-4',
    tags: ['reading', 'system-design'],
    subtasks: [
      { id: 'sub-8', title: 'Chapter 4: Encoding and Evolution', completed: true },
      { id: 'sub-9', title: 'Chapter 5: Replication', completed: false },
    ],
    isPinned: false,
    estimatedPomodoros: 2,
    completedPomodoros: 0,
  },
  {
    id: 'task-5',
    title: 'Design clean responsive navigation & dark mode contrast tokens',
    description: 'Ensure contrast ratios meet WCAG AA standards across desktop and mobile screens.',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    dueDate: getOffsetDateString(4),
    priority: 'high',
    status: 'in_progress',
    projectId: 'proj-1',
    tags: ['ui', 'design-system'],
    subtasks: [
      { id: 'sub-10', title: 'Create token mapping table for light & dark', completed: true },
      { id: 'sub-11', title: 'Review accessibility contrast tests', completed: false },
    ],
    isPinned: true,
    estimatedPomodoros: 3,
    completedPomodoros: 1,
  },
  {
    id: 'task-6',
    title: 'Schedule annual vehicle service checkup',
    description: 'Book morning appointment slot and request tire rotation check.',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    dueDate: getOffsetDateString(7),
    priority: 'low',
    status: 'backlog',
    projectId: 'proj-3',
    tags: ['errands', 'personal'],
    subtasks: [],
    isPinned: false,
    estimatedPomodoros: 1,
    completedPomodoros: 0,
  },
  {
    id: 'task-7',
    title: 'Publish technical retrospective on zero-downtime database migration',
    description: 'Draft engineering blog post detailing dual-write phase, backfill validation, and switchover.',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: getOffsetDateString(5),
    priority: 'medium',
    status: 'review',
    projectId: 'proj-2',
    tags: ['blog', 'engineering'],
    subtasks: [
      { id: 'sub-12', title: 'Peer review with lead architect', completed: false },
    ],
    isPinned: false,
    estimatedPomodoros: 2,
    completedPomodoros: 0,
  },
  {
    id: 'task-8',
    title: 'Upgrade package dependencies and audit vulnerabilities',
    description: 'Run dependency auditor and patch breaking changes in minor versions.',
    completed: true,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    dueDate: getOffsetDateString(-1),
    priority: 'low',
    status: 'done',
    projectId: 'proj-2',
    tags: ['devops', 'security'],
    subtasks: [],
    isPinned: false,
    estimatedPomodoros: 1,
    completedPomodoros: 1,
  },
];

export function loadSavedTasks(): Task[] {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function loadSavedProjects(): Project[] {
  if (typeof window === 'undefined') return INITIAL_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return INITIAL_PROJECTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROJECTS;
  } catch {
    return INITIAL_PROJECTS;
  }
}

export function loadSavedHistory(): import('../types/todo').TaskHistoryEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      // Seed starter history
      return [
        {
          id: 'hist-1',
          taskId: 'task-3',
          taskTitle: 'Morning 5km endurance run & mobility stretches',
          action: 'completed',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        {
          id: 'hist-2',
          taskId: 'task-8',
          taskTitle: 'Upgrade package dependencies and audit vulnerabilities',
          action: 'completed',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'hist-3',
          taskId: 'task-1',
          taskTitle: 'Review and finalize Q4 strategic product roadmap',
          action: 'pomodoro_completed',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          details: 'Completed 25m Focus Block #2',
        },
      ];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: import('../types/todo').TaskHistoryEvent[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(-100)));
  } catch (err) {
    console.error('Failed to save history to localStorage', err);
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage', err);
  }
}

export function exportTasksAsJSON(tasks: Task[], projects: Project[]) {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    projects,
    tasks,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-export-${getTodayString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTasksAsCSV(tasks: Task[], projects: Project[]) {
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const headers = ['ID', 'Title', 'Status', 'Priority', 'Project', 'Due Date', 'Completed', 'Tags', 'Created At'];
  const rows = tasks.map((t) => [
    t.id,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.status,
    t.priority,
    `"${(projectMap.get(t.projectId) || 'Default').replace(/"/g, '""')}"`,
    t.dueDate || '',
    t.completed ? 'YES' : 'NO',
    `"${t.tags.join(', ')}"`,
    t.createdAt,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-tasks-${getTodayString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatRelativeDueDate(dateStr?: string): { label: string; isOverdue: boolean; isToday: boolean; isTomorrow: boolean } {
  if (!dateStr) return { label: 'No due date', isOverdue: false, isToday: false, isTomorrow: false };

  const todayStr = getTodayString();
  const tomorrowStr = getOffsetDateString(1);

  if (dateStr === todayStr) {
    return { label: 'Today', isOverdue: false, isToday: true, isTomorrow: false };
  }
  if (dateStr === tomorrowStr) {
    return { label: 'Tomorrow', isOverdue: false, isToday: false, isTomorrow: true };
  }

  // Calculate day diff
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: overdueDays === 1 ? 'Overdue 1 day' : `Overdue ${overdueDays} days`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
    };
  }

  // Future date: format as e.g. "Nov 14"
  const formatted = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { label: formatted, isOverdue: false, isToday: false, isTomorrow: false };
}
