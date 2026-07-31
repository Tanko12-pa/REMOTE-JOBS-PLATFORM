import React, { useState, useEffect } from 'react';
import { Search, Globe, Moon, Sun, Bell, ShieldCheck, Menu, CheckCircle2, User, CreditCard, Clock } from 'lucide-react';
import { UserProfile } from '../types';
import { UI_TRANSLATIONS } from '../data/platformsData';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onToggleLeftPanel?: () => void;
  onOpenJudgeAudit: () => void;
  onOpenOAuthModal: () => void;
  onOpenSubscriptionBilling?: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  userProfile,
  setUserProfile,
  onToggleLeftPanel,
  onOpenJudgeAudit,
  onOpenOAuthModal,
  onOpenSubscriptionBilling,
  isOnline: initialIsOnline,
}) => {
  const t = UI_TRANSLATIONS[userProfile.uiLanguage] || UI_TRANSLATIONS.en;

  // Live countdown timer state for 7-day free trial remaining hours & minutes
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : initialIsOnline
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleDarkMode = () => {
    setUserProfile((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as any;
    setUserProfile((prev) => ({ ...prev, uiLanguage: newLang }));
  };

  return (
    <header className="sticky top-0 z-40 bg-[#064E3B] dark:bg-emerald-950 border-b border-[#064E3B]/80 text-white shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: Mobile Drawer Button & Logo Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLeftPanel}
            id="mobile-drawer-toggle-btn"
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#FBBF24] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
            aria-label="Toggle Side Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FBBF24] text-[#064E3B] flex items-center justify-center font-black text-lg shadow-sm">
              R
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white leading-tight flex items-center gap-2 uppercase">
                REMOTE JOBS <span className="text-[#FBBF24]">PLATFORM</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40">
                  Global
                </span>
              </h1>
              <p className="text-[11px] text-emerald-200 hidden md:block">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Real-time Search Input */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-200" />
            <input
              type="text"
              id="global-header-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-black/20 border border-white/20 rounded-xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-[#FBBF24] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-200 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: OAuth, Language, Judge Audit, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Online/Offline Status Indicator */}
          <div
            id="network-online-offline-indicator"
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
              isOnline
                ? 'bg-emerald-900/80 text-emerald-100 border-emerald-400/40'
                : 'bg-slate-800/90 text-slate-300 border-slate-600/50'
            }`}
            title={isOnline ? 'Online - All Live Feeds Active' : 'Offline Mode - Cached Data Active'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400 animate-ping'
              }`}
            />
            {isOnline ? 'Online' : 'Offline Mode'}
          </div>

          {/* Subscription & Billing Quick Button */}
          {onOpenSubscriptionBilling && (
            <button
              onClick={onOpenSubscriptionBilling}
              id="header-subscription-billing-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs transition-all hover:scale-105 shadow-sm"
              title="Subscription & Billing (7-Day Trial / Stripe $9.99/$99.99)"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950" />
              <span className="hidden lg:inline">Billing & Plans</span>
            </button>
          )}

          {/* A2A Judge Agent Launcher */}
          <button
            onClick={onOpenJudgeAudit}
            id="a2a-judge-audit-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FBBF24] border border-[#FBBF24]/30 text-xs font-bold transition-all hover:scale-105"
            title="A2A Judge Agent Real-Time Audit"
          >
            <ShieldCheck className="w-4 h-4 text-[#FBBF24]" />
            <span className="hidden md:inline">A2A Audit</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 absolute left-2 text-[#FBBF24] pointer-events-none" />
            <select
              id="header-language-selector"
              value={userProfile.uiLanguage}
              onChange={handleLanguageChange}
              className="pl-7 pr-2 py-1.5 text-xs bg-black/20 border border-white/20 text-emerald-100 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FBBF24] font-medium"
            >
              <option value="en" className="bg-[#064E3B] text-white">English (US)</option>
              <option value="fr" className="bg-[#064E3B] text-white">Français</option>
              <option value="es" className="bg-[#064E3B] text-white">Español</option>
              <option value="ha" className="bg-[#064E3B] text-white">Hausa</option>
              <option value="ig" className="bg-[#064E3B] text-white">Igbo</option>
              <option value="yo" className="bg-[#064E3B] text-white">Yorùbá</option>
              <option value="sw" className="bg-[#064E3B] text-white">Kiswahili</option>
              <option value="pcm" className="bg-[#064E3B] text-white">Pidgin</option>
            </select>
          </div>

          {/* Persistent Subscription Status Badge & Trial Countdown near User Profile */}
          {(() => {
            const sub = userProfile.subscription;
            const isPremium = sub?.status === 'active';
            const isExpired = sub?.status === 'expired';

            // Calculate precise 7-day free trial remaining time
            let daysLeft = sub?.trialDaysRemaining ?? 7;
            let hrsLeft = 0;
            let minsLeft = 0;

            if (sub?.status === 'free_trial') {
              const startMs = sub.trialStartDate ? new Date(sub.trialStartDate).getTime() : Date.now();
              const endMs = startMs + 7 * 24 * 60 * 60 * 1000;
              const remainingMs = Math.max(0, endMs - nowTime);

              const totalMins = Math.floor(remainingMs / (1000 * 60));
              daysLeft = Math.floor(totalMins / (24 * 60));
              hrsLeft = Math.floor((totalMins % (24 * 60)) / 60);
              minsLeft = totalMins % 60;
            }

            return (
              <button
                onClick={onOpenSubscriptionBilling}
                id="header-sub-status-badge"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all hover:scale-105 shadow-xs border ${
                  isPremium
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 text-emerald-950 border-amber-300 shadow-amber-400/20'
                    : isExpired
                    ? 'bg-rose-900/80 text-rose-200 border-rose-500/50 animate-pulse'
                    : 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
                }`}
                title="Current Subscription Status — Click to manage billing"
              >
                <span className={`w-2 h-2 rounded-full ${isPremium ? 'bg-emerald-950 animate-ping' : isExpired ? 'bg-rose-400' : 'bg-amber-400'}`} />
                <span className="hidden sm:inline-flex items-center gap-1">
                  {isPremium ? (
                    `Premium Member (${sub?.plan || 'Active'})`
                  ) : isExpired ? (
                    'Trial Expired — Upgrade'
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-300 animate-pulse" />
                      Trial Ends in: {daysLeft > 0 ? `${daysLeft}d ` : ''}{hrsLeft}h {minsLeft}m
                    </>
                  )}
                </span>
                <span className="sm:hidden">
                  {isPremium
                    ? 'Premium'
                    : isExpired
                    ? 'Expired'
                    : `${daysLeft > 0 ? `${daysLeft}d ` : ''}${hrsLeft}h`}
                </span>
              </button>
            );
          })()}

          {/* OAuth Sync Profile Button */}
          <button
            onClick={onOpenOAuthModal}
            id="oauth-user-profile-btn"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              userProfile.isLoggedIn
                ? 'bg-[#FBBF24] text-[#064E3B] hover:bg-[#facc15]'
                : 'bg-white/10 text-[#FBBF24] hover:bg-white/20 border border-[#FBBF24]/30'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {userProfile.isLoggedIn ? userProfile.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            id="header-dark-mode-toggle"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FBBF24] transition-colors"
            title={t.darkMode}
          >
            {userProfile.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
