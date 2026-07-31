import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  auth,
  onAuthStateChanged,
  syncUserProfileToFirestore,
  subscribeToUserProfile,
} from './services/firebase';
import {
  INITIAL_PLATFORMS,
  getTranslation,
} from './data/platformsData';
import {
  Platform,
  UserProfile,
  ResumeVersion,
  ApplicationLog,
  PushNotificationPreference,
  LanguageCode,
} from './types';
import {
  loadSavedPlatformIds,
  saveSavedPlatformIds,
  loadUserProfile,
  saveUserProfile,
  loadResumeVersions,
  saveResumeVersions,
  loadApplicationLogs,
  saveApplicationLogs,
} from './utils/storage';

import { Header } from './components/Header';
import { LeftNavigationPanel } from './components/LeftNavigationPanel';
import { PlatformListView } from './components/PlatformListView';
import { AIResumeOptimizerView } from './components/AIResumeOptimizerView';
import { AICoverLetterGeneratorView } from './components/AICoverLetterGeneratorView';
import { AIInterviewCoachView } from './components/AIInterviewCoachView';
import { JobCategoriesD3RoadmapView } from './components/JobCategoriesD3RoadmapView';
import { SalaryTrendVisualizerView } from './components/SalaryTrendVisualizerView';
import { TipsAndAntiScamView } from './components/TipsAndAntiScamView';
import { ApplicationTrackerView } from './components/ApplicationTrackerView';
import { AICareerMentorView } from './components/AICareerMentorView';
import { UserProfileSection } from './components/UserProfileSection';
import { SubscriptionBillingView } from './components/SubscriptionBillingView';
import { JobAlertsView } from './components/JobAlertsView';
import { CareerPathingView } from './components/CareerPathingView';
import { PushNotificationModal } from './components/PushNotificationModal';
import { OAuthModal } from './components/OAuthModal';

export function App() {
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('remote_jobs_dark_mode') === 'true';
  });

  // Language State
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  // Active Category / View State
  const [activeCategory, setActiveCategory] = useState<string>('global_boards');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local Storage Data States
  const [savedPlatformIds, setSavedPlatformIds] = useState<string[]>(loadSavedPlatformIds);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>(() =>
    loadResumeVersions()
  );
  const [applicationLogs, setApplicationLogs] = useState<ApplicationLog[]>(() =>
    loadApplicationLogs()
  );

  // Modal States
  const [isPushModalOpen, setIsPushModalOpen] = useState<boolean>(false);
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState<boolean>(false);

  // Push Notification Preferences
  const [notificationPref, setNotificationPref] = useState<PushNotificationPreference>({
    enabled: true,
    frequency: 'Instant',
    targetKeywords: ['React', 'Developer', 'Virtual Assistant'],
  });

  // Sync Dark Mode to DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('remote_jobs_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('remote_jobs_dark_mode', 'false');
    }
  }, [darkMode]);

  // Check Stripe Checkout session redirect parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subStatus = params.get('subscription');
    const planParam = params.get('plan');
    const sessionId = params.get('session_id');

    if (subStatus === 'success') {
      const planType = planParam === 'Yearly' ? 'Yearly' : 'Monthly';
      const priceAmount = planType === 'Yearly' ? '$99.99/Yearly' : '$9.99/Monthly';

      setUserProfile((prev) => ({
        ...prev,
        subscription: {
          status: 'active',
          plan: planType,
          trialStartDate: prev.subscription?.trialStartDate || new Date().toISOString(),
          trialDaysRemaining: 30,
          priceAmount,
          stripeSubscriptionId: sessionId || `sub_${Date.now()}`,
          nextBillingDate: new Date(
            Date.now() + (planType === 'Yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
        },
      }));
      setActiveCategory('subscription_billing');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 1. Automatically track & manage 7-Day Free Trial period
  useEffect(() => {
    const sub = userProfile.subscription;
    if (!sub) return;

    if (sub.status === 'free_trial') {
      const startDate = sub.trialStartDate ? new Date(sub.trialStartDate).getTime() : Date.now();
      const now = Date.now();
      const elapsedDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.max(0, 7 - elapsedDays);

      if (remainingDays <= 0) {
        setUserProfile((prev) => ({
          ...prev,
          subscription: {
            ...prev.subscription!,
            status: 'expired',
            trialDaysRemaining: 0,
            plan: 'Expired',
          },
        }));
      } else if (sub.trialDaysRemaining !== remainingDays) {
        setUserProfile((prev) => ({
          ...prev,
          subscription: {
            ...prev.subscription!,
            trialDaysRemaining: remainingDays,
          },
        }));
      }
    }
  }, [userProfile.subscription?.trialStartDate, userProfile.subscription?.status]);

  // Derived Trial Expired check
  const isTrialExpired =
    userProfile.subscription?.status === 'expired' ||
    (userProfile.subscription?.status === 'free_trial' &&
      (userProfile.subscription?.trialDaysRemaining ?? 0) <= 0);

  // Helper to activate subscription from Lockout Modal or Billing
  const handleActivateSubscription = (planType: 'Monthly' | 'Yearly') => {
    const priceAmount = planType === 'Monthly' ? '$9.99/Monthly' : '$99.99/Yearly';
    setUserProfile((prev) => ({
      ...prev,
      subscription: {
        status: 'active',
        plan: planType,
        trialStartDate: prev.subscription?.trialStartDate || new Date().toISOString(),
        trialDaysRemaining: 30,
        priceAmount,
        stripeCustomerId: `cus_${Date.now()}`,
        stripeSubscriptionId: `sub_${Date.now()}`,
        nextBillingDate: new Date(
          Date.now() + (planType === 'Yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
      },
    }));
  };

  // Firebase Authentication & Realtime Firestore Sync
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUid(user.uid);
        setUserProfile((prev) => ({
          ...prev,
          isLoggedIn: true,
          oauthProvider: user.isAnonymous ? 'Guest' : (user.providerData[0]?.providerId || 'Firebase'),
          email: user.email || prev.email,
          name: user.displayName || prev.name,
        }));

        // Subscribe to Firestore User Profile updates
        const unsubscribeFirestore = subscribeToUserProfile(user.uid, (firestoreData) => {
          if (firestoreData) {
            if (firestoreData.savedPlatformIds) {
              setSavedPlatformIds(firestoreData.savedPlatformIds);
            }
            if (firestoreData.userProfile) {
              setUserProfile((prev) => ({
                ...prev,
                ...firestoreData.userProfile,
              }));
            }
          }
        });

        return () => unsubscribeFirestore();
      } else {
        setFirebaseUid(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync Persistence (Local & Firestore)
  useEffect(() => {
    saveSavedPlatformIds(savedPlatformIds);
    if (firebaseUid) {
      syncUserProfileToFirestore(firebaseUid, { savedPlatformIds });
    }
  }, [savedPlatformIds, firebaseUid]);

  useEffect(() => {
    saveUserProfile(userProfile);
    if (firebaseUid) {
      syncUserProfileToFirestore(firebaseUid, { userProfile });
    }
  }, [userProfile, firebaseUid]);

  useEffect(() => {
    saveResumeVersions(resumeVersions);
  }, [resumeVersions]);

  useEffect(() => {
    saveApplicationLogs(applicationLogs);
  }, [applicationLogs]);

  // Toggle Save Platform Bookmark
  const handleToggleSavePlatform = (id: string) => {
    setSavedPlatformIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Handle Tag Search Click
  const handleSelectTag = (tag: string) => {
    setSearchQuery(tag);
  };

  const handleSaveJobAlertToTracker = (job: Partial<ApplicationLog>) => {
    const newLog: ApplicationLog = {
      id: `app-log-${Date.now()}`,
      company: job.company || 'Remote Employer',
      role: job.role || 'Remote Role',
      dateApplied: job.dateApplied || new Date().toISOString().split('T')[0],
      status: 'Saved',
      platformUsed: job.platformUsed || 'Job Alerts Engine',
      notes: job.notes || 'Saved from Job Alerts',
      jobDescription: job.jobDescription || '',
    };
    setApplicationLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-emerald-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
      {/* Top Fixed Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onOpenJudgeAudit={() => {
          fetch('/api/judge/validate', { method: 'POST' })
            .then((r) => r.json())
            .then((data) => alert(`A2A Judge Audit Result:\n${JSON.stringify(data.auditSummary, null, 2)}`))
            .catch((e) => alert('Audit check failed: ' + e.message));
        }}
        onOpenOAuthModal={() => setIsOAuthModalOpen(true)}
        onOpenSubscriptionBilling={() => setActiveCategory('subscription_billing')}
        isOnline={navigator.onLine}
      />

      {/* Main Responsive Layout: Left Navigation Panel + Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-3 sm:p-4 gap-4">
        {/* Left Side Panel (All Buttons Arranged Here) */}
        <LeftNavigationPanel
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onSelectCategory={setActiveCategory}
          savedCount={savedPlatformIds.length}
          isTrialExpired={isTrialExpired}
        />

        {/* Right Workspace Area */}
        <main className="flex-1 min-w-0 relative">
          {/* Automatic Access Lockout Overlay when Trial is Expired and User is not on Subscription Billing page */}
          {isTrialExpired && activeCategory !== 'subscription_billing' && activeCategory !== 'subscription' && activeCategory !== 'billing' && (
            <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md rounded-2xl p-6 sm:p-10 text-white flex flex-col items-center justify-center text-center space-y-6 shadow-2xl animate-in fade-in duration-300 border-2 border-rose-500/80">
              <div className="p-4 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                <Lock className="w-12 h-12" />
              </div>

              <div className="space-y-2 max-w-xl">
                <span className="px-3.5 py-1 rounded-full bg-rose-500 text-white font-black text-xs uppercase tracking-wider">
                  Access Restricted • 7-Day Free Trial Expired
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Your 7-Day Free Trial Has Expired
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  To continue accessing 28+ remote job portals, AI ATS Resume Tailorer, Interview Coach, and Job Alert Engine, please select a Monthly or Annual subscription plan below.
                </p>
              </div>

              {/* Instant Subscription Action Cards inside Lockout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg text-left">
                {/* Monthly Plan Quick Box */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 uppercase">Monthly Plan</span>
                    <div className="text-2xl font-black text-white">$9.99 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                    <p className="text-[11px] text-slate-400 mt-1">Flexible month-to-month billing. Cancel anytime.</p>
                  </div>
                  <button
                    onClick={() => {
                      handleActivateSubscription('Monthly');
                      setActiveCategory('subscription_billing');
                    }}
                    id="lockout-select-monthly-btn"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                    Select $9.99 Monthly
                  </button>
                </div>

                {/* Yearly Plan Quick Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/80 to-slate-900 border-2 border-amber-400/80 space-y-3 flex flex-col justify-between relative">
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-md bg-amber-400 text-emerald-950 font-black text-[9px] uppercase">Best Value</span>
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 uppercase">Yearly Plan</span>
                    <div className="text-2xl font-black text-amber-300">$99.99 <span className="text-xs font-normal text-slate-300">/yr</span></div>
                    <p className="text-[11px] text-amber-100 mt-1">Save 16% • Equivalent to ~$8.33 / month.</p>
                  </div>
                  <button
                    onClick={() => {
                      handleActivateSubscription('Yearly');
                      setActiveCategory('subscription_billing');
                    }}
                    id="lockout-select-yearly-btn"
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950" />
                    Select $99.99 Yearly
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveCategory('subscription_billing')}
                  id="lockout-go-to-billing-btn"
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                >
                  Go to Subscription & Billing Portal
                  <ArrowRight className="w-4 h-4 text-emerald-950" />
                </button>
              </div>
            </div>
          )}
          {/* Render Views dynamically based on activeCategory */}
          {['global_boards', 'national_canada', 'national_nigeria', 'national_ghana', 'national_kenya', 'national_uk', 'national_usa', 'freelance', 'tech_startup', 'creative', 'saved'].includes(activeCategory) && (
            <PlatformListView
              platforms={INITIAL_PLATFORMS}
              activeCategory={activeCategory}
              savedIds={savedPlatformIds}
              onToggleSave={handleToggleSavePlatform}
              onSelectTag={handleSelectTag}
              searchQuery={searchQuery}
            />
          )}

          {activeCategory === 'ai_resume' && (
            <AIResumeOptimizerView
              resumeVersions={resumeVersions}
              setResumeVersions={setResumeVersions}
            />
          )}

          {(activeCategory === 'ai_cover_letter' || activeCategory === 'ai_letter') && (
            <AICoverLetterGeneratorView userProfile={userProfile} />
          )}

          {activeCategory === 'ai_interview' && (
            <AIInterviewCoachView
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          )}

          {(activeCategory === 'd3_roadmap' || activeCategory === 'categories_roadmap') && (
            <JobCategoriesD3RoadmapView />
          )}

          {activeCategory === 'career_pathing' && (
            <CareerPathingView
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          )}

          {(activeCategory === 'salary_visualizer' || activeCategory === 'salary_trends') && (
            <SalaryTrendVisualizerView />
          )}

          {(activeCategory === 'tips_scams' || activeCategory === 'scam_tips') && (
            <TipsAndAntiScamView />
          )}

          {activeCategory === 'ai_career_mentor' && (
            <AICareerMentorView userProfile={userProfile} />
          )}

          {(activeCategory === 'app_tracker' || activeCategory === 'application_tracker') && (
            <ApplicationTrackerView
              applicationLogs={applicationLogs}
              setApplicationLogs={setApplicationLogs}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              savedPlatformIds={savedPlatformIds}
            />
          )}

          {(activeCategory === 'job_alerts' || activeCategory === 'job_alert') && (
            <JobAlertsView
              userKeywords={userProfile.primarySkills}
              setUserKeywords={(update) => {
                if (typeof update === 'function') {
                  setUserProfile((prev) => ({
                    ...prev,
                    primarySkills: update(prev.primarySkills),
                  }));
                } else {
                  setUserProfile((prev) => ({
                    ...prev,
                    primarySkills: update,
                  }));
                }
              }}
              onSaveJobToTracker={handleSaveJobAlertToTracker}
            />
          )}

          {(activeCategory === 'subscription_billing' || activeCategory === 'subscription' || activeCategory === 'billing') && (
            <SubscriptionBillingView
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              onOpenOAuthModal={() => setIsOAuthModalOpen(true)}
            />
          )}

          {activeCategory === 'profile' && (
            <UserProfileSection
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              onOpenOAuthModal={() => setIsOAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Push Notification & OAuth Modals */}
      <PushNotificationModal
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        notificationPref={notificationPref}
        setNotificationPref={setNotificationPref}
      />

      <OAuthModal
        isOpen={isOAuthModalOpen}
        onClose={() => setIsOAuthModalOpen(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />
    </div>
  );
}

export default App;
