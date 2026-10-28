import React, { useEffect } from 'react';
import { X, Play, Pause, RotateCcw, SkipForward, CheckCircle2, Timer } from 'lucide-react';
import { Task, PomodoroSession } from '../types/todo';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  pomodoro: PomodoroSession;
  setPomodoro: React.Dispatch<React.SetStateAction<PomodoroSession>>;
  tasks: Task[];
  onIncrementTaskPomodoro: (taskId: string) => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  pomodoro,
  setPomodoro,
  tasks,
  onIncrementTaskPomodoro,
}) => {
  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'SELECT') {
        e.preventDefault();
        setPomodoro((prev) => ({ ...prev, isActive: !prev.isActive }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, setPomodoro]);

  if (!isOpen) return null;

  const totalSeconds =
    pomodoro.mode === 'focus' ? 25 * 60 : pomodoro.mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - pomodoro.secondsLeft) / totalSeconds) * 100));

  const minutes = Math.floor(pomodoro.secondsLeft / 60);
  const seconds = pomodoro.secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const setMode = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    const defaultTime = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
    setPomodoro((prev) => ({
      ...prev,
      mode,
      isActive: false,
      secondsLeft: defaultTime,
    }));
  };

  const handleReset = () => {
    const defaultTime =
      pomodoro.mode === 'focus' ? 25 * 60 : pomodoro.mode === 'shortBreak' ? 5 * 60 : 15 * 60;
    setPomodoro((prev) => ({
      ...prev,
      isActive: false,
      secondsLeft: defaultTime,
    }));
  };

  const handleSkip = () => {
    if (pomodoro.mode === 'focus') {
      if (pomodoro.taskId) {
        onIncrementTaskPomodoro(pomodoro.taskId);
      }
      setPomodoro((prev) => ({
        ...prev,
        sessionsCompletedToday: prev.sessionsCompletedToday + 1,
        mode: (prev.sessionsCompletedToday + 1) % 4 === 0 ? 'longBreak' : 'shortBreak',
        secondsLeft: (prev.sessionsCompletedToday + 1) % 4 === 0 ? 15 * 60 : 5 * 60,
        isActive: false,
      }));
    } else {
      setPomodoro((prev) => ({
        ...prev,
        mode: 'focus',
        secondsLeft: 25 * 60,
        isActive: false,
      }));
    }
  };

  const activeTask = tasks.find((t) => t.id === pomodoro.taskId);
  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Switcher */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-6 max-w-xs mx-auto">
          <button
            onClick={() => setMode('focus')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              pomodoro.mode === 'focus'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => setMode('shortBreak')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              pomodoro.mode === 'shortBreak'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => setMode('longBreak')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              pomodoro.mode === 'longBreak'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Tabular Timer Display */}
        <div className="text-center my-6">
          <div className="font-mono tabular-nums text-6xl sm:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {timeFormatted}
          </div>
          <div className="text-xs text-neutral-400 mt-2 font-mono">
            {pomodoro.mode === 'focus' ? 'Deep Work Session' : 'Rest & Recharge'} · Completed today: {pomodoro.sessionsCompletedToday}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              pomodoro.mode === 'focus' ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Active Task Selector */}
        <div className="mb-6 bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-750">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
            Focus Task Target
          </label>
          <select
            value={pomodoro.taskId || ''}
            onChange={(e) =>
              setPomodoro((prev) => ({
                ...prev,
                taskId: e.target.value || null,
              }))
            }
            className="w-full text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-neutral-900 dark:text-white focus:outline-hidden"
          >
            <option value="">No task selected (Free focus)</option>
            {pendingTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          {activeTask && (
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 flex items-center justify-between font-mono tabular-nums">
              <span>Goal: {activeTask.estimatedPomodoros || 1} blocks</span>
              <span>Completed: {activeTask.completedPomodoros || 0} blocks</span>
            </div>
          )}
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="p-3 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setPomodoro((prev) => ({ ...prev, isActive: !prev.isActive }))}
            className={`flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-transform hover:scale-105 ${
              pomodoro.isActive
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
            }`}
            title={pomodoro.isActive ? 'Pause' : 'Start'}
          >
            {pomodoro.isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={handleSkip}
            className="p-3 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            title="Skip to next session"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
