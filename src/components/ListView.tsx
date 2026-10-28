import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Pin,
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
  Check,
} from 'lucide-react';
import { Task, Project, FilterState, Priority } from '../types/todo';
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
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSubtasksExpand = (taskId: string) => {
    setExpandedSubtasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Priority metadata
  const priorityInfo: Record<Priority, { label: string; textClass: string; dotClass: string; bgClass: string }> = {
    urgent: {
      label: 'Urgent',
      textClass: 'text-rose-700 dark:text-rose-300 font-semibold',
      dotClass: 'bg-rose-500',
      bgClass: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
    },
    high: {
      label: 'High',
      textClass: 'text-amber-700 dark:text-amber-300 font-medium',
      dotClass: 'bg-amber-500',
      bgClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    },
    medium: {
      label: 'Medium',
      textClass: 'text-blue-700 dark:text-blue-300',
      dotClass: 'bg-blue-500',
      bgClass: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
    },
    low: {
      label: 'Low',
      textClass: 'text-neutral-600 dark:text-neutral-400',
      dotClass: 'bg-neutral-400',
      bgClass: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
    },
  };

  // Render individual task card with clean separation
  const renderTaskItem = (task: Task) => {
    const project = projectMap.get(task.projectId);
    const dateMeta = formatRelativeDueDate(task.dueDate);
    const subtasks = task.subtasks || [];
    const subtaskCompletedCount = subtasks.filter((s) => s.completed).length;
    const totalSubtasks = subtasks.length;
    const isExpanded = !!expandedSubtasks[task.id];
    const subtaskPercentage = totalSubtasks > 0 ? Math.round((subtaskCompletedCount / totalSubtasks) * 100) : 0;

    return (
      <div
        key={task.id}
        className={`group relative bg-white dark:bg-neutral-900 border rounded-xl transition-all duration-150 ${
          task.completed
            ? 'border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/40 dark:bg-neutral-900/40 opacity-70'
            : task.isPinned
            ? 'border-amber-300/80 dark:border-amber-900/60 bg-amber-50/15 dark:bg-amber-950/10 shadow-xs'
            : 'border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-400 dark:hover:border-neutral-700 hover:shadow-xs'
        }`}
      >
        <div className="p-3.5 sm:p-4 flex items-start gap-3">
          {/* Interactive Checkbox with Micro-feedback */}
          <button
            type="button"
            onClick={() => onToggleTask(task.id)}
            className="mt-0.5 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-transform active:scale-90 shrink-0"
            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            ) : (
              <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0" onClick={() => onEditTask(task)}>
            <div className="flex items-center gap-2 cursor-pointer">
              {task.isPinned && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded">
                  <Pin className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                  <span>Pinned</span>
                </span>
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

            {/* Separated Metadata Row */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-neutral-500 dark:text-neutral-400">
              {/* Due Date Indicator */}
              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 font-mono text-[11px] tabular-nums ${
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

              {task.dueDate && <span aria-hidden="true" className="opacity-30">·</span>}

              {/* Priority Label */}
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo[task.priority].dotClass}`} />
                <span className={`text-[11px] font-medium ${priorityInfo[task.priority].textClass}`}>
                  {priorityInfo[task.priority].label}
                </span>
              </div>

              {/* Project Badge */}
              {project && (
                <>
                  <span aria-hidden="true" className="opacity-30">·</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate max-w-[130px] text-[11px] text-neutral-600 dark:text-neutral-400">
                      {project.name}
                    </span>
                  </div>
                </>
              )}

              {/* Subtasks Progress */}
              {totalSubtasks > 0 && (
                <>
                  <span aria-hidden="true" className="opacity-30">·</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubtasksExpand(task.id);
                    }}
                    className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${subtaskPercentage}%` }}
                      />
                    </div>
                    <span>
                      {subtaskCompletedCount}/{totalSubtasks}
                    </span>
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                </>
              )}

              {/* Estimated / Completed Pomodoros */}
              {(task.estimatedPomodoros || 0) > 0 && (
                <>
                  <span aria-hidden="true" className="opacity-30">·</span>
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
                <span
                  key={tag}
                  className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons on Hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {!task.completed && (
              <button
                type="button"
                onClick={() => onStartPomodoroForTask(task)}
                className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                title="Focus on this task (Pomodoro 25m)"
              >
                <Timer className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onTogglePin(task.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                task.isPinned
                  ? 'text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title={task.isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onEditTask(task)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Edit task"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onDuplicateTask(task)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Duplicate task"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Subtasks Dropdown */}
        {isExpanded && totalSubtasks > 0 && (
          <div className="px-10 pb-3 pt-1 space-y-1.5 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/30 dark:bg-neutral-900/30">
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

  // Group container wrapper with collapse & count
  const renderSectionContainer = (
    id: string,
    title: string,
    icon: React.ReactNode,
    sectionTasks: Task[],
    headerClass?: string
  ) => {
    const isCollapsed = !!collapsedSections[id];

    return (
      <div
        key={id}
        className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
      >
        <div
          onClick={() => toggleSectionCollapse(id)}
          className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-neutral-100 dark:border-neutral-800/80"
        >
          <div className="flex items-center gap-2">
            {icon}
            <h3 className={`text-xs font-bold uppercase tracking-wider ${headerClass || 'text-neutral-900 dark:text-white'}`}>
              {title}
            </h3>
            <span className="font-mono text-xs tabular-nums bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full font-semibold">
              {sectionTasks.length}
            </span>
          </div>

          <button
            type="button"
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="space-y-2.5 pt-1">
            {sectionTasks.map((t) => renderTaskItem(t))}
          </div>
        )}
      </div>
    );
  };

  // Grouping logic with distinct separated sections
  const renderGroupedTasks = () => {
    if (filterState.groupBy === 'none') {
      return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
          {tasks.map((task) => renderTaskItem(task))}
        </div>
      );
    }

    if (filterState.groupBy === 'priority') {
      const order: Priority[] = ['urgent', 'high', 'medium', 'low'];
      return (
        <div className="space-y-4">
          {order.map((p) => {
            const groupTasks = tasks.filter((t) => t.priority === p);
            if (groupTasks.length === 0) return null;
            return renderSectionContainer(
              `priority-${p}`,
              priorityInfo[p].label,
              <span className={`w-2.5 h-2.5 rounded-full ${priorityInfo[p].dotClass}`} />,
              groupTasks,
              priorityInfo[p].textClass
            );
          })}
        </div>
      );
    }

    if (filterState.groupBy === 'project') {
      return (
        <div className="space-y-4">
          {projects.map((proj) => {
            const groupTasks = tasks.filter((t) => t.projectId === proj.id);
            if (groupTasks.length === 0) return null;
            return renderSectionContainer(
              `project-${proj.id}`,
              proj.name,
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.color }} />,
              groupTasks
            );
          })}
        </div>
      );
    }

    // Default by Due Date: Overdue, Today, Later, No Due Date
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr);
    const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
    const futureTasks = tasks.filter((t) => t.dueDate && t.dueDate > todayStr);
    const noDateTasks = tasks.filter((t) => !t.dueDate);

    return (
      <div className="space-y-4">
        {overdueTasks.length > 0 &&
          renderSectionContainer(
            'section-overdue',
            'Overdue Bottlenecks',
            <AlertCircle className="w-4 h-4 text-rose-500" />,
            overdueTasks,
            'text-rose-600 dark:text-rose-400'
          )}

        {todayTasks.length > 0 &&
          renderSectionContainer(
            'section-today',
            "Today's Plan",
            <Clock className="w-4 h-4 text-amber-500" />,
            todayTasks,
            'text-amber-600 dark:text-amber-400'
          )}

        {futureTasks.length > 0 &&
          renderSectionContainer(
            'section-upcoming',
            'Upcoming & Scheduled',
            <Calendar className="w-4 h-4 text-blue-500" />,
            futureTasks
          )}

        {noDateTasks.length > 0 &&
          renderSectionContainer(
            'section-nodate',
            'Backlog & Someday',
            <Circle className="w-4 h-4 text-neutral-400" />,
            noDateTasks
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
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 p-1 rounded-xl shadow-xs">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterState((prev) => ({ ...prev, priority: p }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors ${
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
          <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 px-3 py-1.5 rounded-xl shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] text-neutral-400 font-medium">Group:</span>
            <select
              value={filterState.groupBy}
              onChange={(e) => setFilterState((prev) => ({ ...prev, groupBy: e.target.value as any }))}
              className="bg-transparent text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 border-none focus:outline-hidden cursor-pointer"
            >
              <option value="none" className="dark:bg-neutral-900">None</option>
              <option value="dueDate" className="dark:bg-neutral-900">Due Date</option>
              <option value="priority" className="dark:bg-neutral-900">Priority</option>
              <option value="project" className="dark:bg-neutral-900">Project</option>
            </select>
          </div>
        </div>

        {/* Sort By selector */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 px-3 py-1.5 rounded-xl shadow-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[11px] text-neutral-400 font-medium">Sort:</span>
          <select
            value={filterState.sortBy}
            onChange={(e) => setFilterState((prev) => ({ ...prev, sortBy: e.target.value as any }))}
            className="bg-transparent text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 border-none focus:outline-hidden cursor-pointer"
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
        <div className="py-16 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-8 shadow-xs">
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
                className="px-3.5 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
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
