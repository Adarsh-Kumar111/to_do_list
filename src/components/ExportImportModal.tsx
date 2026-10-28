import React, { useState } from 'react';
import { X, Download, Upload, FileText, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { Task, Project } from '../types/todo';
import { exportTasksAsJSON, exportTasksAsCSV, INITIAL_TASKS, INITIAL_PROJECTS } from '../utils/storage';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  onImportData: (importedTasks: Task[], importedProjects: Project[]) => void;
  onResetData: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  onImportData,
  onResetData,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.tasks)) {
          onImportData(parsed.tasks, parsed.projects || projects);
          setImportStatus(`Successfully loaded ${parsed.tasks.length} tasks!`);
          setErrorStatus(null);
          setTimeout(() => {
            onClose();
          }, 1200);
        } else if (Array.isArray(parsed)) {
          // Direct task array
          onImportData(parsed, projects);
          setImportStatus(`Successfully loaded ${parsed.length} tasks!`);
          setErrorStatus(null);
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setErrorStatus('Invalid JSON structure: Expected a tasks array.');
        }
      } catch (err) {
        setErrorStatus('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              Data Management & Backup
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {importStatus && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <Check className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {errorStatus && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Export Section */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
            Export Workspace
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => exportTasksAsJSON(tasks, projects)}
              className="flex items-center justify-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => exportTasksAsCSV(tasks, projects)}
              className="flex items-center justify-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
            Import Backup
          </h4>
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-neutral-400 dark:hover:border-neutral-500 cursor-pointer bg-neutral-50/50 dark:bg-neutral-800/30 transition-colors">
            <Upload className="w-6 h-6 text-neutral-400 mb-1" />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Click to choose JSON backup file
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5">
              Restores tasks and project lists
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Reset Section */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => {
              if (window.confirm('Reset all tasks to sample starter data?')) {
                onResetData();
                onClose();
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Sample Starter Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
