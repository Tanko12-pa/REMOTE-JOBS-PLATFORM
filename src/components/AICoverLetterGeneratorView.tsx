import React, { useState } from 'react';
import { Mail, Sparkles, Printer, Copy, Check, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { exportCoverLetterToPDF } from '../utils/pdfExport';

interface AICoverLetterGeneratorViewProps {
  userProfile: UserProfile;
}

export const AICoverLetterGeneratorView: React.FC<AICoverLetterGeneratorViewProps> = ({
  userProfile,
}) => {
  const [companyName, setCompanyName] = useState<string>('Shopify Remote');
  const [jobRole, setJobRole] = useState<string>('Senior Software Developer');
  const [jobDesc, setJobDesc] = useState<string>(
    'Seeking an experienced remote developer comfortable with asynchronous workflows, React, TypeScript, and distributed team leadership.'
  );
  const [generatedLetter, setGeneratedLetter] = useState<string>(
    `Dear Hiring Manager at Shopify Remote,\n\nI am writing to express my enthusiastic interest in the Senior Software Developer role. With 5+ years of experience in distributed team environments and technical mastery in React, TypeScript, and AI tools, I am well-prepared to contribute immediately to Shopify Remote's mission.\n\nIn my recent positions, I have successfully architected cloud microservices and established clear asynchronous documentation standards across multiple timezones. Your team's emphasis on autonomy and asynchronous communication matches my working style perfectly.\n\nThank you for considering my application. I look forward to connecting to discuss how my skill set aligns with your engineering goals.\n\nSincerely,\n${userProfile.name}`
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/application-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          jobRole,
          targetJobDescription: jobDesc,
          userProfile,
        }),
      });

      const data = await response.json();
      if (data.success && data.letterText) {
        setGeneratedLetter(data.letterText);
      }
    } catch (err) {
      console.error('Failed to generate application letter', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPDF = () => {
    exportCoverLetterToPDF(companyName, jobRole, generatedLetter);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#064E3B] dark:bg-emerald-950 text-white rounded-2xl p-6 border border-[#064E3B] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold mb-2 border border-[#FBBF24]/40">
              <Mail className="w-3.5 h-3.5" />
              AI Application Letter Engine
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI Application & Cover Letter Generator
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              Craft persuasive, formal, 1-page application letters tailored for remote work culture, high asynchronous trust, and rapid recruiter conversion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              id="print-cover-letter-pdf-btn"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 border border-amber-400/30"
            >
              {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid Inputs & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Job & Company Details
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Job Role / Title
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Job Description / Key Requirements
            </label>
            <textarea
              rows={5}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            id="generate-cover-letter-btn"
            className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                Generating Cover Letter...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                Generate Tailored Application Letter
              </>
            )}
          </button>
        </div>

        {/* Generated Letter Display */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-emerald-900 dark:text-amber-300">
                Generated Letter Preview
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    generatedLetter.trim().split(/\s+/).filter(Boolean).length <= 400
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  Word Count: {generatedLetter.trim().split(/\s+/).filter(Boolean).length} / 400 words max
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Block Format
                </span>
              </div>
            </div>

            {/* Proof of Async Tags */}
            <div className="mb-3 flex flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 bg-emerald-800 text-amber-300 rounded-md">
                ✓ Timezone Autonomy Proof
              </span>
              <span className="px-2 py-0.5 bg-emerald-800 text-amber-300 rounded-md">
                ✓ Async Communication Competency
              </span>
              <span className="px-2 py-0.5 bg-emerald-800 text-amber-300 rounded-md">
                ✓ 3-Paragraph Block Layout
              </span>
            </div>

            <div className="whitespace-pre-wrap text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              {generatedLetter}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
