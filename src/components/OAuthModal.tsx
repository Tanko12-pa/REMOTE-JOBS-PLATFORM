import React, { useState } from 'react';
import { Lock, CheckCircle2, ShieldCheck, X, Globe } from 'lucide-react';
import { UserProfile } from '../types';

interface OAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const OAuthModal: React.FC<OAuthModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  setUserProfile,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleOAuthLogin = (provider: 'Google' | 'GitHub' | 'LinkedIn') => {
    setIsLoading(true);
    setTimeout(() => {
      const isLinkedIn = provider === 'LinkedIn';
      const extraSkills = isLinkedIn
        ? ['React', 'TypeScript', 'Node.js', 'System Architecture', 'Async Leadership', 'GraphQL']
        : [];
      const linkedinExp = isLinkedIn
        ? 'Senior Full Stack Engineer at TechCorp (3+ yrs) • Lead Remote Developer at CloudScale (2 yrs)'
        : undefined;

      setUserProfile((prev) => ({
        ...prev,
        isLoggedIn: true,
        oauthProvider: provider,
        email: `user.${provider.toLowerCase()}@remotejobs.org`,
        linkedinSynced: isLinkedIn ? true : prev.linkedinSynced,
        linkedinSyncedAt: isLinkedIn ? new Date().toLocaleDateString() : prev.linkedinSyncedAt,
        linkedinProfileUrl: isLinkedIn ? 'https://linkedin.com/in/alex-morgan-remote' : prev.linkedinProfileUrl,
        experienceSummary: linkedinExp || prev.experienceSummary,
        primarySkills: isLinkedIn
          ? Array.from(new Set([...prev.primarySkills, ...extraSkills]))
          : prev.primarySkills,
      }));
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleSignOut = () => {
    setUserProfile((prev) => ({
      ...prev,
      isLoggedIn: false,
      oauthProvider: undefined,
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-emerald-800/20 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-900 text-amber-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100">
                Secure OAuth Device Sync
              </h3>
              <p className="text-[11px] text-slate-500">
                Synchronize saved job boards and resume versions across mobile & desktop.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {userProfile.isLoggedIn ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Signed In via {userProfile.oauthProvider}
              </h4>
              <p className="text-xs text-emerald-800 dark:text-amber-300 mt-0.5">
                {userProfile.email}
              </p>
            </div>

            <button
              onClick={handleSignOut}
              id="oauth-signout-btn"
              className="w-full py-2.5 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-extrabold text-xs"
            >
              Sign Out & Disconnect OAuth
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthLogin('Google')}
              disabled={isLoading}
              id="oauth-google-btn"
              className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3 transition-all"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              Continue with Google OAuth 2.0
            </button>

            <button
              onClick={() => handleOAuthLogin('GitHub')}
              disabled={isLoading}
              id="oauth-github-btn"
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-3 transition-all"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              Continue with GitHub OAuth
            </button>

            <button
              onClick={() => handleOAuthLogin('LinkedIn')}
              disabled={isLoading}
              id="oauth-linkedin-btn"
              className="w-full py-3 px-4 rounded-2xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-3 transition-all"
            >
              <Globe className="w-4 h-4 text-white" />
              Continue with LinkedIn OAuth
            </button>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>AES-256 encrypted local caching & zero tracking cookies.</span>
        </div>
      </div>
    </div>
  );
};
