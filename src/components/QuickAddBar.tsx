import React, { useState } from 'react';
import { Plus, Calendar, Flag, Folder, CornerDownLeft, Sparkles, Tag } from 'lucide-react';
import { Priority, Project } from '../types/todo';
import { getTodayString, getOffsetDateString } from '../utils/storage';

interface QuickAddBarProps {
  projects: Project[];
  activeProjectId?: string;
  onAddTask: (taskData: {
    title: string;
    dueDate?: string;
    priority: Priority;
    projectId: string;
  }) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  projects,
  activeProjectId,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>(getTodayString());
  const [projectId, setProjectId] = useState<string>(
    activeProjectId &&
      activeProjectId !== 'all' &&
      activeProjectId !== 'today' &&
      activeProjectId !== 'upcoming' &&
      activeProjectId !== 'completed'
      ? activeProjectId
      : projects[0]?.id || 'proj-1'
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      dueDate: dueDate || undefined,
      priority,
      projectId,
    });

    setTitle('');
    setIsExpanded(false);
  };

  const priorityColors: Record<Priority, string> = {
    urgent: 'bg-rose-500 text-rose-500',
    high: 'bg-amber-500 text-amber-500',
    medium: 'bg-blue-500 text-blue-500',
    low: 'bg-neutral-400 text-neutral-400',
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl transition-all shadow-xs ${
        isExpanded ? 'ring-2 ring-neutral-900/10 dark:ring-white/10 p-4' : 'p-3'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 shrink-0">
          <Plus className="w-4 h-4" />
        </div>

        <input
          type="text"
          placeholder="What do you need to accomplish? Type and press Enter..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="flex-1 text-xs sm:text-sm bg-transparent border-none text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden font-medium"
        />

        {title.trim() && (
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shrink-0 shadow-xs"
          >
            <span>Save Task</span>
            <CornerDownLeft className="w-3.5 h-3.5 opacity-70" />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Due date quick buttons */}
            <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/80 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
              <Calendar className="w-3.5 h-3.5 text-neutral-400 ml-1.5" />
              <button
                type="button"
                onClick={() => setDueDate(getTodayString())}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  dueDate === getTodayString()
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDueDate(getOffsetDateString(1))}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  dueDate === getOffsetDateString(1)
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDueDate(getOffsetDateString(7))}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                  dueDate === getOffsetDateString(7)
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                In 1 Week
              </button>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-[11px] bg-transparent text-neutral-700 dark:text-neutral-300 border-none focus:outline-hidden cursor-pointer ml-1"
              />
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/80 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
              <Flag className="w-3.5 h-3.5 text-neutral-400 ml-1.5" />
              {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] capitalize transition-colors ${
                    priority === p
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Project Selector */}
            <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/80 px-2.5 py-1.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
              <Folder className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="text-[11px] font-medium bg-transparent text-neutral-700 dark:text-neutral-300 border-none focus:outline-hidden cursor-pointer max-w-[130px] truncate"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-neutral-800">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 px-2 py-1"
          >
            Done
          </button>
        </div>
      )}
    </form>
  );
};
