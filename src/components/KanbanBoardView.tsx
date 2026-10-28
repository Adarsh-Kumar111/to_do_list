import React from 'react';
import {
  Plus,
  Calendar,
  Pin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Timer,
} from 'lucide-react';
import { Task, Project, TaskStatus, Priority } from '../types/todo';
import { formatRelativeDueDate } from '../utils/storage';

interface KanbanBoardViewProps {
  tasks: Task[];
  projects: Project[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskWithStatus: (status: TaskStatus) => void;
}

interface ColumnDef {
  id: TaskStatus;
  title: string;
  badgeBg: string;
  topAccent: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'backlog', title: 'Backlog', badgeBg: 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400', topAccent: 'border-t-neutral-400' },
  { id: 'todo', title: 'To Do', badgeBg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300', topAccent: 'border-t-blue-500' },
  { id: 'in_progress', title: 'In Progress', badgeBg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300', topAccent: 'border-t-amber-500' },
  { id: 'review', title: 'In Review', badgeBg: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300', topAccent: 'border-t-purple-500' },
  { id: 'done', title: 'Completed', badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300', topAccent: 'border-t-emerald-500' },
];

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  tasks,
  projects,
  onUpdateTaskStatus,
  onEditTask,
  onOpenNewTaskWithStatus,
}) => {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const priorityColors: Record<Priority, string> = {
    urgent: 'bg-rose-500 text-rose-600 dark:text-rose-400',
    high: 'bg-amber-500 text-amber-600 dark:text-amber-400',
    medium: 'bg-blue-500 text-blue-600 dark:text-blue-400',
    low: 'bg-neutral-400 text-neutral-500 dark:text-neutral-400',
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const idx = COLUMNS.findIndex((c) => c.id === current);
    if (idx < COLUMNS.length - 1) return COLUMNS[idx + 1].id;
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    const idx = COLUMNS.findIndex((c) => c.id === current);
    if (idx > 0) return COLUMNS[idx - 1].id;
    return null;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-220px)] items-start">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className={`w-80 shrink-0 flex flex-col bg-neutral-100/60 dark:bg-neutral-900/50 rounded-2xl p-3.5 border border-neutral-200/90 dark:border-neutral-800 shadow-xs border-t-4 ${col.topAccent}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-200/70 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  {col.title}
                </span>
                <span className={`font-mono text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onOpenNewTaskWithStatus(col.id)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
              {columnTasks.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                  <span className="text-xs text-neutral-400 font-medium">No tasks in {col.title}</span>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const project = projectMap.get(task.projectId);
                  const dateMeta = formatRelativeDueDate(task.dueDate);
                  const prevStatus = getPrevStatus(task.status);
                  const nextStatus = getNextStatus(task.status);
                  const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
                  const totalSubtasks = (task.subtasks || []).length;
                  const subtaskPct = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className={`group p-3.5 bg-white dark:bg-neutral-900 border rounded-xl shadow-xs hover:shadow-md hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer ${
                        task.isPinned
                          ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/15'
                          : 'border-neutral-200/90 dark:border-neutral-800'
                      }`}
                    >
                      {/* Priority, Pinned, Project Indicator */}
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority].split(' ')[0]}`} />
                          <span className="capitalize font-medium text-neutral-600 dark:text-neutral-400">
                            {task.priority}
                          </span>
                          {project && (
                            <>
                              <span className="opacity-30">·</span>
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="text-neutral-500 truncate max-w-[90px]">
                                {project.name}
                              </span>
                            </>
                          )}
                        </div>

                        {task.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-xs font-semibold leading-snug line-clamp-2 ${
                          task.status === 'done'
                            ? 'line-through text-neutral-400'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Subtasks Progress mini bar */}
                      {totalSubtasks > 0 && (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-neutral-400 mb-1">
                            <span>Steps</span>
                            <span>{completedSubtasks}/{totalSubtasks}</span>
                          </div>
                          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${subtaskPct}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Due date and action arrows */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-400">
                        {task.dueDate ? (
                          <div
                            className={`flex items-center gap-1 font-mono tabular-nums ${
                              dateMeta.isOverdue && task.status !== 'done'
                                ? 'text-rose-500 font-semibold'
                                : 'text-neutral-500'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{dateMeta.label}</span>
                          </div>
                        ) : (
                          <span />
                        )}

                        {/* Move Left / Right Buttons */}
                        <div
                          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {prevStatus && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, prevStatus)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                              title={`Move to ${prevStatus}`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, nextStatus)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                              title={`Move to ${nextStatus}`}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
