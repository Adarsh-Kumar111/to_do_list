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
  color: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'backlog', title: 'Backlog', color: 'border-neutral-300 dark:border-neutral-700' },
  { id: 'todo', title: 'To Do', color: 'border-blue-400 dark:border-blue-600' },
  { id: 'in_progress', title: 'In Progress', color: 'border-amber-400 dark:border-amber-600' },
  { id: 'review', title: 'In Review', color: 'border-purple-400 dark:border-purple-600' },
  { id: 'done', title: 'Done', color: 'border-emerald-400 dark:border-emerald-600' },
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
    urgent: 'bg-rose-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-neutral-400',
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
            className="w-80 shrink-0 flex flex-col bg-neutral-100/70 dark:bg-neutral-900/60 rounded-xl p-3 border border-neutral-200/80 dark:border-neutral-800"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
                  {col.title}
                </span>
                <span className="font-mono text-xs tabular-nums text-neutral-400 dark:text-neutral-500 bg-neutral-200/70 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onOpenNewTaskWithStatus(col.id)}
                className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
              {columnTasks.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg">
                  <span className="text-xs text-neutral-400">Empty column</span>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const project = projectMap.get(task.projectId);
                  const dateMeta = formatRelativeDueDate(task.dueDate);
                  const prevStatus = getPrevStatus(task.status);
                  const nextStatus = getNextStatus(task.status);
                  const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
                  const totalSubtasks = (task.subtasks || []).length;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className={`group p-3 bg-white dark:bg-neutral-900 border rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer ${
                        task.isPinned
                          ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20'
                          : 'border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      {/* Priority, Pinned, Project Indicator */}
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority]}`} />
                          <span className="capitalize text-neutral-500">{task.priority}</span>
                          {project && (
                            <>
                              <span className="opacity-40">·</span>
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="text-neutral-500 truncate max-w-[90px]">
                                {project.name}
                              </span>
                            </>
                          )}
                        </div>

                        {task.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-xs font-medium leading-snug line-clamp-2 ${
                          task.status === 'done'
                            ? 'line-through text-neutral-400'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Subtasks or Description indicator */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-400">
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

                        {totalSubtasks > 0 && (
                          <span className="font-mono tabular-nums">
                            {completedSubtasks}/{totalSubtasks} steps
                          </span>
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
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, nextStatus)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                              title={`Move to ${nextStatus}`}
                            >
                              <ChevronRight className="w-3 h-3" />
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
