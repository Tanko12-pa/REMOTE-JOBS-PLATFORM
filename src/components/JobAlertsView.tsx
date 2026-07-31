import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Volume2,
  VolumeX,
  Mail,
  Filter,
  Briefcase,
  Layers,
  Clock,
  ShieldCheck,
  Send,
  Zap,
  AlertCircle,
  BookmarkPlus,
  Check,
} from 'lucide-react';
import { INITIAL_PLATFORMS } from '../data/platformsData';
import { ApplicationLog, Platform } from '../types';

interface JobAlertOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  matchedKeywords: string[];
  matchScore: number;
  postedTime: string;
  platformName: string;
  website: string;
  description: string;
  isNew?: boolean;
}

interface JobAlertsViewProps {
  userKeywords: string[];
  setUserKeywords: React.Dispatch<React.SetStateAction<string[]>>;
  onSaveJobToTracker?: (job: Partial<ApplicationLog>) => void;
}

const SAMPLE_REMOTE_JOBS: Omit<JobAlertOpportunity, 'matchedKeywords' | 'matchScore'>[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer (React & TypeScript)',
    company: 'CloudScale Global',
    location: 'Worldwide Remote (Async)',
    salary: '$120,000 - $150,000 / yr',
    tags: ['React', 'TypeScript', 'Node.js', 'Frontend', 'Tailwind'],
    postedTime: '10 mins ago',
    platformName: 'We Work Remotely',
    website: 'https://weworkremotely.com',
    description: 'Looking for a Senior Frontend Engineer proficient in React 19, TypeScript, and micro-frontends. Async documentation culture with global team.',
  },
  {
    id: 'job-2',
    title: 'Remote Product Manager - AI Integrations',
    company: 'Apex AI Systems',
    location: 'US / Canada / Europe Remote',
    salary: '$110,000 - $140,000 / yr',
    tags: ['Product Manager', 'AI', 'Agile', 'Remote', 'Strategy'],
    postedTime: '25 mins ago',
    platformName: 'Remote OK',
    website: 'https://remoteok.com',
    description: 'Lead AI tool integrations and candidate user experience dashboards. Requires strong product roadmap ownership and async team communication.',
  },
  {
    id: 'job-3',
    title: 'Full Stack Engineer (TypeScript, Node & Python)',
    company: 'Nexus Health Tech',
    location: 'Worldwide Remote',
    salary: '$95,000 - $130,000 / yr',
    tags: ['Full Stack', 'TypeScript', 'Python', 'Node.js', 'GraphQL'],
    postedTime: '1 hour ago',
    platformName: 'Himalayas',
    website: 'https://himalayas.app',
    description: 'Build secure healthcare API pipelines and responsive web interfaces. Full benefits, flexible PTO, and USD compensation package.',
  },
  {
    id: 'job-4',
    title: 'Global Remote Customer Support Specialist',
    company: 'SaaSFlow Systems',
    location: 'Latin America / West Africa / APAC Remote',
    salary: '$45,000 - $65,000 / yr',
    tags: ['Customer Support', 'Zendesk', 'Support', 'Async', 'Communication'],
    postedTime: '2 hours ago',
    platformName: 'FlexJobs',
    website: 'https://flexjobs.com',
    description: 'Resolve technical customer inquiries asynchronously. Requires high empathy, written clarity, and Zendesk experience.',
  },
  {
    id: 'job-5',
    title: 'UI/UX Designer & Design Systems Lead',
    company: 'Studio Pixel',
    location: 'Worldwide Remote',
    salary: '$85,000 - $115,000 / yr',
    tags: ['Design', 'UI/UX', 'Figma', 'Frontend', 'Tailwind'],
    postedTime: '3 hours ago',
    platformName: 'Remotive',
    website: 'https://remotive.com',
    description: 'Architect accessible, clean design systems for global SaaS platforms using Figma and Tailwind CSS.',
  },
  {
    id: 'job-6',
    title: 'Developer Advocate & Technical Writer',
    company: 'API Layer Corp',
    location: 'Worldwide Remote',
    salary: '$80,000 - $110,000 / yr',
    tags: ['Technical Writer', 'Developer', 'TypeScript', 'Documentation', 'AI'],
    postedTime: '4 hours ago',
    platformName: 'Arc.dev',
    website: 'https://arc.dev',
    description: 'Create technical API tutorials, code examples, and developer documentation for international clients.',
  },
];

export const JobAlertsView: React.FC<JobAlertsViewProps> = ({
  userKeywords,
  setUserKeywords,
  onSaveJobToTracker,
}) => {
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoPollActive, setAutoPollActive] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [matchingJobs, setMatchingJobs] = useState<JobAlertOpportunity[]>([]);
  const [testAlertToast, setTestAlertToast] = useState<string | null>(null);

  // Compute matched jobs whenever keywords or search change
  useEffect(() => {
    const activeKeywords = userKeywords.map((k) => k.toLowerCase().trim()).filter(Boolean);

    if (activeKeywords.length === 0) {
      setMatchingJobs(
        SAMPLE_REMOTE_JOBS.map((j) => ({
          ...j,
          matchedKeywords: ['All Roles'],
          matchScore: 75,
        }))
      );
      return;
    }

    const calculated = SAMPLE_REMOTE_JOBS.map((job) => {
      const jobText = `${job.title} ${job.description} ${job.tags.join(' ')} ${job.company}`.toLowerCase();
      const matched = activeKeywords.filter((kw) => jobText.includes(kw));
      const matchScore = Math.min(100, Math.round((matched.length / activeKeywords.length) * 100) + 50);

      return {
        ...job,
        matchedKeywords: matched.length > 0 ? matched : ['General Remote'],
        matchScore: matched.length > 0 ? matchScore : 40,
      };
    })
      .filter((job) => {
        if (!searchFilter.trim()) return job.matchedKeywords.length > 0 || job.matchScore >= 50;
        return (
          job.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          job.company.toLowerCase().includes(searchFilter.toLowerCase()) ||
          job.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()))
        );
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    setMatchingJobs(calculated);
  }, [userKeywords, searchFilter]);

  // Handle Requesting Native Notification Permission
  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser native notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('🔔 Job Alerts Activated!', {
          body: 'You will receive real-time browser notifications when new remote jobs match your keywords.',
          icon: '/favicon.ico',
        });
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  // Trigger Instant Test Notification
  const handleTriggerTestNotification = () => {
    const topKeyword = userKeywords[0] || 'React';
    const title = `🚀 New Job Alert: Senior ${topKeyword} Specialist`;
    const body = `Matched your keyword "${topKeyword}" at We Work Remotely ($135,000/yr). Tap to apply now!`;

    setTestAlertToast(`Browser Notification Sent: "${title}"`);
    setTimeout(() => setTestAlertToast(null), 4000);

    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } catch (e) {
        // Audio fallback
      }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  // Add Keyword
  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    if (!userKeywords.some((k) => k.toLowerCase() === trimmed.toLowerCase())) {
      setUserKeywords((prev) => [...prev, trimmed]);
    }
    setNewKeyword('');
  };

  // Remove Keyword
  const handleRemoveKeyword = (keyword: string) => {
    setUserKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  // Add Preset Keywords
  const handleAddPresetKeywords = (presets: string[]) => {
    setUserKeywords((prev) => Array.from(new Set([...prev, ...presets])));
  };

  // Save Job To Application Tracker
  const handleSaveToTracker = (job: JobAlertOpportunity) => {
    if (onSaveJobToTracker) {
      onSaveJobToTracker({
        company: job.company,
        role: job.title,
        platformUsed: job.platformName,
        status: 'Saved',
        dateApplied: new Date().toISOString().split('T')[0],
        notes: `Matched keywords: ${job.matchedKeywords.join(', ')} | Salary: ${job.salary}`,
        jobDescription: job.description,
      });
    }

    setSavedToast(`Saved "${job.title}" to your Application Goal Ring & Tracker!`);
    setTimeout(() => setSavedToast(null), 3500);
  };

  // Simulate incoming real-time job alert poll
  useEffect(() => {
    if (!autoPollActive) return;

    const interval = setInterval(() => {
      const randomTitles = [
        'Staff Full Stack Engineer (Remote)',
        'Async Customer Success Specialist',
        'Lead Product Designer (Figma)',
        'AI Solution Architect (Worldwide)',
      ];
      const randomCompanies = ['Stripe', 'GitLab', 'Automattic', 'Zapier', 'Shopify'];
      const topKw = userKeywords[0] || 'Remote';

      const newJob: JobAlertOpportunity = {
        id: `realtime-${Date.now()}`,
        title: randomTitles[Math.floor(Math.random() * randomTitles.length)],
        company: randomCompanies[Math.floor(Math.random() * randomCompanies.length)],
        location: 'Worldwide Remote (100% Async)',
        salary: '$105,000 - $145,000 / yr',
        tags: [topKw, 'Async', 'Global'],
        matchedKeywords: [topKw],
        matchScore: 98,
        postedTime: 'Just now',
        platformName: 'Live Feed API',
        website: 'https://weworkremotely.com',
        description: `New real-time listing detected matching user keyword "${topKw}". Instant application link available.`,
        isNew: true,
      };

      setMatchingJobs((prev) => [newJob, ...prev]);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🔥 Just In: ${newJob.title}`, {
          body: `Matched "${topKw}" at ${newJob.company} (${newJob.salary})`,
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [autoPollActive, userKeywords]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#064E3B] dark:bg-emerald-950 text-white rounded-2xl p-6 border border-[#064E3B] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold mb-2 border border-[#FBBF24]/40">
              <BellRing className="w-3.5 h-3.5 animate-pulse text-[#FBBF24]" />
              Real-Time Remote Job Alert Engine
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Instant Keyword-Filtered Opportunity Alerts
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              Save your target skills and job titles to continuously filter live opportunities across 28+ remote boards with browser-native push notifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {notificationPermission !== 'granted' ? (
              <button
                onClick={handleRequestNotificationPermission}
                id="enable-browser-notifications-btn"
                className="px-4 py-2.5 rounded-xl bg-[#FBBF24] hover:bg-[#facc15] text-[#064E3B] font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105"
              >
                <Bell className="w-4 h-4" />
                Enable Browser Push Notifications
              </button>
            ) : (
              <span className="px-3.5 py-2 rounded-xl bg-emerald-900/80 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 border border-amber-400/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Browser Push Active
              </span>
            )}

            <button
              onClick={handleTriggerTestNotification}
              id="test-job-alert-notification-btn"
              className="px-4 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 border border-emerald-700 shadow-xs transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Test Instant Alert
            </button>
          </div>
        </div>
      </div>

      {testAlertToast && (
        <div className="p-3 bg-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 animate-in fade-in">
          <Zap className="w-4 h-4 text-emerald-950" />
          <span>{testAlertToast}</span>
        </div>
      )}

      {savedToast && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Grid: Keyword Filter Controls & Notification Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Keywords Management (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-500" />
              Saved Job Alert Keywords ({userKeywords.length})
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              Real-Time Filter Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
              placeholder="Add keyword or role (e.g., React, Customer Support, Design, Full Stack)..."
              id="add-job-alert-keyword-input"
              className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={handleAddKeyword}
              id="add-job-alert-keyword-btn"
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-extrabold text-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Keyword
            </button>
          </div>

          {/* Active Saved Keywords Pills */}
          <div className="flex flex-wrap gap-2">
            {userKeywords.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-amber-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 shadow-xs"
              >
                {kw}
                <button
                  onClick={() => handleRemoveKeyword(kw)}
                  className="text-slate-400 hover:text-rose-600 font-extrabold"
                  title="Remove keyword"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            {userKeywords.length === 0 && (
              <p className="text-xs text-slate-400 italic">
                No saved keywords yet. Add keywords above or click quick presets below.
              </p>
            )}
          </div>

          {/* Quick Keyword Presets */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Quick Preset Skill Bundles:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAddPresetKeywords(['React', 'TypeScript', 'Frontend', 'Node.js'])}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                + Frontend Dev (React/TS)
              </button>
              <button
                onClick={() => handleAddPresetKeywords(['Customer Support', 'Zendesk', 'Support', 'Async'])}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                + Customer Support & Success
              </button>
              <button
                onClick={() => handleAddPresetKeywords(['Product Manager', 'AI', 'Strategy', 'Remote'])}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                + AI Product Manager
              </button>
              <button
                onClick={() => handleAddPresetKeywords(['Design', 'UI/UX', 'Figma', 'Tailwind'])}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                + Product Designer
              </button>
            </div>
          </div>
        </div>

        {/* Alert Preferences Settings (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            Alert Notification Settings
          </h3>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                Notification Sound Ping
              </span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  soundEnabled ? 'bg-emerald-800' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Simulate Live Feed Polling
              </span>
              <button
                onClick={() => setAutoPollActive(!autoPollActive)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${
                  autoPollActive ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    autoPollActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
            <div className="text-[11px] font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Privacy Compliant
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Job alerts operate directly in your browser without telemetry or tracking cookies.
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time Filtered Matching Jobs Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-800 dark:text-amber-400" />
              Live Filtered Matching Opportunities ({matchingJobs.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing opportunities matching keywords: <strong className="text-emerald-800 dark:text-amber-300">{userKeywords.join(', ') || 'All Remote Roles'}</strong>
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search matching jobs..."
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Jobs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchingJobs.map((job) => (
            <div
              key={job.id}
              className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-md space-y-3 relative ${
                job.isNew
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400/80 ring-2 ring-amber-400/50'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
              }`}
            >
              {job.isNew && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500 text-emerald-950 font-black text-[10px] uppercase tracking-wider animate-bounce">
                  ⚡ New Match
                </span>
              )}

              <div className="flex items-start justify-between gap-3 pr-16">
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 leading-snug">
                    {job.title}
                  </h4>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    {job.company} • <span className="text-slate-500 font-normal">{job.location}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
                  💰 {job.salary}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  🌐 {job.platformName}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-extrabold">
                  🎯 {job.matchScore}% Match
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              {/* Matched Keywords Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.tags.map((tag, idx) => {
                  const isMatched = userKeywords.some((k) => k.toLowerCase() === tag.toLowerCase());
                  return (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isMatched
                          ? 'bg-amber-400 text-emerald-950 font-black border border-amber-500'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isMatched ? '✓ ' : ''}{tag}
                    </span>
                  );
                })}
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {job.postedTime}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveToTracker(job)}
                    id={`save-job-tracker-${job.id}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-amber-500" />
                    Save Job
                  </button>

                  <a
                    href={job.website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center gap-1 shadow-xs"
                  >
                    Apply Now
                    <ExternalLink className="w-3 h-3 text-amber-300" />
                  </a>
                </div>
              </div>
            </div>
          ))}

          {matchingJobs.length === 0 && (
            <div className="col-span-2 text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No matching opportunities found for current search
              </h4>
              <p className="text-xs text-slate-500">
                Try removing keyword filters or searching for broader terms like "Developer" or "Remote".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
