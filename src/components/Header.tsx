import React, { useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  X,
  ListTodo,
  Kanban,
  Grid2X2,
  CalendarDays,
  Plus,
  Timer,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { ViewMode, FilterState, Project, PomodoroSession } from '../types/todo';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  projects: Project[];
  pomodoro: PomodoroSession;
  onOpenPomodoro: () => void;
  onOpenAiReport: () => void;
  onOpenNewTask: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  filterState,
  setFilterState,
  projects,
  pomodoro,
  onOpenPomodoro,
  onOpenAiReport,
  onOpenNewTask,
  onToggleMobileMenu,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute breadcrumb title
  let viewTitle = 'All Tasks';
  if (filterState.view === 'today') viewTitle = 'Today';
  else if (filterState.view === 'upcoming') viewTitle = 'Upcoming (Next 7 Days)';
  else if (filterState.view === 'completed') viewTitle = 'Completed Archive';
  else {
    const proj = projects.find((p) => p.id === filterState.view);
    if (proj) viewTitle = proj.name;
  }

  // Format pomodoro seconds
  const mins = Math.floor(pomodoro.secondsLeft / 60);
  const secs = pomodoro.secondsLeft % 60;
  const pomodoroTimeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <header className="h-16 px-4 md:px-6 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Mobile menu toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 -ml-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 min-w-0">
          <span className="hidden sm:inline">Tasks</span>
          <span className="hidden sm:inline" aria-hidden="true">/</span>
          <h1 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
            {viewTitle}
          </h1>
          {filterState.tag !== 'all' && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              #{filterState.tag}
            </span>
          )}
        </div>
      </div>

      {/* Middle: Live search bar */}
      <div className="flex-1 max-w-md mx-2 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tasks (Press '/' to focus)..."
            value={filterState.search}
            onChange={(e) => setFilterState((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full text-xs pl-9 pr-8 py-2 bg-neutral-100 dark:bg-neutral-800 border-none rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
          />
          {filterState.search && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: View mode tabs & Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* View mode segmented switcher */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            title="List View"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">List</span>
          </button>

          <button
            onClick={() => setViewMode('board')}
            title="Kanban Board View"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'board'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Board</span>
          </button>

          <button
            onClick={() => setViewMode('matrix')}
            title="Eisenhower Matrix View"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'matrix'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Matrix</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            title="Calendar View"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Calendar</span>
          </button>
        </div>

        {/* Pomodoro Timer widget badge */}
        {pomodoro.isActive && (
          <button
            onClick={onOpenPomodoro}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-mono font-medium hover:bg-rose-100 transition-colors"
          >
            <Timer className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span className="tabular-nums">{pomodoroTimeStr}</span>
          </button>
        )}

        {/* AI Report button */}
        <button
          onClick={onOpenAiReport}
          title="Gemini AI Productivity & History Report"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">AI Report</span>
        </button>

        {/* New Task button */}
        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Add Task</span>
        </button>
      </div>
    </header>
  );
};
