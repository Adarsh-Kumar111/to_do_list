import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';
import { Task, Project, Priority } from '../types/todo';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskWithDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  projects,
  onToggleTask,
  onEditTask,
  onOpenNewTaskWithDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayStr = new Date().toISOString().split('T')[0];

  const priorityColors: Record<Priority, string> = {
    urgent: 'bg-rose-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-neutral-400',
  };

  // Generate grid days: leading blanks + days of month
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNumber: d, dateStr });
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
      {/* Calendar Top Controls */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-neutral-500" />
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            {monthName}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleGoToday}
            className="px-2.5 py-1 text-xs font-medium border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-md p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 pb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[100px] sm:min-h-[120px] bg-neutral-50/40 dark:bg-neutral-900/30 rounded-lg"
              />
            );
          }

          const isToday = cell.dateStr === todayStr;
          const dayTasks = tasks.filter((t) => t.dueDate === cell.dateStr);

          return (
            <div
              key={cell.dateStr}
              className={`group min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 border rounded-lg flex flex-col justify-between transition-colors ${
                isToday
                  ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/40'
                  : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-mono tabular-nums font-semibold px-1.5 py-0.5 rounded ${
                    isToday
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                      : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                <button
                  onClick={() => onOpenNewTaskWithDate(cell.dateStr)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded transition-opacity"
                  title="Add task on this date"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Tasks in Day */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px]">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    className={`flex items-center gap-1.5 p-1 rounded text-[11px] truncate cursor-pointer transition-colors ${
                      t.completed
                        ? 'text-neutral-400 line-through'
                        : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColors[t.priority]}`} />
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
