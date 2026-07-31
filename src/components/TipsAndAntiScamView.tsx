import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Globe,
  MapPin,
  Lock,
  Zap,
  Search,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { SCAM_REGIONS } from '../data/platformsData';

export const TipsAndAntiScamView: React.FC = () => {
  const [postingInput, setPostingInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    riskRating: 'Low' | 'Medium' | 'High';
    riskScore: number;
    redFlagsDetected: string[];
    analysisSummary: string;
    speedToApplyTactics: string[];
  } | null>({
    riskRating: 'High',
    riskScore: 85,
    redFlagsDetected: [
      'Advance-fee cashier check mentioned for buying home office equipment.',
      'Interview proposed strictly over encrypted text app (Telegram / WhatsApp).',
      'Recruiter email domain (@gmail.com / @outlook.com) mismatch with official company portal.',
    ],
    analysisSummary:
      'CRITICAL RISK WARNING: This posting/email contains classic advance-fee check fraud markers. Legitimate employers never issue paper checks or require candidates to purchase equipment from proprietary vendors.',
    speedToApplyTactics: [
      'Enable RSS / Webhook alerts on Greenhouse, Lever, and Ashby portals to get notified within 15 minutes of posting.',
      'Keep 3 pre-formatted 1-page resume variants ready for instant 1-click submission.',
      'Use standard fill templates for boilerplate ATS questions (sponsorship, notice period) to apply in under 3 minutes.',
      'Direct-message the hiring manager on LinkedIn within 1 hour of applying with a 2-sentence tailored pitch.',
    ],
  });

  const handleRunScamShield = async () => {
    if (!postingInput.trim() && !emailInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/gemini/scam-shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postingContent: postingInput,
          recruiterEmail: emailInput,
        }),
      });

      const data = await response.json();
      if (data.success && data.scamAnalysis) {
        setAnalysisResult(data.scamAnalysis);
      }
    } catch (err) {
      console.error('Failed to run scam shield', err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 border border-rose-500/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-2 border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              Community Anti-Fraud & Scam Heatmap
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Tips for Getting Hired Faster & Anti-Scam Guidance
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Protect your personal information and financial safety when applying for international remote jobs.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Scam Shield & Velocity-Apply Analyzer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Job Scam Shield & Velocity-Apply Guide
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste suspicious job postings or recruiter emails to evaluate fraud risk (0-100%) & get 4x speed tactics.
            </p>
          </div>
          <span className="text-xs font-extrabold text-emerald-800 dark:text-amber-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 self-start sm:self-auto">
            Adversarial Scam Engine
          </span>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Job Posting Text / Offer Email Content
            </label>
            <textarea
              value={postingInput}
              onChange={(e) => setPostingInput(e.target.value)}
              placeholder="Paste job posting snippet, interview offer email, or requirements text here..."
              rows={4}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Recruiter Email Address / Domain
              </label>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. hr-hiring@gmail.com or hr@company-careers.net"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <button
              onClick={handleRunScamShield}
              disabled={isAnalyzing || (!postingInput.trim() && !emailInput.trim())}
              className="w-full py-3 bg-[#064E3B] hover:bg-emerald-900 text-amber-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xs"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  Running Scam Shield Scan...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-amber-400" />
                  Scan Posting for Scam Risk & Speed Tactics
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scan Results Panel */}
        {analysisResult && (
          <div className="mt-4 p-5 rounded-2xl border space-y-4 bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
            {/* Top Score & Warning Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-xl font-extrabold text-xs ${
                    analysisResult.riskRating === 'High'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : analysisResult.riskRating === 'Medium'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  Risk Rating: {analysisResult.riskRating.toUpperCase()} ({analysisResult.riskScore}/100)
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Fraud Indicator Score
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Adversarial Verification Complete</span>
            </div>

            {/* Analysis Summary */}
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {analysisResult.analysisSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Red Flags Card */}
              <div className="p-4 bg-rose-50/80 dark:bg-rose-950/40 rounded-xl border border-rose-300/40 space-y-2">
                <h4 className="text-xs font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Detected Red Flags:
                </h4>
                <ul className="text-xs text-rose-950 dark:text-rose-200 space-y-1.5 pl-4 list-disc">
                  {analysisResult.redFlagsDetected.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>

              {/* Speed-to-Apply Tactics Card */}
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-300/40 space-y-2">
                <h4 className="text-xs font-extrabold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Velocity-Apply Speed Tactics (4x Faster):
                </h4>
                <ul className="text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5 pl-4 list-disc">
                  {analysisResult.speedToApplyTactics.map((tactic, idx) => (
                    <li key={idx}>{tactic}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mini Heatmap Visualization */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              Global Reported Job Scam Frequency Heatmap (Community Data)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Relative frequency of reported fraudulent postings by geographic applicant region.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/80 px-3 py-1 rounded-full">
            Real-Time Community Feed
          </span>
        </div>

        {/* Heatmap Bar Chart */}
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SCAM_REGIONS} layout="vertical">
              <XAxis type="number" stroke="#888888" fontSize={11} />
              <YAxis dataKey="region" type="category" stroke="#888888" fontSize={10} width={150} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#F43F5E',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="reportCount" radius={[0, 8, 8, 0]}>
                {SCAM_REGIONS.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.riskLevel === 'High'
                        ? '#E11D48'
                        : entry.riskLevel === 'Medium'
                        ? '#F59E0B'
                        : '#10B981'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Region Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {SCAM_REGIONS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {item.region}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.riskLevel === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : item.riskLevel === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.riskLevel} Risk
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                <strong>Safety Tip:</strong> {item.safetyTip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Red Flags & Hiring Faster Bullet Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Red Flags Checklist */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-200 dark:border-rose-950 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Top 5 Remote Job Scam Red Flags
          </h3>

          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2 p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/40">
              <span className="font-bold text-rose-600">1.</span>
              <span>
                <strong>Equipment Checks:</strong> They send a physical check or transfer money asking you to buy home office gear from a "certified vendor". The check will bounce.
              </span>
            </li>
            <li className="flex items-start gap-2 p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/40">
              <span className="font-bold text-rose-600">2.</span>
              <span>
                <strong>Telegram / WhatsApp Only Interviews:</strong> Interviews conducted entirely over text message without webcam or official domain email addresses.
              </span>
            </li>
            <li className="flex items-start gap-2 p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/40">
              <span className="font-bold text-rose-600">3.</span>
              <span>
                <strong>Upfront Processing Fees:</strong> Asking for application fees, visa processing fees, or security deposits. Real companies pay you.
              </span>
            </li>
            <li className="flex items-start gap-2 p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/40">
              <span className="font-bold text-rose-600">4.</span>
              <span>
                <strong>Unrealistic Pay for Low Skill:</strong> Offering $80/hr for simple data entry or copy-pasting without technical evaluation.
              </span>
            </li>
          </ul>
        </div>

        {/* How to Get Hired Faster */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-950 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            How to Get Hired 3x Faster
          </h3>

          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/40">
              <span className="font-bold text-emerald-600">1.</span>
              <span>
                <strong>Apply Within 48 Hours:</strong> Set daily alerts or check the aggregator daily. Early applicants get read first.
              </span>
            </li>
            <li className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/40">
              <span className="font-bold text-emerald-600">2.</span>
              <span>
                <strong>Quantify Achievements:</strong> Use metrics like "Increased conversion by 25%" or "Managed 4 timezones asynchronously".
              </span>
            </li>
            <li className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/40">
              <span className="font-bold text-emerald-600">3.</span>
              <span>
                <strong>Showcase Asynchronous Tools:</strong> Mention Slack, Notion, Loom, Jira, and GitHub directly in your summary.
              </span>
            </li>
            <li className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/40">
              <span className="font-bold text-emerald-600">4.</span>
              <span>
                <strong>Tailor via AI Resume Optimizer:</strong> Match job description keywords for ATS screening.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
