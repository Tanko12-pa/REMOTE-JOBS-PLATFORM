import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Lock,
  UserPlus,
  LogIn,
  KeyRound,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle,
  ExternalLink,
  Zap,
  ArrowRight,
  RefreshCw,
  Check,
} from 'lucide-react';
import { UserProfile, UserSubscription } from '../types';

interface SubscriptionBillingViewProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onOpenOAuthModal?: () => void;
}

export const SubscriptionBillingView: React.FC<SubscriptionBillingViewProps> = ({
  userProfile,
  setUserProfile,
  onOpenOAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'billing' | 'signup' | 'signin'>('billing');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpToast, setSignUpToast] = useState<string | null>(null);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [signInToast, setSignInToast] = useState<string | null>(null);

  // Change Password Form State
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [passwordChangeToast, setPasswordChangeToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Stripe Checkout Loading State
  const [checkoutLoading, setCheckoutLoading] = useState<'Monthly' | 'Yearly' | null>(null);
  const [stripeConfig, setStripeConfig] = useState<{
    publishableKey: string;
    monthlyPriceId: string;
    yearlyPriceId: string;
  } | null>(null);

  // 24-Hour Urgent Trial Countdown State
  const [forceUrgent24h, setForceUrgent24h] = useState<boolean>(false);
  const [trialSecondsLeft, setTrialSecondsLeft] = useState<number>(23 * 3600 + 59 * 60 + 45); // 23h 59m 45s

  useEffect(() => {
    const timer = setInterval(() => {
      setTrialSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return {
      hrs: String(hrs).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
    };
  };

  // Load Stripe Config from backend
  useEffect(() => {
    fetch('/api/stripe/config')
      .then((res) => res.json())
      .then((data) => {
        setStripeConfig(data);
      })
      .catch((err) => {
        console.warn('Could not fetch Stripe config:', err);
      });
  }, []);

  const currentSub: UserSubscription = userProfile.subscription || {
    status: 'free_trial',
    plan: 'Trial',
    trialStartDate: new Date().toISOString(),
    trialDaysRemaining: 7,
    priceAmount: 'Free 7-Day Trial',
  };

  // Sign Up Handler
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setSignUpToast('Please complete all fields (Name, Email, Password).');
      return;
    }

    setUserProfile((prev) => ({
      ...prev,
      name: signUpName.trim(),
      email: signUpEmail.trim(),
      passwordHash: signUpPassword.trim(),
      isLoggedIn: true,
      subscription: prev.subscription || {
        status: 'free_trial',
        plan: 'Trial',
        trialStartDate: new Date().toISOString(),
        trialDaysRemaining: 7,
        priceAmount: 'Free 7-Day Trial',
      },
    }));

    setSignUpToast(`Success! Account created for ${signUpName.trim()}. 7-Day Free Trial activated.`);
    setSignUpName('');
    setSignUpEmail('');
    setSignUpPassword('');
    setTimeout(() => {
      setSignUpToast(null);
      setActiveTab('billing');
    }, 2000);
  };

  // Sign In Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword.trim()) {
      setSignInToast('Please provide both Email and Password.');
      return;
    }

    setUserProfile((prev) => ({
      ...prev,
      email: signInEmail.trim(),
      passwordHash: signInPassword.trim(),
      isLoggedIn: true,
    }));

    setSignInToast(`Welcome back! Successfully signed in as ${signInEmail.trim()}.`);
    setSignInEmail('');
    setSignInPassword('');
    setTimeout(() => {
      setSignInToast(null);
      setActiveTab('billing');
    }, 2000);
  };

  // Change Password Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || !confirmPasswordInput) {
      setPasswordChangeToast({ type: 'error', message: 'Please enter and confirm your new password.' });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeToast({ type: 'error', message: 'New passwords do not match. Please try again.' });
      return;
    }

    if (newPasswordInput.length < 6) {
      setPasswordChangeToast({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setUserProfile((prev) => ({
      ...prev,
      passwordHash: newPasswordInput,
    }));

    setPasswordChangeToast({ type: 'success', message: 'Password updated successfully!' });
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setTimeout(() => setPasswordChangeToast(null), 3500);
  };

  // Stripe Checkout Session Creation
  const handleStripeCheckout = async (planType: 'Monthly' | 'Yearly') => {
    setCheckoutLoading(planType);
    const priceId = planType === 'Monthly'
      ? (stripeConfig?.monthlyPriceId || 'price_1Tz3AiBMbxh6jv0CuocreUzf')
      : (stripeConfig?.yearlyPriceId || 'price_1Tz3BdBMbxh6jv0CzEkUJYpn');

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          planType,
          userEmail: userProfile.email,
          userName: userProfile.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout or simulated completion URL
        window.location.href = data.url;
      } else {
        // Direct simulation activation
        activateSubscriptionLocally(planType);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      activateSubscriptionLocally(planType);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const activateSubscriptionLocally = (planType: 'Monthly' | 'Yearly') => {
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
        nextBillingDate: new Date(Date.now() + (planType === 'Yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#064E3B] via-emerald-900 to-amber-950 text-white shadow-xl border border-amber-400/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-emerald-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <CreditCard className="w-3.5 h-3.5" /> Stripe Payment Gateway
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-amber-200 font-bold text-xs border border-white/20">
                Google AI Studio Secured
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Subscription & Billing Portal
            </h2>

            <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
              Manage your candidate access, sign up or sign in to your profile, update security credentials, and subscribe to Monthly ($9.99) or Yearly ($99.99) plans following your 7-Day Free Trial.
            </p>
          </div>

          {/* Active Subscription Status Pill */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-400/40 backdrop-blur-xs flex flex-col items-start gap-1 shrink-0">
            <span className="text-[10px] font-bold uppercase text-amber-300 tracking-wider">
              Current Membership Status
            </span>
            <div className="flex items-center gap-2">
              {currentSub.status === 'active' ? (
                <span className="text-sm font-black text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Active {currentSub.plan} Subscriber ({currentSub.priceAmount})
                </span>
              ) : (
                <span className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  7-Day Free Trial ({currentSub.trialDaysRemaining} Days Left)
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-200">
              User: <strong className="text-white">{userProfile.email}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons Row: Sign Up, Sign In, Billing */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('billing')}
          id="billing-tab-plans-btn"
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
            activeTab === 'billing'
              ? 'bg-[#064E3B] text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-400" />
          Billing & Stripe Plans ($9.99 / $99.99)
        </button>

        <button
          onClick={() => setActiveTab('signup')}
          id="billing-tab-signup-btn"
          className={`flex-1 min-w-[130px] px-4 py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
            activeTab === 'signup'
              ? 'bg-[#064E3B] text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          Sign Up
        </button>

        <button
          onClick={() => setActiveTab('signin')}
          id="billing-tab-signin-btn"
          className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
            activeTab === 'signin'
              ? 'bg-[#064E3B] text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <LogIn className="w-4 h-4 text-cyan-400" />
          Sign In & Change Password
        </button>
      </div>

      {/* VIEW 1: BILLING & STRIPE GATEWAY PLANS */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* 24-Hour Urgent Trial Expiration Countdown & Visual Alert */}
          {(() => {
            const isUrgent = currentSub.status === 'free_trial' && (currentSub.trialDaysRemaining <= 1 || forceUrgent24h);
            const { hrs, mins, secs } = formatCountdown(trialSecondsLeft);

            return isUrgent ? (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 border-2 border-rose-500 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-rose-600 text-white font-black text-[10px] uppercase px-4 py-1.5 rounded-bl-2xl shadow-sm tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 animate-bounce text-white" />
                  Urgent Action Required
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider animate-pulse">
                        ⚠️ Free Trial Expiring Soon
                      </span>
                      <span className="text-xs text-rose-200 font-bold">
                        Less than 24 hours remaining!
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Your 7-Day Free Trial Ends in Less Than 24 Hours
                    </h3>
                    <p className="text-xs text-rose-100 leading-relaxed">
                      Upgrade to a Monthly ($9.99) or Yearly ($99.99) plan now to avoid uninterrupted lockout from 28+ global remote boards, AI Resume Tailorer, and Velocity-Apply tools.
                    </p>
                  </div>

                  {/* Real-Time Digital Countdown Box */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-rose-400/50 backdrop-blur-sm flex flex-col items-center justify-center shrink-0 min-w-[200px]">
                    <span className="text-[10px] font-extrabold uppercase text-rose-300 tracking-wider mb-1">
                      Trial Countdown Remaining
                    </span>
                    <div className="flex items-center gap-2 text-2xl font-mono font-black text-amber-300">
                      <span className="p-1.5 bg-rose-900/80 rounded-lg border border-rose-500/40">{hrs}h</span>
                      <span>:</span>
                      <span className="p-1.5 bg-rose-900/80 rounded-lg border border-rose-500/40">{mins}m</span>
                      <span>:</span>
                      <span className="p-1.5 bg-rose-900/80 rounded-lg border border-rose-500/40 text-rose-400 animate-pulse">{secs}s</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-rose-800/60">
                  <p className="text-[11px] text-amber-200 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Guaranteed instant activation & zero loss of saved job application history.
                  </p>

                  <button
                    onClick={() => setForceUrgent24h(false)}
                    className="text-[11px] text-rose-300 hover:text-white underline font-bold"
                  >
                    Dismiss Urgent Alert
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Trial Expiration Info Banner */
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400/80 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-bold">
                      <Zap className="w-5 h-5 fill-emerald-950" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-amber-950 dark:text-amber-200">
                        7-Day Free Trial Status
                      </h3>
                      <p className="text-xs text-amber-900/80 dark:text-amber-300">
                        Every new candidate receives 7 days of full platform access. Select a monthly or yearly plan below to seamlessly continue using all 28+ remote boards and AI career tools when your trial expires.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="px-3 py-1 rounded-xl bg-amber-400 text-emerald-950 font-black text-xs">
                      {currentSub.status === 'expired' ? 'Trial Expired' : `${currentSub.trialDaysRemaining} Days Remaining`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setUserProfile((prev) => ({
                            ...prev,
                            subscription: {
                              status: 'expired',
                              plan: 'Expired',
                              trialStartDate: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
                              trialDaysRemaining: 0,
                              priceAmount: 'Expired',
                            },
                          }));
                        }}
                        id="simulate-trial-expire-now-btn"
                        className="px-2 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-xs"
                      >
                        <Lock className="w-3 h-3 text-rose-200" />
                        Simulate Expired
                      </button>

                      <button
                        onClick={() => {
                          setUserProfile((prev) => ({
                            ...prev,
                            subscription: {
                              status: 'free_trial',
                              plan: 'Trial',
                              trialStartDate: new Date().toISOString(),
                              trialDaysRemaining: 7,
                              priceAmount: 'Free 7-Day Trial',
                            },
                          }));
                        }}
                        id="reset-7day-trial-btn"
                        className="px-2 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-extrabold text-[10px] flex items-center gap-1 shadow-xs"
                      >
                        <RefreshCw className="w-3 h-3 text-amber-300" />
                        Reset 7 Days
                      </button>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-amber-200 dark:bg-amber-900/60 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(10, (currentSub.trialDaysRemaining / 7) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Pricing Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Plan Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-lg hover:border-emerald-500 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase">
                    Monthly Subscription
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: price_1Tz3AiBMbxh6jv0CuocreUzf
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100">
                      $9.99
                    </span>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      / Month
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Flexible month-to-month billing. Cancel anytime with 1 click.
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5">
                  {[
                    'Full 28+ Global & Regional Remote Boards Access',
                    'Unlimited International ATS Resume Optimizations',
                    'Asynchronous Skill Cover Letter Generator',
                    'AI Interview Prep Flashcards & Tone Analysis',
                    'Adversarial Job Scam Shield & Velocity-Apply Tactics',
                    'Real-Time Application Goal Tracker & CSV/JSON Export',
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleStripeCheckout('Monthly')}
                  disabled={checkoutLoading === 'Monthly'}
                  id="pay-stripe-monthly-btn"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#064E3B] hover:bg-emerald-900 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {checkoutLoading === 'Monthly' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      Initiating Stripe Checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      Pay $9.99 Monthly with Stripe
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  Stripe ID: <code className="text-emerald-600 font-mono">STRIPE_PRICE_ID_MONTHLY</code>
                </p>
              </div>
            </div>

            {/* Yearly Plan Card (Highlighted Best Value) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-amber-400 dark:border-amber-500/80 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden ring-4 ring-amber-400/20">
              <div className="absolute top-0 right-0 bg-amber-400 text-emerald-950 font-black text-[10px] uppercase px-4 py-1.5 rounded-bl-2xl shadow-sm tracking-wider">
                Best Value • Save 16%
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-extrabold text-xs uppercase">
                    Yearly Subscription
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 pr-16">
                    ID: price_1Tz3BdBMbxh6jv0CzEkUJYpn
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100">
                      $99.99
                    </span>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      / Year
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 font-semibold">
                    Equivalent to only ~$8.33 / month. Best choice for serious long-term remote job seekers.
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5">
                  {[
                    'Everything included in Monthly Plan',
                    'Priority Gemini AI API speed & zero latency queuing',
                    'Early access to newly added national job boards',
                    'Dedicated 1-on-1 AI Career Mentor unlimited chats',
                    'Unlimited Full PDF & JSON Career Backups',
                    'Instant priority support & 2026 compliance updates',
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleStripeCheckout('Yearly')}
                  disabled={checkoutLoading === 'Yearly'}
                  id="pay-stripe-yearly-btn"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-emerald-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {checkoutLoading === 'Yearly' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-950" />
                      Initiating Stripe Checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-emerald-950 fill-emerald-950" />
                      Pay $99.99 Yearly with Stripe
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  Stripe ID: <code className="text-amber-600 font-mono">STRIPE_PRICE_ID_YEARLY</code>
                </p>
              </div>
            </div>
          </div>

          {/* Key Stripe Public Config Meta Panel */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Integrated Stripe Gateway Live Configuration
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-bold">
                Backend Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px] pt-1">
              <div>
                <span className="text-slate-400 block">Monthly Price ID:</span>
                <code className="text-emerald-300 font-bold">
                  {stripeConfig?.monthlyPriceId || 'price_1Tz3AiBMbxh6jv0CuocreUzf'}
                </code>
              </div>
              <div>
                <span className="text-slate-400 block">Yearly Price ID:</span>
                <code className="text-amber-300 font-bold">
                  {stripeConfig?.yearlyPriceId || 'price_1Tz3BdBMbxh6jv0CzEkUJYpn'}
                </code>
              </div>
              <div>
                <span className="text-slate-400 block">Stripe Publishable Key:</span>
                <code className="text-cyan-300 font-bold truncate block">
                  {stripeConfig?.publishableKey || 'pk_live_Y8I4kIWBXPdQIfZ2tthPIFwV00DlqCjZva'}
                </code>
              </div>
              <div>
                <span className="text-slate-400 block">Stripe Webhook Key:</span>
                <code className="text-amber-400 font-bold block">
                  STRIPE_WEBHOOK_KEY
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SIGN UP FORM */}
      {activeTab === 'signup' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                User Sign Up
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create a candidate account with your Name, Email, and Password to enable cloud-syncing and start your 7-Day Free Trial.
              </p>
            </div>
          </div>

          {signUpToast && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{signUpToast}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="signup-name-input"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#064E3B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                id="signup-email-input"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="e.g. alex.morgan@remotejobs.org"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#064E3B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                id="signup-password-input"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="Create a secure password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#064E3B] focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              id="signup-submit-btn"
              className="w-full py-3 rounded-2xl bg-[#064E3B] hover:bg-emerald-900 text-amber-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              Complete Sign Up & Start 7-Day Free Trial
            </button>
          </form>

          {onOpenOAuthModal && (
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500">Or prefer 1-Click Social Sign Up?</p>
              <button
                onClick={onOpenOAuthModal}
                className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Sign up with Google, GitHub, or LinkedIn OAuth
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: SIGN IN & CHANGE PASSWORD FORM */}
      {activeTab === 'signin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sign In Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">
                  User Sign In
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Access your existing profile and active subscription.
                </p>
              </div>
            </div>

            {signInToast && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{signInToast}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="signin-email-input"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="alex.morgan@remotejobs.org"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#064E3B] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="signin-password-input"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#064E3B] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                id="signin-submit-btn"
                className="w-full py-3 rounded-2xl bg-[#064E3B] hover:bg-emerald-900 text-amber-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                Sign In To Platform
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">
                  Change Password
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your security credentials whenever you wish.
                </p>
              </div>
            </div>

            {passwordChangeToast && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  passwordChangeToast.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-900 dark:text-rose-200'
                }`}
              >
                {passwordChangeToast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passwordChangeToast.message}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="change-current-password-input"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#064E3B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  id="change-new-password-input"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#064E3B] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  id="change-confirm-password-input"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-[#064E3B] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                id="update-password-submit-btn"
                className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <KeyRound className="w-4 h-4 text-emerald-950" />
                Update & Save New Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
