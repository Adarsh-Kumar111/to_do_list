import React, { useState } from 'react';
import { Plus, Calendar, Flag, Folder, CornerDownLeft } from 'lucide-react';
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
    activeProjectId && activeProjectId !== 'all' && activeProjectId !== 'today' && activeProjectId !== 'upcoming' && activeProjectId !== 'completed'
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
    urgent: 'text-rose-600 dark:text-rose-400',
    high: 'text-amber-600 dark:text-amber-400',
    medium: 'text-blue-600 dark:text-blue-400',
    low: 'text-neutral-500 dark:text-neutral-400',
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all shadow-xs ${
        isExpanded ? 'ring-1 ring-neutral-400 dark:ring-neutral-600 p-3' : 'p-2.5'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-400 shrink-0">
          <Plus className="w-3.5 h-3.5" />
        </div>

        <input
          type="text"
          placeholder="Add a new task... (e.g. 'Deploy release notes' - press Enter to save)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="flex-1 text-xs sm:text-sm bg-transparent border-none text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden"
        />

        {title.trim() && (
          <button
            type="submit"
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shrink-0"
          >
            <span>Add</span>
            <CornerDownLeft className="w-3 h-3 opacity-70" />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Due date quick buttons */}
            <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 p-1 rounded-md border border-neutral-200/60 dark:border-neutral-700/60">
              <Calendar className="w-3.5 h-3.5 text-neutral-400 ml-1" />
              <button
                type="button"
                onClick={() => setDueDate(getTodayString())}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  dueDate === getTodayString()
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDueDate(getOffsetDateString(1))}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  dueDate === getOffsetDateString(1)
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Tomorrow
              </button>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-[11px] bg-transparent text-neutral-700 dark:text-neutral-300 border-none focus:outline-hidden cursor-pointer"
              />
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 p-1 rounded-md border border-neutral-200/60 dark:border-neutral-700/60">
              <Flag className={`w-3.5 h-3.5 ${priorityColors[priority]} ml-1`} />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="text-[11px] font-medium bg-transparent text-neutral-700 dark:text-neutral-300 border-none focus:outline-hidden cursor-pointer"
              >
                <option value="urgent" className="dark:bg-neutral-800">Urgent</option>
                <option value="high" className="dark:bg-neutral-800">High</option>
                <option value="medium" className="dark:bg-neutral-800">Medium</option>
                <option value="low" className="dark:bg-neutral-800">Low</option>
              </select>
            </div>

            {/* Project Selector */}
            <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 p-1 rounded-md border border-neutral-200/60 dark:border-neutral-700/60">
              <Folder className="w-3.5 h-3.5 text-neutral-400 ml-1" />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="text-[11px] font-medium bg-transparent text-neutral-700 dark:text-neutral-300 border-none focus:outline-hidden cursor-pointer max-w-[140px] truncate"
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
            className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            Collapse
          </button>
        </div>
      )}
    </form>
  );
};
