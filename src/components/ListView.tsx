import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Pin,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Clock,
  Timer,
  Edit3,
  Copy,
  Trash2,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { Task, Project, FilterState, Priority, SubTask } from '../types/todo';
import { formatRelativeDueDate } from '../utils/storage';

interface ListViewProps {
  tasks: Task[];
  projects: Project[];
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onTogglePin: (taskId: string) => void;
  onStartPomodoroForTask: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenNewTask: () => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  projects,
  filterState,
  setFilterState,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onTogglePin,
  onStartPomodoroForTask,
  onToggleSubtask,
  onOpenNewTask,
}) => {
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleSubtasksExpand = (taskId: string) => {
    setExpandedSubtasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Priority metadata
  const priorityInfo: Record<Priority, { label: string; textClass: string; dotClass: string }> = {
    urgent: { label: 'Urgent', textClass: 'text-rose-600 dark:text-rose-400 font-semibold', dotClass: 'bg-rose-500' },
    high: { label: 'High', textClass: 'text-amber-600 dark:text-amber-400 font-medium', dotClass: 'bg-amber-500' },
    medium: { label: 'Medium', textClass: 'text-blue-600 dark:text-blue-400', dotClass: 'bg-blue-500' },
    low: { label: 'Low', textClass: 'text-neutral-500 dark:text-neutral-400', dotClass: 'bg-neutral-400' },
  };

  // Group tasks if requested
  const renderTaskItem = (task: Task) => {
    const project = projectMap.get(task.projectId);
    const dateMeta = formatRelativeDueDate(task.dueDate);
    const subtaskCompletedCount = (task.subtasks || []).filter((s) => s.completed).length;
    const totalSubtasks = (task.subtasks || []).length;
    const isExpanded = !!expandedSubtasks[task.id];
    const isMenuOpen = activeMenuId === task.id;

    return (
      <div
        key={task.id}
        className={`group relative bg-white dark:bg-neutral-900 border rounded-xl transition-all ${
          task.completed
            ? 'border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/40 opacity-75'
            : task.isPinned
            ? 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10'
            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
        }`}
      >
        <div className="p-3 sm:p-4 flex items-start gap-3">
          {/* Checkbox */}
          <button
            type="button"
            onClick={() => onToggleTask(task.id)}
            className="mt-0.5 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
            ) : (
              <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0" onClick={() => onEditTask(task)}>
            <div className="flex items-center gap-2 cursor-pointer">
              {task.isPinned && (
                <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              )}
              <h3
                className={`text-sm font-medium leading-snug truncate ${
                  task.completed
                    ? 'line-through text-neutral-400 dark:text-neutral-500'
                    : 'text-neutral-900 dark:text-neutral-100'
                }`}
              >
                {task.title}
              </h3>
            </div>

            {task.description && (
              <p
                className={`text-xs mt-1 line-clamp-1 cursor-pointer ${
                  task.completed ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Clean Unboxed Metadata with Typographic Separator (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {/* Due Date */}
              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 font-mono tabular-nums ${
                    dateMeta.isOverdue && !task.completed
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : dateMeta.isToday && !task.completed
                      ? 'text-amber-600 dark:text-amber-400 font-medium'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  <span>{dateMeta.label}</span>
                </div>
              )}

              {task.dueDate && <span aria-hidden="true" className="opacity-40">·</span>}

              {/* Priority */}
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo[task.priority].dotClass}`} />
                <span className={priorityInfo[task.priority].textClass}>
                  {priorityInfo[task.priority].label}
                </span>
              </div>

              {project && (
                <>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate max-w-[130px]">{project.name}</span>
                  </div>
                </>
              )}

              {/* Subtasks trigger */}
              {totalSubtasks > 0 && (
                <>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubtasksExpand(task.id);
                    }}
                    className="flex items-center gap-1 font-mono text-[11px] tabular-nums hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    <span>
                      {subtaskCompletedCount}/{totalSubtasks} subtasks
                    </span>
                  </button>
                </>
              )}

              {/* Estimated / Completed Pomodoros */}
              {(task.estimatedPomodoros || 0) > 0 && (
                <>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px] tabular-nums">
                    <Timer className="w-3 h-3 text-rose-500" />
                    <span>
                      {task.completedPomodoros || 0}/{task.estimatedPomodoros}
                    </span>
                  </span>
                </>
              )}

              {/* Tags */}
              {(task.tags || []).map((tag) => (
                <span key={tag} className="font-mono text-[11px] opacity-70">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons on Hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {/* Start Pomodoro */}
            {!task.completed && (
              <button
                type="button"
                onClick={() => onStartPomodoroForTask(task)}
                className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                title="Focus on this task (25m Pomodoro)"
              >
                <Timer className="w-4 h-4" />
              </button>
            )}

            {/* Toggle Pin */}
            <button
              type="button"
              onClick={() => onTogglePin(task.id)}
              className={`p-1.5 rounded-md transition-colors ${
                task.isPinned
                  ? 'text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title={task.isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className="w-4 h-4" />
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => onEditTask(task)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
              title="Edit task"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Duplicate */}
            <button
              type="button"
              onClick={() => onDuplicateTask(task)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
              title="Duplicate task"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Subtasks Dropdown */}
        {isExpanded && totalSubtasks > 0 && (
          <div className="px-10 pb-3 pt-1 space-y-1.5 border-t border-neutral-100 dark:border-neutral-800/80">
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                onClick={() => onToggleSubtask(task.id, st.id)}
                className="flex items-center gap-2 cursor-pointer py-1 text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
              >
                {st.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                )}
                <span className={st.completed ? 'line-through text-neutral-400' : ''}>
                  {st.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Grouping logic
  const renderGroupedTasks = () => {
    if (filterState.groupBy === 'none') {
      return <div className="space-y-2">{tasks.map((task) => renderTaskItem(task))}</div>;
    }

    if (filterState.groupBy === 'priority') {
      const order: Priority[] = ['urgent', 'high', 'medium', 'low'];
      return (
        <div className="space-y-6">
          {order.map((p) => {
            const groupTasks = tasks.filter((t) => t.priority === p);
            if (groupTasks.length === 0) return null;
            return (
              <div key={p} className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <span className={`w-2 h-2 rounded-full ${priorityInfo[p].dotClass}`} />
                  <span>{priorityInfo[p].label}</span>
                  <span className="font-mono tabular-nums text-neutral-400">({groupTasks.length})</span>
                </div>
                <div className="space-y-2">{groupTasks.map((t) => renderTaskItem(t))}</div>
              </div>
            );
          })}
        </div>
      );
    }

    if (filterState.groupBy === 'project') {
      return (
        <div className="space-y-6">
          {projects.map((proj) => {
            const groupTasks = tasks.filter((t) => t.projectId === proj.id);
            if (groupTasks.length === 0) return null;
            return (
              <div key={proj.id} className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.color }} />
                  <span>{proj.name}</span>
                  <span className="font-mono tabular-nums text-neutral-400 text-xs">({groupTasks.length})</span>
                </div>
                <div className="space-y-2">{groupTasks.map((t) => renderTaskItem(t))}</div>
              </div>
            );
          })}
        </div>
      );
    }

    // Default by Due Date
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr);
    const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
    const futureTasks = tasks.filter((t) => t.dueDate && t.dueDate > todayStr);
    const noDateTasks = tasks.filter((t) => !t.dueDate);

    return (
      <div className="space-y-6">
        {overdueTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-rose-200 dark:border-rose-950 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Overdue</span>
              <span className="font-mono tabular-nums">({overdueTasks.length})</span>
            </div>
            <div className="space-y-2">{overdueTasks.map((t) => renderTaskItem(t))}</div>
          </div>
        )}

        {todayTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-amber-200 dark:border-amber-950 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Today</span>
              <span className="font-mono tabular-nums">({todayTasks.length})</span>
            </div>
            <div className="space-y-2">{todayTasks.map((t) => renderTaskItem(t))}</div>
          </div>
        )}

        {futureTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Later</span>
              <span className="font-mono tabular-nums">({futureTasks.length})</span>
            </div>
            <div className="space-y-2">{futureTasks.map((t) => renderTaskItem(t))}</div>
          </div>
        )}

        {noDateTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <span>No Due Date</span>
              <span className="font-mono tabular-nums">({noDateTasks.length})</span>
            </div>
            <div className="space-y-2">{noDateTasks.map((t) => renderTaskItem(t))}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Grouping, Sorting, and Priority Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Quick Filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-0.5 rounded-lg">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterState((prev) => ({ ...prev, priority: p }))}
                className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                  filterState.priority === p
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Group By selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-1 rounded-lg">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] text-neutral-400">Group:</span>
            <select
              value={filterState.groupBy}
              onChange={(e) => setFilterState((prev) => ({ ...prev, groupBy: e.target.value as any }))}
              className="bg-transparent text-[11px] font-medium text-neutral-800 dark:text-neutral-200 border-none focus:outline-hidden cursor-pointer"
            >
              <option value="none" className="dark:bg-neutral-900">None</option>
              <option value="dueDate" className="dark:bg-neutral-900">Due Date</option>
              <option value="priority" className="dark:bg-neutral-900">Priority</option>
              <option value="project" className="dark:bg-neutral-900">Project</option>
            </select>
          </div>
        </div>

        {/* Sort By selector */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-1 rounded-lg">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[11px] text-neutral-400">Sort:</span>
          <select
            value={filterState.sortBy}
            onChange={(e) => setFilterState((prev) => ({ ...prev, sortBy: e.target.value as any }))}
            className="bg-transparent text-[11px] font-medium text-neutral-800 dark:text-neutral-200 border-none focus:outline-hidden cursor-pointer"
          >
            <option value="dueDate" className="dark:bg-neutral-900">Due Date</option>
            <option value="priority" className="dark:bg-neutral-900">Priority</option>
            <option value="title" className="dark:bg-neutral-900">Title (A-Z)</option>
            <option value="createdAt" className="dark:bg-neutral-900">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Task List or Empty State */}
      {tasks.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
            No tasks found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            {filterState.search || filterState.priority !== 'all' || filterState.tag !== 'all'
              ? 'Try clearing active search or filters to see more tasks.'
              : 'You have zero pending items in this view. Take a breather or create your next objective.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            {(filterState.search || filterState.priority !== 'all' || filterState.tag !== 'all') && (
              <button
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    search: '',
                    priority: 'all',
                    tag: 'all',
                  }))
                }
                className="px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Task</span>
            </button>
          </div>
        </div>
      ) : (
        renderGroupedTasks()
      )}
    </div>
  );
};
