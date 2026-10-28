import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { QuickAddBar } from './components/QuickAddBar';
import { ListView } from './components/ListView';
import { KanbanBoardView } from './components/KanbanBoardView';
import { EisenhowerMatrixView } from './components/EisenhowerMatrixView';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/TaskModal';
import { PomodoroModal } from './components/PomodoroModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { ExportImportModal } from './components/ExportImportModal';
import { AiReportModal } from './components/AiReportModal';
import {
  Task,
  Project,
  ViewMode,
  FilterState,
  TaskStatus,
  Priority,
  PomodoroSession,
  TaskHistoryEvent,
} from './types/todo';
import {
  loadSavedTasks,
  saveTasks,
  loadSavedProjects,
  saveProjects,
  loadSavedHistory,
  saveHistory,
  INITIAL_TASKS,
  INITIAL_PROJECTS,
  getTodayString,
  getOffsetDateString,
} from './utils/storage';
import { playCompleteSound, playAddSound, playTimerFinishSound } from './utils/audio';
import { triggerConfetti } from './utils/confetti';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskflow_theme_v1');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskflow_theme_v1', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskflow_theme_v1', 'light');
    }
  }, [isDarkMode]);

  // Core Data State
  const [tasks, setTasks] = useState<Task[]>(() => loadSavedTasks());
  const [projects, setProjects] = useState<Project[]>(() => loadSavedProjects());
  const [history, setHistory] = useState<TaskHistoryEvent[]>(() => loadSavedHistory());

  // Save changes to localStorage
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Helper to record history event
  const recordHistory = useCallback((
    action: TaskHistoryEvent['action'],
    taskId: string,
    taskTitle: string,
    details?: string
  ) => {
    const newEvent: TaskHistoryEvent = {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      taskId,
      taskTitle,
      action,
      timestamp: new Date().toISOString(),
      details,
    };
    setHistory((prev) => [newEvent, ...prev].slice(0, 100));
  }, []);

  // UI Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [filterState, setFilterState] = useState<FilterState>({
    view: 'all',
    search: '',
    priority: 'all',
    tag: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc',
    groupBy: 'none',
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskProps, setDefaultTaskProps] = useState<{
    status?: TaskStatus;
    priority?: Priority;
    dueDate?: string;
  }>({});

  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);
  const [isAiReportModalOpen, setIsAiReportModalOpen] = useState(false);

  // Pomodoro Session State
  const [pomodoro, setPomodoro] = useState<PomodoroSession>({
    isActive: false,
    mode: 'focus',
    secondsLeft: 25 * 60,
    taskId: null,
    sessionsCompletedToday: 0,
  });

  // Pomodoro countdown timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pomodoro.isActive && pomodoro.secondsLeft > 0) {
      interval = setInterval(() => {
        setPomodoro((prev) => ({
          ...prev,
          secondsLeft: prev.secondsLeft - 1,
        }));
      }, 1000);
    } else if (pomodoro.isActive && pomodoro.secondsLeft === 0) {
      // Completed session
      playTimerFinishSound();
      triggerConfetti();

      if (pomodoro.mode === 'focus') {
        const nextCount = pomodoro.sessionsCompletedToday + 1;
        const nextMode = nextCount % 4 === 0 ? 'longBreak' : 'shortBreak';
        const nextDuration = nextMode === 'longBreak' ? 15 * 60 : 5 * 60;

        // Auto-increment completed pomodoros on the linked task
        if (pomodoro.taskId) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === pomodoro.taskId
                ? { ...t, completedPomodoros: (t.completedPomodoros || 0) + 1 }
                : t
            )
          );
        }

        setPomodoro((prev) => ({
          ...prev,
          isActive: false,
          mode: nextMode,
          secondsLeft: nextDuration,
          sessionsCompletedToday: nextCount,
        }));
      } else {
        // Break finished
        setPomodoro((prev) => ({
          ...prev,
          isActive: false,
          mode: 'focus',
          secondsLeft: 25 * 60,
        }));
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoro.isActive, pomodoro.secondsLeft, pomodoro.mode, pomodoro.taskId, pomodoro.sessionsCompletedToday]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      if (isInput) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openNewTask();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPomodoroModalOpen(true);
      } else if (e.key === '1') {
        setViewMode('list');
      } else if (e.key === '2') {
        setViewMode('board');
      } else if (e.key === '3') {
        setViewMode('matrix');
      } else if (e.key === '4') {
        setViewMode('calendar');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Sort Tasks
  const filteredTasks = useMemo(() => {
    const todayStr = getTodayString();
    const upcomingStr = getOffsetDateString(7);

    return tasks.filter((task) => {
      // View category filter
      if (filterState.view === 'today') {
        if (task.completed) return false;
        if (!task.dueDate || task.dueDate > todayStr) return false;
      } else if (filterState.view === 'upcoming') {
        if (task.completed) return false;
        if (!task.dueDate || task.dueDate < todayStr || task.dueDate > upcomingStr) return false;
      } else if (filterState.view === 'completed') {
        if (!task.completed) return false;
      } else if (filterState.view !== 'all') {
        // Filter by project id
        if (task.projectId !== filterState.view) return false;
      }

      // Priority filter
      if (filterState.priority !== 'all' && task.priority !== filterState.priority) {
        return false;
      }

      // Tag filter
      if (filterState.tag !== 'all' && !(task.tags || []).includes(filterState.tag)) {
        return false;
      }

      // Search keyword filter
      if (filterState.search.trim()) {
        const query = filterState.search.toLowerCase().trim();
        const matchTitle = (task.title || '').toLowerCase().includes(query);
        const matchDesc = (task.description || '').toLowerCase().includes(query);
        const matchTag = (task.tags || []).some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }

      return true;
    }).sort((a, b) => {
      // Always put pinned items on top unless sorting specifically completed
      if (a.isPinned !== b.isPinned && filterState.view !== 'completed') {
        return a.isPinned ? -1 : 1;
      }

      // Completed items go to bottom in active views
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (filterState.sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }

      if (filterState.sortBy === 'priority') {
        const pWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
        return pWeights[b.priority] - pWeights[a.priority];
      }

      if (filterState.sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }

      // Recently added
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filterState]);

  // Handlers
  const handleToggleTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      let isNowCompleted = false;
      let taskTitle = '';
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          isNowCompleted = !t.completed;
          taskTitle = t.title;
          return {
            ...t,
            completed: isNowCompleted,
            status: isNowCompleted ? ('done' as TaskStatus) : ('todo' as TaskStatus),
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });

      if (taskTitle) {
        recordHistory(
          isNowCompleted ? 'completed' : 'uncompleted',
          taskId,
          taskTitle,
          isNowCompleted ? 'Marked complete' : 'Reopened'
        );
      }

      if (isNowCompleted) {
        playCompleteSound();
        // Check if all remaining items are done
        const pendingCount = updated.filter((t) => !t.completed).length;
        if (pendingCount === 0) {
          triggerConfetti();
        }
      }
      return updated;
    });
  }, [recordHistory]);

  const handleToggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = (t.subtasks || []).map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  }, []);

  const handleUpdateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) => {
      let taskTitle = '';
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const isDone = newStatus === 'done';
          taskTitle = t.title;
          if (isDone && !t.completed) {
            playCompleteSound();
          }
          return {
            ...t,
            status: newStatus,
            completed: isDone,
            completedAt: isDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });

      if (taskTitle) {
        recordHistory(
          newStatus === 'done' ? 'completed' : 'priority_changed',
          taskId,
          taskTitle,
          `Moved to ${newStatus}`
        );
      }
      return updated;
    });
  }, [recordHistory]);

  const handleChangePriority = useCallback((taskId: string, newPriority: Priority) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (task) {
        recordHistory('priority_changed', taskId, task.title, `Priority updated to ${newPriority}`);
      }
      return prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t));
    });
  }, [recordHistory]);

  const handleTogglePin = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isPinned: !t.isPinned } : t))
    );
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (task) {
        recordHistory('deleted', taskId, task.title);
      }
      return prev.filter((t) => t.id !== taskId);
    });
  }, [recordHistory]);

  const handleDuplicateTask = useCallback((task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${task.title} (Copy)`,
      completed: false,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      subtasks: (task.subtasks || []).map((st) => ({
        ...st,
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        completed: false,
      })),
    };
    setTasks((prev) => [duplicated, ...prev]);
    playAddSound();
  }, []);

  const handleSaveTask = useCallback((taskData: Partial<Task>) => {
    if (taskData.id) {
      // Edit existing
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t))
      );
    } else {
      // Create new
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        completed: taskData.status === 'done',
        completedAt: taskData.status === 'done' ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
        dueDate: taskData.dueDate,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'todo',
        projectId: taskData.projectId || projects[0]?.id || 'proj-1',
        tags: taskData.tags || [],
        subtasks: taskData.subtasks || [],
        isPinned: taskData.isPinned || false,
        estimatedPomodoros: taskData.estimatedPomodoros || 1,
        completedPomodoros: 0,
      };
      setTasks((prev) => [newTask, ...prev]);
      recordHistory('created', newTask.id, newTask.title);
      playAddSound();
    }
  }, [projects, recordHistory]);

  const handleQuickAddTask = useCallback((data: {
    title: string;
    dueDate?: string;
    priority: Priority;
    projectId: string;
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: data.title,
      description: '',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate,
      priority: data.priority,
      status: 'todo',
      projectId: data.projectId,
      tags: [],
      subtasks: [],
      isPinned: false,
      estimatedPomodoros: 1,
      completedPomodoros: 0,
    };
    setTasks((prev) => [newTask, ...prev]);
    recordHistory('created', newTask.id, newTask.title);
    playAddSound();
  }, [recordHistory]);

  const handleAddProject = useCallback((name: string, color: string) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      color,
    };
    setProjects((prev) => [...prev, newProj]);
    setFilterState((prev) => ({ ...prev, view: newProj.id }));
  }, []);

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    // Reassign tasks to default first project
    setTasks((prev) =>
      prev.map((t) => (t.projectId === projectId ? { ...t, projectId: 'proj-1' } : t))
    );
    setFilterState((prev) => ({ ...prev, view: 'all' }));
  }, []);

  const openNewTask = (overrides: { status?: TaskStatus; priority?: Priority; dueDate?: string } = {}) => {
    setTaskToEdit(null);
    setDefaultTaskProps(overrides);
    setIsTaskModalOpen(true);
  };

  const handleStartPomodoroForTask = useCallback((task: Task) => {
    setPomodoro((prev) => ({
      ...prev,
      taskId: task.id,
      isActive: true,
      mode: 'focus',
      secondsLeft: 25 * 60,
    }));
    setIsPomodoroModalOpen(true);
  }, []);

  const handleIncrementTaskPomodoro = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completedPomodoros: (t.completedPomodoros || 0) + 1 }
          : t
      )
    );
  }, []);

  const handleResetData = useCallback(() => {
    setTasks(INITIAL_TASKS);
    setProjects(INITIAL_PROJECTS);
    localStorage.removeItem('taskflow_tasks_v1');
    localStorage.removeItem('taskflow_projects_v1');
  }, []);

  const handleImportData = useCallback((importedTasks: Task[], importedProjects: Project[]) => {
    setTasks(importedTasks);
    if (importedProjects && importedProjects.length > 0) {
      setProjects(importedProjects);
    }
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        tasks={tasks}
        projects={projects}
        filterState={filterState}
        setFilterState={setFilterState}
        onOpenNewTask={() => openNewTask()}
        onOpenPomodoro={() => setIsPomodoroModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
        onOpenAiReport={() => setIsAiReportModalOpen(true)}
        onOpenExportImport={() => setIsExportImportModalOpen(true)}
        onAddProject={handleAddProject}
        onDeleteProject={handleDeleteProject}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          filterState={filterState}
          setFilterState={setFilterState}
          projects={projects}
          pomodoro={pomodoro}
          onOpenPomodoro={() => setIsPomodoroModalOpen(true)}
          onOpenAiReport={() => setIsAiReportModalOpen(true)}
          onOpenNewTask={() => openNewTask()}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Scrollable Viewport Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Quick Add Bar for Fast Entry */}
            {filterState.view !== 'completed' && (
              <QuickAddBar
                projects={projects}
                activeProjectId={filterState.view}
                onAddTask={handleQuickAddTask}
              />
            )}

            {/* View Switcher Container */}
            {viewMode === 'list' && (
              <ListView
                tasks={filteredTasks}
                projects={projects}
                filterState={filterState}
                setFilterState={setFilterState}
                onToggleTask={handleToggleTask}
                onEditTask={(task) => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onDuplicateTask={handleDuplicateTask}
                onTogglePin={handleTogglePin}
                onStartPomodoroForTask={handleStartPomodoroForTask}
                onToggleSubtask={handleToggleSubtask}
                onOpenNewTask={() => openNewTask()}
              />
            )}

            {viewMode === 'board' && (
              <KanbanBoardView
                tasks={filteredTasks}
                projects={projects}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onEditTask={(task) => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
                onOpenNewTaskWithStatus={(status) => openNewTask({ status })}
              />
            )}

            {viewMode === 'matrix' && (
              <EisenhowerMatrixView
                tasks={filteredTasks}
                projects={projects}
                onToggleTask={handleToggleTask}
                onEditTask={(task) => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
                onChangePriority={handleChangePriority}
                onOpenNewTaskWithPriority={(priority) => openNewTask({ priority })}
              />
            )}

            {viewMode === 'calendar' && (
              <CalendarView
                tasks={filteredTasks}
                projects={projects}
                onToggleTask={handleToggleTask}
                onEditTask={(task) => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
                onOpenNewTaskWithDate={(dateStr) => openNewTask({ dueDate: dateStr })}
              />
            )}
          </div>
        </main>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        taskToEdit={taskToEdit}
        projects={projects}
        defaultProjectId={filterState.view}
      />

      {/* Pomodoro Focus Timer Modal */}
      <PomodoroModal
        isOpen={isPomodoroModalOpen}
        onClose={() => setIsPomodoroModalOpen(false)}
        pomodoro={pomodoro}
        setPomodoro={setPomodoro}
        tasks={tasks}
        onIncrementTaskPomodoro={handleIncrementTaskPomodoro}
      />

      {/* Productivity Stats Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        tasks={tasks}
        projects={projects}
      />

      {/* AI Productivity & History Report Modal */}
      <AiReportModal
        isOpen={isAiReportModalOpen}
        onClose={() => setIsAiReportModalOpen(false)}
        tasks={tasks}
        projects={projects}
        history={history}
      />

      {/* Export & Import Modal */}
      <ExportImportModal
        isOpen={isExportImportModalOpen}
        onClose={() => setIsExportImportModalOpen(false)}
        tasks={tasks}
        projects={projects}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />
    </div>
  );
}
