import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Inbox,
  FolderPlus,
  Trash2,
  BarChart3,
  Timer,
  Download,
  Sun,
  Moon,
  Hash,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Project, Task, FilterState } from '../types/todo';

interface SidebarProps {
  tasks: Task[];
  projects: Project[];
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenNewTask: () => void;
  onOpenPomodoro: () => void;
  onOpenAnalytics: () => void;
  onOpenAiReport: () => void;
  onOpenExportImport: () => void;
  onAddProject: (name: string, color: string) => void;
  onDeleteProject: (id: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const PROJECT_PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const Sidebar: React.FC<SidebarProps> = ({
  tasks,
  projects,
  filterState,
  setFilterState,
  onOpenNewTask,
  onOpenPomodoro,
  onOpenAnalytics,
  onOpenAiReport,
  onOpenExportImport,
  onAddProject,
  onDeleteProject,
  isDarkMode,
  onToggleDarkMode,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_PALETTE[0]);

  // Compute counts
  const totalTasks = tasks.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = tasks.filter((t) => !t.completed && t.dueDate === todayStr).length;
  const overdueCount = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // Extract all unique tags
  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || []))).filter(Boolean);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onAddProject(newProjectName.trim(), selectedColor);
    setNewProjectName('');
    setIsAddingProject(false);
  };

  const handleSelectView = (view: string) => {
    setFilterState((prev) => ({
      ...prev,
      view,
      tag: 'all',
    }));
    setIsMobileOpen(false);
  };

  const handleSelectTag = (tag: string) => {
    setFilterState((prev) => ({
      ...prev,
      tag: prev.tag === tag ? 'all' : tag,
    }));
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Zone */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 font-bold text-base shadow-xs">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
              TaskFlow
            </span>
          </div>

          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onOpenNewTask();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
          >
            <span>+</span>
            <span>New Task</span>
            <kbd className="hidden md:inline-block ml-auto text-[10px] font-mono opacity-60 bg-neutral-800 dark:bg-neutral-200 text-neutral-200 dark:text-neutral-800 px-1.5 py-0.5 rounded">
              N
            </kbd>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Main views */}
          <div>
            <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase px-2 mb-1">
              Views
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelectView('all')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterState.view === 'all'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-neutral-500" />
                  <span>All Tasks</span>
                </div>
                <span className="font-mono text-[11px] tabular-nums text-neutral-400">{totalTasks}</span>
              </button>

              <button
                onClick={() => handleSelectView('today')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterState.view === 'today'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  {overdueCount > 0 && (
                    <span className="font-mono text-[10px] tabular-nums bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-1.5 rounded" title="Overdue tasks">
                      +{overdueCount}
                    </span>
                  )}
                  <span className="font-mono text-[11px] tabular-nums text-neutral-400">{todayCount}</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectView('upcoming')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterState.view === 'upcoming'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Upcoming (7 Days)</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectView('completed')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterState.view === 'completed'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Completed Archive</span>
                </div>
                <span className="font-mono text-[11px] tabular-nums text-neutral-400">{completedCount}</span>
              </button>
            </div>
          </div>

          {/* Projects List */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">
                Projects
              </span>
              <button
                onClick={() => setIsAddingProject(!isAddingProject)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded transition-colors"
                title="Add new project"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isAddingProject && (
              <form onSubmit={handleCreateProject} className="p-2 mb-2 bg-neutral-50 dark:bg-neutral-800/70 rounded-lg border border-neutral-200 dark:border-neutral-700/60 space-y-2">
                <input
                  type="text"
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  className="w-full text-xs px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                />
                <div className="flex items-center gap-1.5">
                  {PROJECT_PALETTE.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        selectedColor === color ? 'scale-125 ring-2 ring-neutral-400 ring-offset-1 dark:ring-offset-neutral-900' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingProject(false)}
                    className="px-2 py-1 text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-[11px] font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-0.5">
              {projects.map((project) => {
                const count = tasks.filter((t) => t.projectId === project.id && !t.completed).length;
                const isSelected = filterState.view === project.id;

                return (
                  <div
                    key={project.id}
                    className={`group flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isSelected
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectView(project.id)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate">{project.name}</span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono text-[11px] tabular-nums text-neutral-400">{count}</span>
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete project "${project.name}"? Tasks will stay in Inbox.`)) {
                              onDeleteProject(project.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-rose-500 transition-opacity"
                          title="Delete project"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase px-2 mb-1.5">
                Tags
              </div>
              <div className="flex flex-wrap gap-1 px-1">
                {allTags.map((tag) => {
                  const isActive = filterState.tag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => handleSelectTag(tag)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors ${
                        isActive
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-medium'
                          : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Hash className="w-2.5 h-2.5 opacity-60" />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Utility Tools */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-1 shrink-0">
          <button
            onClick={() => {
              onOpenPomodoro();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 text-rose-500" />
              <span>Pomodoro Focus</span>
            </div>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
          </button>

          <button
            onClick={() => {
              onOpenAiReport();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 rounded-md transition-colors font-medium border border-indigo-200/50 dark:border-indigo-900/50"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Report & History</span>
            </div>
            <ChevronRight className="w-3 h-3 text-indigo-400" />
          </button>

          <button
            onClick={() => {
              onOpenAnalytics();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Productivity Stats</span>
            </div>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
          </button>

          <button
            onClick={() => {
              onOpenExportImport();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Export & Backup</span>
            </div>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
          </button>
        </div>
      </aside>
    </>
  );
};
