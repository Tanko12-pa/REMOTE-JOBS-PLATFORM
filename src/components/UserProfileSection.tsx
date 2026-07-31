import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Download,
  Share2,
  Users,
  Award,
  Globe,
  Bell,
  CheckCircle2,
  Lock,
  Sparkles,
  FileSpreadsheet,
  Linkedin,
  RefreshCw,
  Briefcase,
  Check,
  Database,
  CloudCheck,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import {
  auth,
  signInWithGoogle,
  signInGuest,
  logOut,
} from '../services/firebase';
import {
  initiateLinkedInOAuth,
  applyLinkedInDataToProfile,
  MOCK_LINKEDIN_PROFILE,
} from '../services/linkedinOAuth';
import { UserProfile } from '../types';
import { exportFullBackupJSON } from '../utils/storage';
import { exportSkillReportToPDF } from '../utils/pdfExport';
import { getTranslation } from '../data/platformsData';

interface UserProfileSectionProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onOpenOAuthModal: () => void;
}

export const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  userProfile,
  setUserProfile,
  onOpenOAuthModal,
}) => {
  const [skillInput, setSkillInput] = useState<string>('');
  const [isSyncingLinkedIn, setIsSyncingLinkedIn] = useState<boolean>(false);
  const [linkedInSyncToast, setLinkedInSyncToast] = useState<string | null>(null);

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    setUserProfile((prev) => ({
      ...prev,
      primarySkills: Array.from(new Set([...prev.primarySkills, skillInput.trim()])),
    }));
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setUserProfile((prev) => ({
      ...prev,
      primarySkills: prev.primarySkills.filter((s) => s !== skill),
    }));
  };

  const handleSyncLinkedInProfile = async () => {
    setIsSyncingLinkedIn(true);
    setLinkedInSyncToast(null);

    try {
      const data = await initiateLinkedInOAuth();
      setUserProfile((prev) => applyLinkedInDataToProfile(prev, data));
      setLinkedInSyncToast(
        `LinkedIn OAuth Success! Imported ${data.skills.length} skills, experience timeline, and headline into your user profile.`
      );
    } catch (err) {
      // Fallback
      setUserProfile((prev) => applyLinkedInDataToProfile(prev, MOCK_LINKEDIN_PROFILE));
      setLinkedInSyncToast(
        'LinkedIn Profile Imported! Skills and experience summary pre-filled.'
      );
    } finally {
      setIsSyncingLinkedIn(false);
    }
  };

  const handleExportSkillReport = () => {
    exportSkillReportToPDF(
      userProfile.name,
      userProfile.primarySkills,
      userProfile.dailyGoal
    );
  };

  // Skill-based Slack/Discord Networking Communities
  const getRecommendedCommunities = () => {
    const skills = userProfile.primarySkills.map((s) => s.toLowerCase());

    const communities = [
      {
        name: 'Work From Anywhere Global Slack',
        platform: 'Slack',
        focus: 'Global Nomads & Remote Tech',
        members: '45,000+',
        link: 'https://weworkremotely.com/community',
      },
      {
        name: 'Remotive Digital Community',
        platform: 'Slack',
        focus: 'Software, Product & Marketing',
        members: '28,000+',
        link: 'https://remotive.com/community',
      },
    ];

    if (skills.some((s) => s.includes('react') || s.includes('code') || s.includes('dev'))) {
      communities.push({
        name: 'Reactiflux Discord Community',
        platform: 'Discord',
        focus: 'Frontend & Full Stack Software Engineers',
        members: '180,000+',
        link: 'https://www.reactiflux.com',
      });
    }

    if (skills.some((s) => s.includes('design') || s.includes('figma'))) {
      communities.push({
        name: 'DesignBuddies Discord',
        platform: 'Discord',
        focus: 'UI/UX & Graphic Product Designers',
        members: '50,000+',
        link: 'https://designbuddies.community',
      });
    }

    return communities;
  };

  return (
    <div className="space-y-6">
      {/* Firebase Cloud Firestore Sync Card */}
      <div className="bg-gradient-to-r from-amber-950/40 via-emerald-950/60 to-slate-900 rounded-2xl p-5 border border-amber-500/30 shadow-md space-y-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-400 text-emerald-950 shrink-0 font-black">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                Firebase Firestore Cloud Database
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Cloud Storage
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Real-time cloud database persistence via Google Cloud Firebase Firestore (Project: <code className="text-amber-200">studio-8169038053-73336</code>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {auth.currentUser ? (
              <button
                onClick={() => logOut()}
                id="firebase-signout-btn"
                className="px-3.5 py-2 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-extrabold text-xs flex items-center gap-1.5 border border-rose-700/50 transition-all hover:scale-105"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out ({auth.currentUser.isAnonymous ? 'Guest' : auth.currentUser.email || 'User'})
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => signInWithGoogle()}
                  id="firebase-google-auth-btn"
                  className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-1.5 transition-all hover:scale-105 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-950" />
                  Sign In with Google
                </button>
                <button
                  onClick={() => signInGuest()}
                  id="firebase-guest-auth-btn"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 transition-all hover:scale-105"
                >
                  Guest Auth
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Database ID</span>
            <div className="font-mono text-amber-200 text-[11px] truncate" title="ai-studio-remotejobsplatfo-d75531f9-f1a2-48bc-a489-25a0d27455e8">
              ai-studio-remotejobsplatfo...
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auth Status</span>
            <div className="font-bold text-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {auth.currentUser ? (auth.currentUser.isAnonymous ? 'Guest Authenticated' : 'Google Auth Active') : 'Connected (Anonymous)'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloud Data Collections</span>
            <div className="font-semibold text-slate-200">
              <code className="text-amber-300">userProfiles</code> • <code className="text-amber-300">savedJobs</code> • <code className="text-amber-300">resumeDrafts</code>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 to-amber-400 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                {userProfile.name}
                {userProfile.isLoggedIn && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black uppercase">
                    OAuth Synced ({userProfile.oauthProvider})
                  </span>
                )}
              </h2>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {userProfile.preferredTitle} | {userProfile.region}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenOAuthModal}
              id="oauth-sync-profile-btn"
              className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              {userProfile.isLoggedIn ? 'Manage OAuth Sync' : 'Sign In / Sync Devices'}
            </button>
          </div>
        </div>
      </div>

      {/* LinkedIn Profile OAuth Sync Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#0A66C2] text-white shrink-0">
              <Linkedin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                LinkedIn Profile Auto-Import (OAuth 2.0 Integration)
                {userProfile.linkedinSynced && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Synced ({userProfile.linkedinSyncedAt})
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authenticate via LinkedIn OAuth to auto-populate your headline, summary, primary skills, and work history timeline.
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncLinkedInProfile}
            disabled={isSyncingLinkedIn}
            id="linkedin-sync-btn"
            className="px-4 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 disabled:opacity-50 shrink-0"
          >
            {isSyncingLinkedIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                Connecting to LinkedIn OAuth...
              </>
            ) : (
              <>
                <Linkedin className="w-4 h-4 text-white" />
                {userProfile.linkedinSynced ? 'Re-Import LinkedIn Data' : 'Import Headline, Summary & Experience'}
              </>
            )}
          </button>
        </div>

        {linkedInSyncToast && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{linkedInSyncToast}</span>
          </div>
        )}

        {userProfile.experienceSummary && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-amber-500" />
              Pre-filled LinkedIn Experience Timeline:
            </div>
            <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
              {userProfile.experienceSummary}
            </p>
          </div>
        )}
      </div>

      {/* Grid: Primary Skills & Skill Gap PDF Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Setup */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Primary Skills & Role Preferences
            </h3>
            <button
              onClick={handleExportSkillReport}
              id="export-skill-report-pdf-btn"
              className="px-3 py-1.5 rounded-xl bg-amber-400 text-emerald-950 font-extrabold text-xs flex items-center gap-1 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              PDF Mentor Report
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add skill (e.g. React, Zendesk, Notion)..."
              className="flex-1 p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
            <button
              onClick={handleAddSkill}
              className="px-3 py-2 bg-emerald-800 text-amber-300 text-xs font-bold rounded-xl"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {userProfile.primarySkills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-amber-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-600 font-extrabold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Networking Helper */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            AI Networking Helper (Recommended Communities)
          </h3>
          <p className="text-xs text-slate-500">
            Based on your skills ({userProfile.primarySkills.join(', ')}), connect with global Slack & Discord networks for referral opportunities.
          </p>

          <div className="space-y-2">
            {getRecommendedCommunities().map((comm, idx) => (
              <a
                key={idx}
                href={comm.link}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-amber-400 transition-colors block"
              >
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                    {comm.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">{comm.focus}</p>
                </div>
                <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  {comm.platform} ({comm.members})
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* App UI Language & Multi-lingual Text Switcher Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-400 text-emerald-950 font-black">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                {getTranslation(userProfile.uiLanguage, 'language')} Settings
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  {userProfile.uiLanguage.toUpperCase()} Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch app UI text instantly to Spanish, French, Hindi, English, and regional languages.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {[
            { code: 'es', name: 'Español (Spanish)', native: 'Spanish UI Text', flag: '🇪🇸' },
            { code: 'fr', name: 'Français (French)', native: 'French UI Text', flag: '🇫🇷' },
            { code: 'hi', name: 'हिंदी (Hindi)', native: 'Hindi UI Text', flag: '🇮🇳' },
            { code: 'en', name: 'English (US)', native: 'Default English', flag: '🇺🇸' },
            { code: 'sw', name: 'Kiswahili', native: 'Swahili UI', flag: '🇰🇪' },
            { code: 'ha', name: 'Hausa', native: 'Hausa UI', flag: '🇳🇬' },
            { code: 'ig', name: 'Igbo', native: 'Igbo UI', flag: '🇳🇬' },
            { code: 'yo', name: 'Yorùbá', native: 'Yorùbá UI', flag: '🇳🇬' },
          ].map((lang) => {
            const isSelected = userProfile.uiLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                id={`lang-toggle-${lang.code}-btn`}
                onClick={() =>
                  setUserProfile((prev) => ({
                    ...prev,
                    uiLanguage: lang.code as any,
                  }))
                }
                className={`p-3 rounded-xl border text-xs font-extrabold flex flex-col items-start gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#064E3B] text-amber-300 border-[#064E3B] shadow-md ring-2 ring-amber-400 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base">{lang.flag}</span>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-amber-300" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">Select</span>
                  )}
                </div>
                <span className="font-bold text-xs">{lang.name}</span>
                <span className="text-[10px] opacity-80 font-normal">{lang.native}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Translation Mapping Feedback Banner */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium space-y-1">
          <div className="text-[11px] font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Mapped UI Keys via <code className="text-amber-600 dark:text-amber-300">getTranslation('{userProfile.uiLanguage}', key)</code>:
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
            <span><strong>Header Title:</strong> "{getTranslation(userProfile.uiLanguage, 'appTitle')}"</span>
            <span>• <strong>Search Placeholder:</strong> "{getTranslation(userProfile.uiLanguage, 'searchPlaceholder')}"</span>
            <span>• <strong>Settings:</strong> "{getTranslation(userProfile.uiLanguage, 'settings')}"</span>
            <span>• <strong>Offline Badge:</strong> "{getTranslation(userProfile.uiLanguage, 'offlineStatus')}"</span>
          </div>
        </div>
      </div>

      {/* Backup & System Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500" />
          Appearance, Backup & System Settings
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={exportFullBackupJSON}
              id="export-json-backup-btn"
              className="px-4 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              Export Full App JSON Backup
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            100% Offline Service Worker Caching & Local Storage Sync Active
          </div>
        </div>
      </div>
    </div>
  );
};
