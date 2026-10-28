import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Timer,
  Sparkles,
  ListTodo,
  Kanban,
  Grid2X2,
  CalendarDays,
  Moon,
  Sun,
  Download,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Task, ViewMode } from '../types/todo';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onOpenPomodoro: () => void;
  onOpenAiReport: () => void;
  onOpenExportImport: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
  setViewMode: (mode: ViewMode) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
  onOpenNewTask,
  onOpenPomodoro,
  onOpenAiReport,
  onOpenExportImport,
  onToggleDarkMode,
  isDarkMode,
  setViewMode,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Actions list
  const actions = [
    {
      id: 'act-new-task',
      title: 'Create New Task',
      shortcut: 'N',
      icon: Plus,
      run: () => onOpenNewTask(),
    },
    {
      id: 'act-ai-report',
      title: 'Generate AI Productivity Report (Gemini)',
      shortcut: 'AI',
      icon: Sparkles,
      run: () => onOpenAiReport(),
    },
    {
      id: 'act-pomodoro',
      title: 'Start Pomodoro Focus Timer (25m)',
      shortcut: 'P',
      icon: Timer,
      run: () => onOpenPomodoro(),
    },
    {
      id: 'act-view-list',
      title: 'Switch to List View',
      shortcut: '1',
      icon: ListTodo,
      run: () => setViewMode('list'),
    },
    {
      id: 'act-view-board',
      title: 'Switch to Kanban Board View',
      shortcut: '2',
      icon: Kanban,
      run: () => setViewMode('board'),
    },
    {
      id: 'act-view-matrix',
      title: 'Switch to Priority Matrix View',
      shortcut: '3',
      icon: Grid2X2,
      run: () => setViewMode('matrix'),
    },
    {
      id: 'act-view-calendar',
      title: 'Switch to Calendar View',
      shortcut: '4',
      icon: CalendarDays,
      run: () => setViewMode('calendar'),
    },
    {
      id: 'act-theme',
      title: isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      shortcut: 'T',
      icon: isDarkMode ? Sun : Moon,
      run: () => onToggleDarkMode(),
    },
    {
      id: 'act-backup',
      title: 'Export / Backup Workspace (JSON & CSV)',
      shortcut: 'E',
      icon: Download,
      run: () => onOpenExportImport(),
    },
  ];

  // Filter tasks & actions by query
  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = query.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          (t.description || '').toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const combinedItems = [
    ...filteredActions.map((a) => ({ type: 'action' as const, data: a })),
    ...filteredTasks.map((t) => ({ type: 'task' as const, data: t })),
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, combinedItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + combinedItems.length) % Math.max(1, combinedItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = combinedItems[selectedIndex];
        if (selected) {
          if (selected.type === 'action') {
            selected.data.run();
          } else {
            onSelectTask(selected.data);
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, combinedItems, onClose, onSelectTask]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search tasks..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full text-sm bg-transparent border-none text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {combinedItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No matching commands or tasks found
            </div>
          ) : (
            combinedItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              if (item.type === 'action') {
                const action = item.data;
                const Icon = action.icon;

                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.run();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{action.title}</span>
                    </div>

                    <kbd
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-neutral-800 dark:bg-neutral-200 text-neutral-200 dark:text-neutral-800'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {action.shortcut}
                    </kbd>
                  </button>
                );
              }

              // Task Item
              const task = item.data;
              return (
                <button
                  key={task.id}
                  onClick={() => {
                    onSelectTask(task);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        task.completed ? 'text-emerald-500' : 'text-neutral-400'
                      }`}
                    />
                    <span className={`truncate ${task.completed ? 'line-through opacity-60' : ''}`}>
                      {task.title}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-mono capitalize shrink-0 ml-2 ${
                      isSelected ? 'opacity-80' : 'text-neutral-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-[11px] text-neutral-400">
          <span>
            Navigate with <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd>
          </span>
          <span>
            Select with <kbd className="font-mono">↵</kbd>
          </span>
        </div>
      </div>
    </div>
  );
};
