import React, { useState } from 'react';
import { Bell, CheckCircle2, ShieldCheck, X, Sparkles, Send, Mail, Clock } from 'lucide-react';
import { PushNotificationPreference } from '../types';

interface PushNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationPref: PushNotificationPreference;
  setNotificationPref: React.Dispatch<React.SetStateAction<PushNotificationPreference>>;
}

export const PushNotificationModal: React.FC<PushNotificationModalProps> = ({
  isOpen,
  onClose,
  notificationPref,
  setNotificationPref,
}) => {
  const [simulatedAlert, setSimulatedAlert] = useState<string | null>(null);
  const [digestPreview, setDigestPreview] = useState<{
    time: string;
    email: string;
    keywords: string[];
    matchesCount: number;
    sampleRoles: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleToggleEnable = async () => {
    const nextState = !notificationPref.enabled;
    if (nextState && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('Remote Jobs Platform', {
          body: 'Real-time push notifications activated for remote roles!',
          icon: '/favicon.ico',
        });
      }
    }
    setNotificationPref((prev) => ({ ...prev, enabled: nextState }));
  };

  const handleToggleDailyDigest = () => {
    setNotificationPref((prev) => ({
      ...prev,
      dailyDigestEnabled: !(prev.dailyDigestEnabled ?? true),
    }));
  };

  const handleGenerateDigestPreview = () => {
    const keywords = notificationPref.targetKeywords.filter((k) => k.trim().length > 0);
    const activeKeywords = keywords.length > 0 ? keywords : ['React', 'Remote', 'Frontend'];
    const email = notificationPref.digestEmail || 'alex.morgan@remotejobs.org';
    const time = notificationPref.digestTime || '08:00 AM UTC';

    const sampleRoles = [
      `Senior ${activeKeywords[0] || 'Software'} Engineer @ Shopify ($130k - $160k)`,
      `${activeKeywords[1] || 'Remote'} Lead Specialist @ GitLab ($110k - $145k)`,
      `Lead ${activeKeywords[0] || 'Full Stack'} Developer @ Toptal ($60/hr)`,
    ];

    setDigestPreview({
      time,
      email,
      keywords: activeKeywords,
      matchesCount: Math.floor(Math.random() * 8) + 5,
      sampleRoles,
    });
  };

  const handleTestSimulatedNotification = () => {
    const sampleJobs = [
      '⚡ Shopify just posted: Senior React Developer ($120k - $160k Remote)',
      '⚡ GitLab just posted: Async Technical Writer ($90k Remote)',
      '⚡ Toptal Client: Full Stack Engineer (USD $60/hr worldwide)',
    ];
    const alert = sampleJobs[Math.floor(Math.random() * sampleJobs.length)];
    setSimulatedAlert(alert);

    if (notificationPref.enabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Real-time Remote Alert', {
        body: alert,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-emerald-800/20 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#FBBF24] text-[#064E3B]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#064E3B] dark:text-emerald-100">
                Push Alerts & Daily Digest
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure instant push notifications and curated daily summary digests.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Enable Push Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              Enable Real-Time Push Notifications
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Instant browser & mobile alerts for matching postings.
            </span>
          </div>

          <button
            onClick={handleToggleEnable}
            id="toggle-push-notification-btn"
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
              notificationPref.enabled ? 'bg-[#064E3B]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                notificationPref.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Daily Digest Summary Section */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-[#FBBF24]/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#064E3B] dark:text-[#FBBF24]" />
              <span className="text-xs font-bold text-[#064E3B] dark:text-amber-300 block">
                Daily Job Digest Summary
              </span>
            </div>
            <button
              onClick={handleToggleDailyDigest}
              id="toggle-daily-digest-btn"
              className={`w-11 h-5 rounded-full transition-colors relative flex items-center ${
                notificationPref.dailyDigestEnabled ?? true ? 'bg-[#064E3B]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  notificationPref.dailyDigestEnabled ?? true ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Receive a single consolidated morning email & push summary of top job postings matching your keywords.
          </p>

          {(notificationPref.dailyDigestEnabled ?? true) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Digest Destination Email
                </label>
                <input
                  type="email"
                  value={notificationPref.digestEmail || 'alex.morgan@remotejobs.org'}
                  onChange={(e) =>
                    setNotificationPref((prev) => ({ ...prev, digestEmail: e.target.value }))
                  }
                  className="w-full p-2 text-xs bg-white dark:bg-slate-800 border border-amber-300/60 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Daily Delivery Time
                </label>
                <select
                  value={notificationPref.digestTime || '08:00 AM UTC'}
                  onChange={(e) =>
                    setNotificationPref((prev) => ({ ...prev, digestTime: e.target.value }))
                  }
                  className="w-full p-2 text-xs bg-white dark:bg-slate-800 border border-amber-300/60 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="08:00 AM UTC">08:00 AM UTC (Morning)</option>
                  <option value="12:00 PM UTC">12:00 PM UTC (Midday)</option>
                  <option value="06:00 PM UTC">06:00 PM UTC (Evening)</option>
                </select>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerateDigestPreview}
            id="preview-daily-digest-btn"
            className="w-full py-2 rounded-xl bg-[#064E3B] text-[#FBBF24] hover:bg-[#043e2f] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all mt-2"
          >
            <Clock className="w-3.5 h-3.5" />
            Generate & Preview Today's Daily Digest
          </button>
        </div>

        {/* Target Keywords Filter */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Target Keyword Filter
            </label>
            <input
              type="text"
              value={notificationPref.targetKeywords.join(', ')}
              onChange={(e) =>
                setNotificationPref((prev) => ({
                  ...prev,
                  targetKeywords: e.target.value.split(',').map((k) => k.trim()),
                }))
              }
              placeholder="React, Frontend, Virtual Assistant, Product"
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              General Push Frequency
            </label>
            <select
              value={notificationPref.frequency}
              onChange={(e) =>
                setNotificationPref((prev) => ({ ...prev, frequency: e.target.value as any }))
              }
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <option value="Instant">Instant (Real-Time Push)</option>
              <option value="Daily Summary">Daily Summary Digest Only</option>
              <option value="Weekly Summary">Weekly Roundup Digest</option>
            </select>
          </div>
        </div>

        {/* Daily Digest Preview Card */}
        {digestPreview && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-[#FBBF24] shadow-md space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-700">
              <span className="text-xs font-extrabold text-[#064E3B] dark:text-[#FBBF24] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Daily Digest Preview ({digestPreview.time})
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#064E3B] text-[#FBBF24]">
                {digestPreview.matchesCount} New Matches
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-300">
              Sent to <strong className="text-slate-800 dark:text-white">{digestPreview.email}</strong> matching keywords:{' '}
              <span className="text-[#064E3B] dark:text-[#FBBF24] font-semibold">
                {digestPreview.keywords.join(', ')}
              </span>
            </p>
            <ul className="space-y-1.5 pt-1">
              {digestPreview.sampleRoles.map((role, idx) => (
                <li key={idx} className="text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0" />
                  <span className="truncate">{role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Test Trigger Button */}
        <div className="pt-1">
          <button
            onClick={handleTestSimulatedNotification}
            id="test-simulated-push-btn"
            className="w-full py-2.5 rounded-xl bg-[#FBBF24] hover:bg-[#facc15] text-[#064E3B] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Test Simulated Real-Time Push Alert
          </button>
        </div>

        {simulatedAlert && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-amber-300 flex items-center gap-2 animate-bounce">
            <Send className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{simulatedAlert}</span>
          </div>
        )}
      </div>
    </div>
  );
};

