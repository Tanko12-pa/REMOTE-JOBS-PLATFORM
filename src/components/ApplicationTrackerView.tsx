import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  Calendar,
  Building,
  Briefcase,
  DollarSign,
  FileText,
  Clock,
  Target,
  Printer,
  Sparkles,
  ArrowRight,
  Bookmark,
  Zap,
  RefreshCw,
  BarChart2,
  Brain,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { ApplicationLog, UserProfile } from '../types';
import { JobSearchInsightsDashboard } from './JobSearchInsightsDashboard';
import {
  exportApplicationsCSV,
  exportApplicationsJSON,
  exportSavedJobsCSV,
  exportAllCareerDataCSV,
} from '../utils/storage';

interface ApplicationTrackerViewProps {
  applicationLogs: ApplicationLog[];
  setApplicationLogs: React.Dispatch<React.SetStateAction<ApplicationLog[]>>;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  savedPlatformIds?: string[];
}

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  applicationLogs,
  setApplicationLogs,
  userProfile,
  setUserProfile,
  savedPlatformIds = [],
}) => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'insights'>('tracker');
  const [company, setCompany] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [platformUsed, setPlatformUsed] = useState<string>('We Work Remotely');
  const [salaryOffered, setSalaryOffered] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [status, setStatus] = useState<ApplicationLog['status']>('Applied');

  // Suitability Score state
  const [isAnalyzingSuitability, setIsAnalyzingSuitability] = useState<boolean>(false);
  const [suitabilityResult, setSuitabilityResult] = useState<{
    suitabilityScore: number;
    reasoning: string;
    keyMatches: string[];
    missingSkills: string[];
  } | null>(null);
  const [analyzingLogId, setAnalyzingLogId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // AI Job URL extraction state
  const [jobUrl, setJobUrl] = useState<string>('');
  const [isExtractingUrl, setIsExtractingUrl] = useState<boolean>(false);
  const [extractionFeedback, setExtractionFeedback] = useState<string | null>(null);

  // Status transition toast state for progress animations
  const [statusToast, setStatusToast] = useState<{
    logId: string;
    company: string;
    oldStatus: string;
    newStatus: string;
  } | null>(null);

  // Target Keyword Toast Notification state
  const [keywordToast, setKeywordToast] = useState<{
    keyword: string;
    company: string;
    role: string;
  } | null>(null);

  const checkAndTriggerKeywordNotification = (
    roleText: string,
    companyText: string,
    descText?: string,
    notesText?: string
  ) => {
    const targetKeywords = ['React', 'TypeScript', 'Remote', 'Frontend', 'Developer', 'Node.js', 'Engineer', 'Design', 'Python'];
    const fullText = `${roleText} ${companyText} ${descText || ''} ${notesText || ''}`.toLowerCase();

    const matched = targetKeywords.find((kw) => fullText.includes(kw.toLowerCase()));
    if (matched) {
      setKeywordToast({
        keyword: matched,
        role: roleText,
        company: companyText,
      });

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⚡ Target Keyword Match Detected!', {
          body: `Keyword "${matched}" found in new job: ${roleText} @ ${companyText}`,
        });
      }

      setTimeout(() => {
        setKeywordToast(null);
      }, 6000);
    }
  };

  const handleSimulateKeywordToast = () => {
    const sampleKeywords = ['React', 'TypeScript', 'Remote', 'Frontend', 'Node.js'];
    const sampleCompanies = ['Shopify', 'GitLab', 'Toptal', 'Stripe', 'Atlassian'];
    const sampleRoles = [
      'Senior React & TypeScript Developer',
      'Remote Frontend Engineer',
      'Lead Node.js Full Stack Architect',
      'Principal Remote Systems Developer',
    ];

    const kw = sampleKeywords[Math.floor(Math.random() * sampleKeywords.length)];
    const comp = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
    const roleTitle = sampleRoles[Math.floor(Math.random() * sampleRoles.length)];

    setKeywordToast({
      keyword: kw,
      role: roleTitle,
      company: comp,
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⚡ Target Keyword Match Detected!', {
        body: `Keyword "${kw}" found in new job: ${roleTitle} @ ${comp}`,
      });
    }

    setTimeout(() => {
      setKeywordToast(null);
    }, 6000);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const formattedTodayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const todayAppsCount = applicationLogs.filter((log) => log.dateApplied === todayStr).length;
  const goal = userProfile.dailyGoal || 5;
  const percentage = Math.min(Math.round((todayAppsCount / goal) * 100), 100);

  // Recharts Status Chart Data
  const statusCounts = {
    Applied: applicationLogs.filter((l) => l.status === 'Applied').length,
    Interviewing: applicationLogs.filter((l) => l.status === 'Interviewing').length,
    Offered: applicationLogs.filter((l) => l.status === 'Offered').length,
    Rejected: applicationLogs.filter((l) => l.status === 'Rejected').length,
    Saved: applicationLogs.filter((l) => l.status === 'Saved').length,
  };

  const chartData = [
    { status: 'Applied', count: statusCounts.Applied, color: '#3B82F6' },
    { status: 'Interviewing', count: statusCounts.Interviewing, color: '#F59E0B' },
    { status: 'Offered', count: statusCounts.Offered, color: '#10B981' },
    { status: 'Rejected', count: statusCounts.Rejected, color: '#EF4444' },
    { status: 'Saved', count: statusCounts.Saved, color: '#8B5CF6' },
  ];

  // SVG Circular Progress calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleAnalyzeSuitabilityForForm = async () => {
    if (!jobDescription.trim() && (!role.trim() || !company.trim())) return;
    setIsAnalyzingSuitability(true);
    setSuitabilityResult(null);

    try {
      const response = await fetch('/api/gemini/analyze-suitability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription || `${role} role at ${company}`,
          company,
          role,
          userProfile,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setSuitabilityResult(data.analysis);
      }
    } catch (err) {
      console.error('Failed to analyze suitability', err);
    } finally {
      setIsAnalyzingSuitability(false);
    }
  };

  const handleAnalyzeSuitabilityForLog = async (logItem: ApplicationLog) => {
    setAnalyzingLogId(logItem.id);
    try {
      const response = await fetch('/api/gemini/analyze-suitability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: logItem.jobDescription || `${logItem.role} position at ${logItem.company}`,
          company: logItem.company,
          role: logItem.role,
          userProfile,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setApplicationLogs((prev) =>
          prev.map((l) =>
            l.id === logItem.id
              ? {
                  ...l,
                  suitabilityScore: data.analysis.suitabilityScore,
                  suitabilityReason: `${data.analysis.reasoning} Strengths: ${data.analysis.keyMatches?.join(', ') || 'Core fit'}.`,
                }
              : l
          )
        );
        setExpandedLogId(logItem.id);
      }
    } catch (err) {
      console.error('Failed to analyze log suitability', err);
    } finally {
      setAnalyzingLogId(null);
    }
  };

  const handleExtractFromUrl = async () => {
    if (!jobUrl.trim()) return;
    setIsExtractingUrl(true);
    setExtractionFeedback(null);

    try {
      const response = await fetch('/api/gemini/extract-job-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobUrl }),
      });

      const data = await response.json();
      if (data.success && data.extracted) {
        if (data.extracted.company) setCompany(data.extracted.company);
        if (data.extracted.role) setRole(data.extracted.role);
        if (data.extracted.platformUsed) setPlatformUsed(data.extracted.platformUsed);
        if (data.extracted.salaryOffered) setSalaryOffered(data.extracted.salaryOffered);

        setExtractionFeedback(
          `✨ Successfully extracted "${data.extracted.role}" at "${data.extracted.company}"`
        );
      }
    } catch (err) {
      console.error('Failed to extract job URL', err);
      setExtractionFeedback('Unable to extract job details automatically. Please fill manually.');
    } finally {
      setIsExtractingUrl(false);
    }
  };

  const handleAddLog = () => {
    if (!company.trim() || !role.trim()) return;

    const newLog: ApplicationLog = {
      id: `app-${Date.now()}`,
      company,
      role,
      dateApplied: todayStr,
      status,
      platformUsed,
      salaryOffered,
      notes,
      jobDescription: jobDescription.trim() || undefined,
      suitabilityScore: suitabilityResult?.suitabilityScore,
      suitabilityReason: suitabilityResult
        ? `${suitabilityResult.reasoning} Strengths: ${suitabilityResult.keyMatches.join(', ')}`
        : undefined,
    };

    setApplicationLogs((prev) => [newLog, ...prev]);

    // Check for Target Keyword match toast alert
    checkAndTriggerKeywordNotification(role, company, jobDescription, notes);

    setCompany('');
    setRole('');
    setNotes('');
    setJobDescription('');
    setSuitabilityResult(null);
    setSalaryOffered('');
    setJobUrl('');
    setExtractionFeedback(null);

    // Trigger subtle success notification for new log
    setStatusToast({
      logId: newLog.id,
      company: newLog.company,
      oldStatus: 'Logged',
      newStatus: newLog.status,
    });
    setTimeout(() => setStatusToast(null), 3500);
  };

  const handleDeleteLog = (id: string) => {
    setApplicationLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: ApplicationLog['status']) => {
    const targetLog = applicationLogs.find((l) => l.id === id);
    if (!targetLog) return;

    const oldStatus = targetLog.status;
    if (oldStatus === newStatus) return;

    setApplicationLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    // Trigger status transition animation & toast
    setStatusToast({
      logId: id,
      company: targetLog.company,
      oldStatus,
      newStatus,
    });

    setTimeout(() => setStatusToast(null), 4000);
  };

  const handlePrintTracker = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Banner & Circular Goal Progress Widget */}
      <div className="bg-[#064E3B] dark:bg-emerald-950 text-white rounded-2xl p-6 border border-[#064E3B] shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold border border-[#FBBF24]/40">
                <Target className="w-3.5 h-3.5" />
                Daily Application Goal Tracker
              </div>

              {/* Current Date Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold border border-white/20">
                <Calendar className="w-3.5 h-3.5 text-[#FBBF24]" />
                Today: {formattedTodayDate}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              Application Tracker & Goal Ring
            </h2>
            <p className="text-xs text-emerald-100 max-w-md">
              Target {goal} applications daily to maintain momentum and maximize response rates.
            </p>

            {/* Quick Export & Print Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => exportApplicationsCSV(applicationLogs)}
                id="export-tracker-csv-btn"
                className="px-3 py-1.5 rounded-xl bg-[#FBBF24] hover:bg-[#facc15] text-[#064E3B] text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV Backup
              </button>

              <button
                onClick={() => exportApplicationsJSON(applicationLogs)}
                id="export-tracker-json-btn"
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#064E3B] text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-[#064E3B]" />
                Export JSON Backup
              </button>

              <button
                onClick={handleSimulateKeywordToast}
                id="simulate-keyword-alert-btn"
                className="px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-amber-400/40 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                Simulate Keyword Alert
              </button>

              <button
                onClick={handlePrintTracker}
                id="print-application-tracker-btn"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-[#FBBF24]" />
                Print / Export PDF
              </button>
            </div>
          </div>

          {/* SVG Animated Circular Progress Ring */}
          <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="text-emerald-900"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="text-[#FBBF24] transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold text-[#FBBF24] block">{percentage}%</span>
                <span className="text-[10px] text-emerald-100 font-bold block">
                  {todayAppsCount} / {goal} Today
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#FBBF24] block">Daily Goal Setting</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={userProfile.dailyGoal}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      dailyGoal: parseInt(e.target.value) || 5,
                    }))
                  }
                  className="w-14 p-1 text-center text-xs font-extrabold bg-emerald-950 text-[#FBBF24] rounded-lg border border-[#FBBF24]/40"
                />
                <span className="text-[10px] text-emerald-200 font-semibold">/ day</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200 dark:bg-slate-800/80 rounded-xl w-fit border border-slate-300 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('tracker')}
          id="tracker-tab-btn"
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tracker'
              ? 'bg-[#064E3B] text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Application Tracker & Goal Ring
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          id="insights-tab-btn"
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'insights'
              ? 'bg-[#064E3B] text-amber-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
          Job Search Insights Dashboard (Recharts Analytics)
        </button>
      </div>

      {activeTab === 'insights' ? (
        <JobSearchInsightsDashboard applicationLogs={applicationLogs} />
      ) : (
        <>
          {/* Target Keyword Toast Alert Message */}
      {keywordToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-950 text-white border-2 border-amber-400 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-emerald-950 font-black animate-pulse shrink-0">
              <Zap className="w-5 h-5 fill-emerald-950" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-300 flex items-center gap-2">
                <span>⚡ Target Keyword Match Detected!</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase tracking-wide">
                  "{keywordToast.keyword}"
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-semibold mt-0.5">
                Matched in new job entry: <strong className="text-white font-bold">{keywordToast.role}</strong> at <strong className="text-amber-200 font-bold">{keywordToast.company}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setKeywordToast(null)}
            className="text-xs text-amber-300 hover:text-white underline font-bold px-2 py-1 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Transition Toast / Subtle Animation */}
      {statusToast && (
        <div className="p-4 rounded-2xl bg-[#064E3B] text-white border-2 border-[#FBBF24] shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FBBF24] text-[#064E3B] animate-bounce">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-[#FBBF24] flex items-center gap-2">
                <span>Status Transition Updated!</span>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px]">
                  {statusToast.company}
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <span>{statusToast.oldStatus}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FBBF24]" />
                <strong className="text-[#FBBF24] font-bold">{statusToast.newStatus}</strong> 🎉
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-200 bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/60 font-semibold">
            Saved to Log
          </span>
        </div>
      )}

      {/* Recharts Applications per Status Visualization Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#064E3B] dark:text-emerald-200 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
              Applications Status Pipeline (Recharts)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live count of job applications grouped by recruitment stage
            </p>
          </div>

          {/* Quick Stat Pill Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Applied: {statusCounts.Applied}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Interviewing: {statusCounts.Interviewing}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Offered: {statusCounts.Offered}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Rejected: {statusCounts.Rejected}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Saved: {statusCounts.Saved}
            </span>
          </div>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                dataKey="status"
                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#064E3B',
                  borderColor: '#FBBF24',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                cursor={{ fill: 'rgba(6, 78, 59, 0.05)' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={42}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Form & History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Log New Job Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-[#064E3B] dark:text-emerald-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#FBBF24]" />
              Log New Job Application
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              Date: {todayStr}
            </span>
          </div>

          {/* AI Job URL Auto-Extraction Input */}
          <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <label className="text-[11px] font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Paste Job Posting URL (AI Auto-Extract)
              </span>
              <span className="text-[9px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300/40">
                Gemini API
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="Paste Lever, Greenhouse, WeWorkRemotely or LinkedIn URL..."
                className="flex-1 p-2 text-xs bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
              />
              <button
                type="button"
                onClick={handleExtractFromUrl}
                disabled={isExtractingUrl || !jobUrl.trim()}
                id="extract-job-url-btn"
                className="px-3 py-2 bg-[#064E3B] hover:bg-emerald-900 text-amber-300 font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0 shadow-xs"
              >
                {isExtractingUrl ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                Auto-Extract
              </button>
            </div>
            {extractionFeedback && (
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                {extractionFeedback}
              </p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Company Name *
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="E.g. Shopify, GitLab, Toptal Client"
              className="w-full p-2.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Job Role / Title *
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="E.g. Full Stack React Developer"
              className="w-full p-2.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
            />
          </div>

          {/* Job Description & Gemini AI Suitability Score Analyzer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Job Description (AI Suitability Analysis)
              </label>
              <button
                type="button"
                onClick={handleAnalyzeSuitabilityForForm}
                disabled={isAnalyzingSuitability || (!jobDescription.trim() && !role.trim())}
                id="analyze-suitability-btn"
                className="text-[10px] font-extrabold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {isAnalyzingSuitability ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-500" />
                )}
                Analyze Fit Score
              </button>
            </div>
            <textarea
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description or requirements to calculate Gemini Suitability Score against your profile..."
              className="w-full p-2.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            {suitabilityResult && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Suitability Score: {suitabilityResult.suitabilityScore}% Match
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      suitabilityResult.suitabilityScore >= 80
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                        : suitabilityResult.suitabilityScore >= 65
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                    }`}
                  >
                    {suitabilityResult.suitabilityScore >= 80
                      ? 'Strong Match'
                      : suitabilityResult.suitabilityScore >= 65
                      ? 'Moderate Match'
                      : 'Skill Gap'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-purple-200">
                  {suitabilityResult.reasoning}
                </p>
                {suitabilityResult.keyMatches?.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-[10px] pt-1">
                    {suitabilityResult.keyMatches.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 rounded-md font-bold"
                      >
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Platform Used
              </label>
              <input
                type="text"
                value={platformUsed}
                onChange={(e) => setPlatformUsed(e.target.value)}
                placeholder="We Work Remotely"
                className="w-full p-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Salary Range / Offered
              </label>
              <input
                type="text"
                value={salaryOffered}
                onChange={(e) => setSalaryOffered(e.target.value)}
                placeholder="$95,000 / yr"
                className="w-full p-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offered">Offered 🎉</option>
              <option value="Rejected">Rejected</option>
              <option value="Saved">Saved</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Notes / Next Follow-up Date
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. Sent message to recruiter on LinkedIn..."
              className="w-full p-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>

          <button
            onClick={handleAddLog}
            id="log-application-entry-btn"
            className="w-full py-3 rounded-xl bg-[#064E3B] hover:bg-[#043e2f] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#FBBF24]" />
            Add Application to Log (+1 Goal Point)
          </button>
        </div>

        {/* Application History Logs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#064E3B] dark:text-emerald-100">
                Application History Log ({applicationLogs.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Saved Job Bookmarks: <strong className="text-[#064E3B] dark:text-[#FBBF24]">{savedPlatformIds.length}</strong>
              </p>
            </div>

            {/* Export CSV Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => exportApplicationsCSV(applicationLogs)}
                id="export-applications-csv-btn"
                className="px-2.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-[#064E3B] dark:text-[#FBBF24] hover:bg-[#FBBF24] hover:text-[#064E3B] text-xs font-bold flex items-center gap-1 border border-emerald-300 dark:border-emerald-800 transition-all"
                title="Export Application Logs CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>

              <button
                onClick={() => exportSavedJobsCSV(savedPlatformIds)}
                id="export-saved-jobs-csv-btn"
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[#064E3B] dark:text-[#FBBF24] hover:bg-[#FBBF24] hover:text-[#064E3B] text-xs font-bold flex items-center gap-1 border border-[#FBBF24]/40 transition-all"
                title="Export Saved Job Platforms CSV"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Saved Jobs CSV
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
            {applicationLogs.map((log) => {
              const isRecentlyUpdated = statusToast?.logId === log.id;
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isRecentlyUpdated
                      ? 'bg-amber-50/80 dark:bg-amber-950/50 border-[#FBBF24] shadow-md scale-[1.01]'
                      : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#064E3B] dark:text-emerald-100 flex items-center gap-1.5">
                        {log.role} @ {log.company}
                        {isRecentlyUpdated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#064E3B] text-[#FBBF24] animate-pulse">
                            <Sparkles className="w-3 h-3" /> Updated
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>📅 {log.dateApplied}</span>
                        <span>• Portal: {log.platformUsed}</span>
                        {log.salaryOffered && <span>• Salary: {log.salaryOffered}</span>}
                      </p>
                      {log.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={log.status}
                        onChange={(e) => handleStatusChange(log.id, e.target.value as any)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                          log.status === 'Offered'
                            ? 'bg-emerald-100 text-[#064E3B] border-emerald-300'
                            : log.status === 'Interviewing'
                            ? 'bg-amber-100 text-amber-950 border-[#FBBF24]'
                            : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing 🎯</option>
                        <option value="Offered">Offered 🎉</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Saved">Saved</option>
                      </select>

                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Application Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* AI Suitability Score Badge / Trigger */}
                  {log.suitabilityScore !== undefined ? (
                    <div className="mt-2 p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex flex-col gap-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          AI Suitability Score:{' '}
                          <strong className="text-purple-800 dark:text-amber-300 font-extrabold">
                            {log.suitabilityScore}% Match
                          </strong>
                        </span>
                        <button
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                          className="text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-0.5"
                        >
                          {expandedLogId === log.id ? 'Hide Details' : 'View AI Insights'}
                          {expandedLogId === log.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      {expandedLogId === log.id && log.suitabilityReason && (
                        <p className="text-[10px] text-slate-600 dark:text-purple-200 mt-1 leading-relaxed border-t border-purple-200/50 dark:border-purple-800/50 pt-1.5">
                          {log.suitabilityReason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAnalyzeSuitabilityForLog(log)}
                      disabled={analyzingLogId === log.id}
                      id={`analyze-log-${log.id}-btn`}
                      className="mt-1 text-[10px] font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/80 flex items-center gap-1.5 transition-all w-fit disabled:opacity-50"
                    >
                      {analyzingLogId === log.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
                      ) : (
                        <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      )}
                      Analyze AI Suitability Score
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

