import React from 'react';
import { Plus, CheckCircle2, Circle, Calendar, AlertCircle } from 'lucide-react';
import { Task, Project, Priority } from '../types/todo';
import { formatRelativeDueDate } from '../utils/storage';

interface EisenhowerMatrixViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onChangePriority: (taskId: string, newPriority: Priority) => void;
  onOpenNewTaskWithPriority: (priority: Priority) => void;
}

interface QuadrantDef {
  priority: Priority;
  title: string;
  subtitle: string;
  badge: string;
  badgeBg: string;
}

const QUADRANTS: QuadrantDef[] = [
  {
    priority: 'urgent',
    title: 'Urgent & Important',
    subtitle: 'Crisis, deadlines & critical production blockers',
    badge: 'Do First',
    badgeBg: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900',
  },
  {
    priority: 'high',
    title: 'Not Urgent, but Important',
    subtitle: 'Strategic architecture, health, learning & planning',
    badge: 'Schedule',
    badgeBg: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
  },
  {
    priority: 'medium',
    title: 'Urgent, but Not Important',
    subtitle: 'Interruptions, ad-hoc requests & meetings',
    badge: 'Delegate',
    badgeBg: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
  },
  {
    priority: 'low',
    title: 'Not Urgent & Not Important',
    subtitle: 'Trivial backlog, time sinks & nice-to-haves',
    badge: 'Eliminate / Backlog',
    badgeBg: 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
  },
];

export const EisenhowerMatrixView: React.FC<EisenhowerMatrixViewProps> = ({
  tasks,
  projects,
  onToggleTask,
  onEditTask,
  onChangePriority,
  onOpenNewTaskWithPriority,
}) => {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6 min-h-[calc(100vh-220px)]">
      {QUADRANTS.map((quad) => {
        const quadrantTasks = tasks.filter((t) => t.priority === quad.priority && !t.completed);
        const completedCount = tasks.filter((t) => t.priority === quad.priority && t.completed).length;

        return (
          <div
            key={quad.priority}
            className="flex flex-col bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-xs"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${quad.badgeBg}`}>
                    {quad.badge}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-neutral-400">
                    {quadrantTasks.length} pending
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {quad.title}
                </h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {quad.subtitle}
                </p>
              </div>

              <button
                onClick={() => onOpenNewTaskWithPriority(quad.priority)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                title={`Add task to ${quad.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards in Quadrant */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] pr-1">
              {quadrantTasks.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                  <span className="text-xs text-neutral-400">No active tasks in this quadrant</span>
                </div>
              ) : (
                quadrantTasks.map((task) => {
                  const project = projectMap.get(task.projectId);
                  const dateMeta = formatRelativeDueDate(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className="group flex items-start gap-2.5 p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 hover:bg-white dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTask(task.id);
                        }}
                        className="mt-0.5 text-neutral-400 hover:text-emerald-500 shrink-0"
                      >
                        <Circle className="w-4 h-4" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {task.title}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400 font-mono tabular-nums">
                          {task.dueDate && (
                            <span
                              className={`flex items-center gap-1 ${
                                dateMeta.isOverdue ? 'text-rose-500 font-medium' : ''
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{dateMeta.label}</span>
                            </span>
                          )}

                          {project && (
                            <>
                              <span aria-hidden="true" className="opacity-40">·</span>
                              <span className="truncate max-w-[100px] text-neutral-500">
                                {project.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Move to another priority quadrant selector */}
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={task.priority}
                          onChange={(e) => onChangePriority(task.id, e.target.value as Priority)}
                          className="text-[10px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1 py-0.5 text-neutral-600 dark:text-neutral-300"
                          title="Move to another quadrant"
                        >
                          <option value="urgent">Do First</option>
                          <option value="high">Schedule</option>
                          <option value="medium">Delegate</option>
                          <option value="low">Eliminate</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
