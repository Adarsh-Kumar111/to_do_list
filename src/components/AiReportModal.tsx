import React, { useState } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  History,
  FileText,
  AlertCircle,
  HelpCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Target,
  Lightbulb,
} from 'lucide-react';
import { Task, Project, TaskHistoryEvent } from '../types/todo';

interface AiReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  history: TaskHistoryEvent[];
  onAddTaskFromAi?: (title: string) => void;
}

export const AiReportModal: React.FC<AiReportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  history,
  onAddTaskFromAi,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report');
  const [timeframe, setTimeframe] = useState<'weekly' | 'daily' | 'bottlenecks'>('weekly');
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showVercelGuide, setShowVercelGuide] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
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

  const handleQuickAddRecommendation = (text: string) => {
    if (onAddTaskFromAi) {
      onAddTaskFromAi(text);
      setAddedTasks((prev) => ({ ...prev, [text]: true }));
    }
  };

  // Parse markdown into distinct separated cards
  const renderSeparatedReportCards = (content: string) => {
    const rawSections = content.split(/^##\s+/gm).filter(Boolean);

    if (rawSections.length === 0) {
      return (
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-xs whitespace-pre-wrap">
          {content}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {rawSections.map((sec, idx) => {
          const lines = sec.trim().split('\n');
          const header = lines[0] || 'Section';
          const bodyLines = lines.slice(1).join('\n').trim();

          const isWins = header.toLowerCase().includes('accomplishment') || header.toLowerCase().includes('win');
          const isBottlenecks = header.toLowerCase().includes('bottleneck') || header.toLowerCase().includes('overdue');
          const isActionPlan = header.toLowerCase().includes('action') || header.toLowerCase().includes('plan');
          const isMindset = header.toLowerCase().includes('mindset') || header.toLowerCase().includes('tip');

          let cardBorder = 'border-neutral-200/90 dark:border-neutral-800';
          let icon = <TrendingUp className="w-4 h-4 text-indigo-500" />;
          let headerClass = 'text-neutral-900 dark:text-white';

          if (isWins) {
            cardBorder = 'border-emerald-200 dark:border-emerald-900/50';
            icon = <Check className="w-4 h-4 text-emerald-500" />;
            headerClass = 'text-emerald-700 dark:text-emerald-400';
          } else if (isBottlenecks) {
            cardBorder = 'border-rose-200 dark:border-rose-900/50';
            icon = <AlertCircle className="w-4 h-4 text-rose-500" />;
            headerClass = 'text-rose-700 dark:text-rose-400';
          } else if (isActionPlan) {
            cardBorder = 'border-blue-200 dark:border-blue-900/50';
            icon = <Target className="w-4 h-4 text-blue-500" />;
            headerClass = 'text-blue-700 dark:text-blue-400';
          } else if (isMindset) {
            cardBorder = 'border-amber-200 dark:border-amber-900/50';
            icon = <Lightbulb className="w-4 h-4 text-amber-500" />;
            headerClass = 'text-amber-700 dark:text-amber-400';
          }

          return (
            <div
              key={idx}
              className={`bg-white dark:bg-neutral-900 border ${cardBorder} rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5 transition-all`}
            >
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                {icon}
                <h3 className={`text-xs font-bold uppercase tracking-wider ${headerClass}`}>
                  {header}
                </h3>
              </div>

              {/* Body content */}
              <div className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {lines.slice(1).map((line, lineIdx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={lineIdx} className="h-1" />;

                  const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
                  const isNumbered = /^\d+\.\s/.test(trimmed);

                  if (isActionPlan && (isBullet || isNumbered)) {
                    const cleanText = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
                    const isAdded = !!addedTasks[cleanText];

                    return (
                      <div
                        key={lineIdx}
                        className="flex items-center justify-between gap-3 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-750"
                      >
                        <span className="flex-1 font-medium text-neutral-900 dark:text-white">
                          {cleanText}
                        </span>
                        {onAddTaskFromAi && (
                          <button
                            type="button"
                            onClick={() => handleQuickAddRecommendation(cleanText)}
                            disabled={isAdded}
                            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors shrink-0 ${
                              isAdded
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Add to Tasks</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  }

                  if (isBullet) {
                    return (
                      <li key={lineIdx} className="ml-4 list-disc text-neutral-700 dark:text-neutral-300 my-0.5">
                        {trimmed.substring(2)}
                      </li>
                    );
                  }

                  if (isNumbered) {
                    return (
                      <li key={lineIdx} className="ml-4 list-decimal text-neutral-700 dark:text-neutral-300 my-0.5 font-medium">
                        {trimmed.replace(/^\d+\.\s/, '')}
                      </li>
                    );
                  }

                  return <p key={lineIdx}>{trimmed}</p>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Gemini AI Productivity & History Hub
              </h2>
              <p className="text-[11px] text-neutral-400">
                Segmented milestone reviews, bottleneck alerts & one-click action plans
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVercelGuide(!showVercelGuide)}
              title="Vercel Environment Setup Guide"
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vercel Format Helper Banner */}
        {showVercelGuide && (
          <div className="p-4 bg-neutral-900 text-neutral-200 text-xs border-b border-neutral-800 space-y-2">
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
              Vercel me deploy karne ke baad <strong>Project Settings → Environment Variables</strong> me ye add karein:
            </p>
            <div className="p-2.5 bg-neutral-950 rounded-xl font-mono text-[11px] text-emerald-400 border border-neutral-800 space-y-1">
              <div><span className="text-neutral-400">Key:</span> GEMINI_API_KEY</div>
              <div><span className="text-neutral-400">Value:</span> AIzaSy... (Aapka API Key)</div>
              <div><span className="text-neutral-400">Environments:</span> Production, Preview, Development</div>
            </div>
          </div>
        )}

        {/* Tabs & Controls */}
        <div className="px-6 py-2.5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'report'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>AI Performance Digest</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Action Timeline ({history.length})</span>
            </button>
          </div>

          {activeTab === 'report' && (
            <div className="flex items-center gap-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-2.5 py-1 font-medium text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
              >
                <option value="weekly">Weekly Performance Digest</option>
                <option value="daily">Daily Workload Check-in</option>
                <option value="bottlenecks">Bottleneck & Overdue Audit</option>
              </select>

              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{reportMarkdown ? 'Regenerate' : 'Generate Digest'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">Gemini API Error:</span>
                <p>{errorMsg}</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400">
                  Ensure <code>GEMINI_API_KEY</code> is provided in your environment variables.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'report' ? (
            <div>
              {isLoading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Gemini 3.8 Flash is analyzing your workload & timeline...
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Extracting key wins, quantifying overdue bottlenecks, and assembling your action plan.
                  </p>
                </div>
              ) : reportMarkdown ? (
                renderSeparatedReportCards(reportMarkdown)
              ) : (
                <div className="py-20 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
                  <Sparkles className="w-9 h-9 text-indigo-500 mx-auto mb-2.5" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                    No Report Generated Yet
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                    Click "Generate Digest" to receive an AI performance audit of your tasks, subtasks, overdue deadlines, and Pomodoro focus hours.
                  </p>
                  <button
                    onClick={handleGenerateReport}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Digest Now</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* History Timeline Tab */
            <div className="space-y-2.5">
              <div className="text-xs text-neutral-500 pb-1">
                Real-time chronological log of task actions tracked in your browser and synced for AI reporting:
              </div>
              {history.length === 0 ? (
                <div className="py-12 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl">
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
                      completed: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                      created: 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                      pomodoro_completed: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                      priority_changed: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                      deleted: 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
                    };

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono uppercase font-bold border ${actionColors[item.action] || 'text-neutral-500'}`}>
                            {item.action.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-sm">
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
          <div className="px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-neutral-900">
            <span className="text-[11px] text-neutral-400 font-mono">
              Powered by Gemini 3.8 Flash
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs"
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
