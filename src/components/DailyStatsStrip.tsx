import React from 'react';
import { CheckCircle2, Clock, Flame, Timer, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { Task } from '../types/todo';
import { getTodayString } from '../utils/storage';

interface DailyStatsStripProps {
  tasks: Task[];
  onOpenAiReport: () => void;
  onOpenPomodoro: () => void;
  onFilterOverdue?: () => void;
  onFilterToday?: () => void;
}

export const DailyStatsStrip: React.FC<DailyStatsStripProps> = ({
  tasks,
  onOpenAiReport,
  onOpenPomodoro,
  onFilterOverdue,
  onFilterToday,
}) => {
  const todayStr = getTodayString();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr);

  const completedPomodoroBlocks = tasks.reduce((sum, t) => sum + (t.completedPomodoros || 0), 0);
  const focusMinutes = completedPomodoroBlocks * 25;

  const todayPercentage = todayTasks.length > 0
    ? Math.round((todayCompleted / todayTasks.length) * 100)
    : totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Metric 1: Daily Progress */}
        <div className="flex items-center gap-3.5 pr-2 sm:border-r border-neutral-100 dark:border-neutral-800/80">
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-100 dark:text-neutral-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeDasharray={`${todayPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-[11px] font-bold tabular-nums text-neutral-800 dark:text-neutral-200">
              {todayPercentage}%
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Today's Velocity
            </span>
            <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">
              {todayCompleted} of {todayTasks.length || totalTasks} Done
            </div>
            <span className="text-[11px] text-neutral-500 truncate block">
              {todayPercentage === 100
                ? 'All clear today!'
                : `${(todayTasks.length || totalTasks) - todayCompleted} remaining`}
            </span>
          </div>
        </div>

        {/* Metric 2: Overdue & Critical Focus */}
        <div
          onClick={onFilterOverdue}
          className={`flex items-center gap-3.5 pr-2 sm:border-r border-neutral-100 dark:border-neutral-800/80 p-1 rounded-xl transition-colors ${
            overdueTasks.length > 0 ? 'cursor-pointer hover:bg-rose-50/50 dark:hover:bg-rose-950/20' : ''
          }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            overdueTasks.length > 0
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
          }`}>
            {overdueTasks.length > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            )}
          </div>

          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Attention Queue
            </span>
            <div className="text-sm font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
              {overdueTasks.length > 0 ? `${overdueTasks.length} Overdue` : 'Zero Overdue'}
            </div>
            <span className="text-[11px] text-neutral-500 truncate block">
              {overdueTasks.length > 0 ? 'Click to inspect blockers' : 'On schedule'}
            </span>
          </div>
        </div>

        {/* Metric 3: Deep Work Focus Hours */}
        <div
          onClick={onOpenPomodoro}
          className="flex items-center gap-3.5 pr-2 lg:border-r border-neutral-100 dark:border-neutral-800/80 p-1 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Deep Work Time
            </span>
            <div className="text-sm font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
              {focusMinutes > 0 ? `${Math.floor(focusMinutes / 60)}h ${focusMinutes % 60}m` : '0m logged'}
            </div>
            <span className="text-[11px] text-neutral-500 truncate block">
              {completedPomodoroBlocks} focus sessions · Click to run
            </span>
          </div>
        </div>

        {/* Action: AI Executive Digest Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <button
            onClick={onOpenAiReport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-xs hover:shadow-md shrink-0"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
            <span>AI Performance Digest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
