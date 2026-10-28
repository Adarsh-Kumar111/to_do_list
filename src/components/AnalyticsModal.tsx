import React from 'react';
import { X, CheckCircle2, TrendingUp, AlertCircle, Clock, BarChart2, Flame } from 'lucide-react';
import { Task, Project } from '../types/todo';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
}) => {
  if (!isOpen) return null;

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  const priorityCounts = {
    urgent: tasks.filter((t) => t.priority === 'urgent' && !t.completed).length,
    high: tasks.filter((t) => t.priority === 'high' && !t.completed).length,
    medium: tasks.filter((t) => t.priority === 'medium' && !t.completed).length,
    low: tasks.filter((t) => t.priority === 'low' && !t.completed).length,
  };

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              Productivity & Analytics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/60 dark:border-neutral-750">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Done Rate
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
              {completionRate}%
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">
              {completed}/{total} tasks
            </span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/60 dark:border-neutral-750">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Active Pending
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
              {pending}
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">in progress</span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/60 dark:border-neutral-750">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Overdue
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {overdueCount}
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">needs attention</span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/60 dark:border-neutral-750">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Streak</span>
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              5d
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">daily consistency</span>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
            Active Priority Distribution
          </h4>
          <div className="space-y-2">
            {[
              { label: 'Urgent', count: priorityCounts.urgent, color: 'bg-rose-500' },
              { label: 'High', count: priorityCounts.high, color: 'bg-amber-500' },
              { label: 'Medium', count: priorityCounts.medium, color: 'bg-blue-500' },
              { label: 'Low', count: priorityCounts.low, color: 'bg-neutral-400' },
            ].map((p) => {
              const pct = pending > 0 ? Math.round((p.count / pending) * 100) : 0;
              return (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                    <span>{p.label}</span>
                    <span className="font-mono tabular-nums text-[11px]">
                      {p.count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${p.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
            Workspaces & Projects
          </h4>
          <div className="space-y-2.5">
            {projects.map((proj) => {
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const projDone = projTasks.filter((t) => t.completed).length;
              const rate = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;

              return (
                <div
                  key={proj.id}
                  className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/60 dark:border-neutral-750"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.color }} />
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                        {proj.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs tabular-nums text-neutral-500">
                      {projDone}/{projTasks.length} ({rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200/70 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-neutral-900 dark:bg-white" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
