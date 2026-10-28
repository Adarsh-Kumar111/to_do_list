import React, { useState } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  Clock,
  History,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Task, Project, TaskHistoryEvent } from '../types/todo';

interface AiReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  history: TaskHistoryEvent[];
}

export const AiReportModal: React.FC<AiReportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  history,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report');
  const [timeframe, setTimeframe] = useState<'weekly' | 'daily' | 'bottlenecks'>('weekly');
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showVercelGuide, setShowVercelGuide] = useState(false);

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Try /api/gemini/report or /api/report
      let res = await fetch('/api/gemini/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          history,
          timeframe,
        }),
      });

      if (!res.ok) {
        // Fallback to /api/report
        res = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks,
            history,
            timeframe,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate report.');
      }

      setReportMarkdown(data.report || 'No report generated.');
    } catch (err: any) {
      console.error('Error generating report:', err);
      setErrorMsg(
        err.message || 'Failed to contact Gemini API. Please make sure GEMINI_API_KEY is configured.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reportMarkdown) return;
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!reportMarkdown) return;
    const blob = new Blob([reportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-report-${timeframe}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render markdown with nice typography
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('## ')) {
        return (
          <h3
            key={idx}
            className="text-sm font-bold text-neutral-900 dark:text-white mt-4 mb-2 first:mt-0 pb-1 border-b border-neutral-100 dark:border-neutral-800"
          >
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-3 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed my-0.5">
            {line.substring(2)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed my-0.5">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Gemini AI Productivity & History Report
              </h2>
              <p className="text-[11px] text-neutral-400">
                Track workload milestones, analyze bottlenecks & generate executive performance digests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVercelGuide(!showVercelGuide)}
              title="Vercel Environment Setup Guide"
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vercel Environment Format Banner / Drawer */}
        {showVercelGuide && (
          <div className="p-4 bg-neutral-950 text-neutral-200 text-xs border-b border-neutral-800 space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-amber-400 font-semibold">
              <span>🚀 Vercel Environment Variables Format</span>
              <button
                onClick={() => setShowVercelGuide(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-neutral-300">
              Vercel me deploy karne ke baad <strong>Project Settings → Environment Variables</strong> me ye variable add karein:
            </p>
            <div className="p-2.5 bg-neutral-900 rounded font-mono text-[11px] text-emerald-400 border border-neutral-800 space-y-1">
              <div><span className="text-neutral-400">Key:</span> GEMINI_API_KEY</div>
              <div><span className="text-neutral-400">Value:</span> AIzaSy... (Your Google Gemini API Key)</div>
              <div><span className="text-neutral-400">Environments:</span> Production, Preview, Development (all checked)</div>
            </div>
            <p className="text-[10px] text-neutral-400">
              File: <code>.env.example</code> contains the ready template. Redeploy on Vercel after adding the key!
            </p>
          </div>
        )}

        {/* Tab Switcher & Timeframe Selector */}
        <div className="px-6 py-2.5 bg-neutral-50 dark:bg-neutral-850/50 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'report'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>AI Performance Report</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Task History Timeline ({history.length})</span>
            </button>
          </div>

          {activeTab === 'report' && (
            <div className="flex items-center gap-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
              >
                <option value="weekly">Weekly Performance Digest</option>
                <option value="daily">Daily Workload Check-in</option>
                <option value="bottlenecks">Bottleneck & Overdue Audit</option>
              </select>

              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{reportMarkdown ? 'Regenerate' : 'Generate AI Report'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">Gemini API Error:</span>
                <p>{errorMsg}</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400">
                  Ensure <code>GEMINI_API_KEY</code> is provided in your environment variables (.env locally or in Vercel settings).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'report' ? (
            <div>
              {isLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Gemini 3.8 Flash is analyzing your task history and velocity...
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Evaluating completed milestones, bottlenecks, and calculating your action plan.
                  </p>
                </div>
              ) : reportMarkdown ? (
                <div className="bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
                  {renderFormattedMarkdown(reportMarkdown)}
                </div>
              ) : (
                <div className="py-16 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-6">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                    No Report Generated Yet
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                    Click "Generate AI Report" above to have Gemini review your tasks, subtasks, overdue deadlines, and Pomodoro focus sessions.
                  </p>
                  <button
                    onClick={handleGenerateReport}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Now</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* History Timeline Tab */
            <div className="space-y-2.5">
              <div className="text-xs text-neutral-500 pb-2">
                Real-time chronological log of task actions tracked in your browser and synced for AI reporting:
              </div>
              {history.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl">
                  <History className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
                  <span className="text-xs text-neutral-400">No actions recorded yet. Complete or create tasks to build your history log.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice().reverse().map((item) => {
                    const date = new Date(item.timestamp);
                    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

                    const actionColors: Record<string, string> = {
                      completed: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                      created: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                      pomodoro_completed: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
                      priority_changed: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                      deleted: 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
                    };

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-850/30 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${actionColors[item.action] || 'text-neutral-500'}`}>
                            {item.action.replace('_', ' ')}
                          </span>
                          <span className="font-medium text-neutral-900 dark:text-white truncate max-w-sm">
                            {item.taskTitle}
                          </span>
                          {item.details && (
                            <span className="text-neutral-400 text-[11px] hidden sm:inline truncate">
                              ({item.details})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-neutral-400 shrink-0 ml-2">
                          {formattedDate} {formattedTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'report' && reportMarkdown && (
          <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-neutral-900">
            <span className="text-[11px] text-neutral-400 font-mono">
              Powered by Gemini 3.8 Flash
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report (.md)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
