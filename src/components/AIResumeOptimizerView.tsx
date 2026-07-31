import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Printer,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Save,
  Layers,
  ArrowRight,
  RefreshCw,
  Code,
  Copy,
  Check,
  X,
  Eye,
  Download,
} from 'lucide-react';
import { ResumeVersion, ResumeContent } from '../types';
import { exportResumeToPDF } from '../utils/pdfExport';

interface AIResumeOptimizerViewProps {
  resumeVersions: ResumeVersion[];
  setResumeVersions: React.Dispatch<React.SetStateAction<ResumeVersion[]>>;
}

export const AIResumeOptimizerView: React.FC<AIResumeOptimizerViewProps> = ({
  resumeVersions,
  setResumeVersions,
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    resumeVersions[0]?.id || 'default-v1'
  );
  const [targetJobDesc, setTargetJobDesc] = useState<string>('');
  const [userExpInput, setUserExpInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [newVersionTitle, setNewVersionTitle] = useState<string>('');
  const [showPrintCSSModal, setShowPrintCSSModal] = useState<boolean>(false);
  const [copiedCSS, setCopiedCSS] = useState<boolean>(false);

  // Draft Auto-Save Mechanism (Saves to local storage every 30 seconds)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [draftToast, setDraftToast] = useState<string | null>(null);

  const currentResume =
    resumeVersions.find((v) => v.id === selectedVersionId) || resumeVersions[0];

  const [formData, setFormData] = useState<ResumeContent>(
    currentResume?.content || {
      fullName: 'Alex Morgan',
      email: 'alex.morgan@email.com',
      phone: '+1 (555) 019-2834',
      location: 'Worldwide Remote',
      summary: '',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: [],
      education: [],
    }
  );

  // Auto-load draft from local storage on mount
  React.useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('remotejobs_resume_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.formData) {
          setFormData(parsed.formData);
          if (parsed.targetJobDesc) setTargetJobDesc(parsed.targetJobDesc);
          if (parsed.userExpInput) setUserExpInput(parsed.userExpInput);
          if (parsed.savedAt) setLastSavedTime(parsed.savedAt);
        }
      }
    } catch (e) {
      console.warn('Failed to load resume draft', e);
    }
  }, []);

  // 30-second Auto-Save Draft Interval
  React.useEffect(() => {
    const saveDraft = () => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const draftPayload = {
        formData,
        targetJobDesc,
        userExpInput,
        selectedVersionId,
        savedAt: timeStr,
      };
      try {
        localStorage.setItem('remotejobs_resume_draft', JSON.stringify(draftPayload));
        setLastSavedTime(timeStr);
      } catch (err) {
        console.error('Draft auto-save failed', err);
      }
    };

    const interval = setInterval(saveDraft, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [formData, targetJobDesc, userExpInput, selectedVersionId]);

  // Manual Draft Save Trigger
  const handleManualSaveDraft = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const draftPayload = {
      formData,
      targetJobDesc,
      userExpInput,
      selectedVersionId,
      savedAt: timeStr,
    };
    try {
      localStorage.setItem('remotejobs_resume_draft', JSON.stringify(draftPayload));
      setLastSavedTime(timeStr);
      setDraftToast(`Draft progress saved to browser storage at ${timeStr}`);
      setTimeout(() => setDraftToast(null), 3000);
    } catch (e) {
      alert('Failed to save draft to local storage.');
    }
  };

  const [remoteKeywords, setRemoteKeywords] = useState<string[]>([
    'asynchronous communication',
    'cross-functional alignment',
    'self-starter',
    'timezone management',
    'written documentation hygiene',
  ]);

  const [tailoredBullets, setTailoredBullets] = useState<
    { currentPhrase: string; optimizedPhrase: string }[]
  >([
    {
      currentPhrase: 'Handled customer tickets and bugs.',
      optimizedPhrase:
        'Accomplished 98.5% customer satisfaction rating, as measured by Zendesk CSAT reports, by resolving 45+ daily technical tickets independently.',
    },
    {
      currentPhrase: 'Worked with remote teams on software projects.',
      optimizedPhrase:
        'Accomplished 100% on-time release rate across 3 global regions, as measured by GitHub deployment logs, by establishing async Loom video walkthroughs.',
    },
  ]);

  // Switch Version
  const handleVersionChange = (id: string) => {
    setSelectedVersionId(id);
    const found = resumeVersions.find((v) => v.id === id);
    if (found) {
      setFormData(found.content);
    }
  };

  // Add New Empty Resume Version
  const handleCreateNewVersion = () => {
    const title = newVersionTitle.trim() || `Resume Version ${resumeVersions.length + 1}`;
    const newVersion: ResumeVersion = {
      id: `ver-${Date.now()}`,
      title,
      targetRole: 'Remote Role',
      updatedAt: new Date().toISOString().split('T')[0],
      content: { ...formData },
      impactScore: {
        overall: 80,
        keywordMatchScore: 80,
        actionVerbScore: 80,
        formattingScore: 80,
        suggestions: ['Optimize for target job description using AI.'],
      },
    };

    setResumeVersions((prev) => [newVersion, ...prev]);
    setSelectedVersionId(newVersion.id);
    setNewVersionTitle('');
  };

  // Delete Version
  const handleDeleteVersion = (id: string) => {
    if (resumeVersions.length <= 1) return;
    setResumeVersions((prev) => prev.filter((v) => v.id !== id));
    const remaining = resumeVersions.filter((v) => v.id !== id);
    setSelectedVersionId(remaining[0].id);
  };

  // Call Gemini API Backend Endpoint
  const handleOptimizeWithAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/resume-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userExperience: userExpInput || JSON.stringify(formData),
          targetJobDescription: targetJobDesc,
          currentResume: formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedContent: ResumeContent = {
          fullName: data.fullName || formData.fullName,
          email: data.email || formData.email,
          phone: data.phone || formData.phone,
          location: data.location || formData.location,
          summary: data.summary || formData.summary,
          skills: data.skills || formData.skills,
          experience: data.experience || formData.experience,
          education: data.education || formData.education,
        };

        setFormData(updatedContent);

        if (data.remoteKeywords) {
          setRemoteKeywords(data.remoteKeywords);
        }
        if (data.tailoredBullets) {
          setTailoredBullets(data.tailoredBullets);
        }
        setResumeVersions((prev) =>
          prev.map((v) =>
            v.id === selectedVersionId
              ? {
                  ...v,
                  content: updatedContent,
                  updatedAt: new Date().toISOString().split('T')[0],
                  impactScore: data.impactScore || v.impactScore,
                }
              : v
          )
        );
      }
    } catch (err) {
      console.error('Failed to optimize resume', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPDF = () => {
    exportResumeToPDF(formData, currentResume?.title || 'Resume');
  };

  const generatedPrintCSS = `/* Generated ATS Print-Friendly Stylesheet for: ${currentResume?.title || 'Resume'} */
@media print {
  @page {
    size: letter portrait;
    margin: 0.5in;
  }
  body {
    background: #ffffff !important;
    color: #111827 !important;
    font-family: "Georgia", "Times New Roman", serif !important;
    font-size: 10.5pt !important;
    line-height: 1.4 !important;
  }
  nav, header, button, .no-print, input, select, textarea {
    display: none !important;
  }
  .ats-print-paper {
    display: block !important;
    max-width: 100% !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  h1 { font-size: 18pt !important; font-weight: bold !important; text-transform: uppercase !important; border-bottom: 2px solid #111 !important; }
  h2 { font-size: 12pt !important; font-weight: bold !important; border-bottom: 1px solid #666 !important; margin-top: 10pt !important; }
  p, li { font-size: 10pt !important; color: #1f2937 !important; }
  ul { padding-left: 14pt !important; margin-top: 2pt !important; margin-bottom: 6pt !important; }
}`;

  const handleCopyPrintCSS = () => {
    navigator.clipboard.writeText(generatedPrintCSS);
    setCopiedCSS(true);
    setTimeout(() => setCopiedCSS(false), 2500);
  };

  const handleApplyPrintCSSAndPrint = () => {
    const styleId = 'ats-generated-print-style';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = generatedPrintCSS;
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#064E3B] dark:bg-emerald-950 text-white rounded-2xl p-6 border border-[#064E3B] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold mb-2 border border-[#FBBF24]/40">
              <Sparkles className="w-3.5 h-3.5" />
              AI Resume Impact Engine
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI Resume Optimizer & Multiple Version Saver
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              Optimize your experience with quantifiable bullet points, calculate your ATS strength score, save tailored versions, and export directly to clean PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleManualSaveDraft}
              id="manual-save-resume-draft-btn"
              className="px-3.5 py-2.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-emerald-700 shadow-xs transition-all hover:scale-105 shrink-0"
              title="Save current resume progress to local storage"
            >
              <Save className="w-4 h-4 text-amber-300 animate-pulse" />
              {lastSavedTime ? `Draft Saved (${lastSavedTime})` : 'Save Draft Now'}
            </button>

            <button
              onClick={() => setShowPrintCSSModal(true)}
              id="generate-print-css-btn"
              className="px-4 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-amber-400/40 shadow-xs transition-all hover:scale-105 shrink-0"
            >
              <Code className="w-4 h-4 text-amber-300" />
              Print-Friendly CSS Generator
            </button>

            <button
              onClick={handlePrintPDF}
              id="print-resume-pdf-btn"
              className="px-5 py-2.5 rounded-xl bg-[#FBBF24] hover:bg-[#facc15] text-[#064E3B] font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 shrink-0"
            >
              <Printer className="w-4 h-4" />
              Print / Export to PDF
            </button>
          </div>
        </div>
      </div>

      {draftToast && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{draftToast}</span>
        </div>
      )}

      {/* Version Management Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Layers className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Select Saved Resume Version:
          </span>
          <select
            value={selectedVersionId}
            onChange={(e) => handleVersionChange(e.target.value)}
            id="resume-version-selector"
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold text-emerald-950 dark:text-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {resumeVersions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} ({v.updatedAt}) - Score: {v.impactScore?.overall}%
              </option>
            ))}
          </select>
        </div>

        {/* Create New Version Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newVersionTitle}
            onChange={(e) => setNewVersionTitle(e.target.value)}
            placeholder="New Version Name (e.g., Shopify Frontend)"
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none"
          />
          <button
            onClick={handleCreateNewVersion}
            id="create-new-resume-version-btn"
            className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Save As New
          </button>
          {resumeVersions.length > 1 && (
            <button
              onClick={() => handleDeleteVersion(selectedVersionId)}
              className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-200"
              title="Delete current version"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Impact Score Visualization */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-500" />
            AI Resume Impact Score
          </h3>
          <span className="text-xs font-extrabold text-emerald-800 dark:text-amber-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            Overall Impact: {currentResume?.impactScore?.overall || 88}%
          </span>
        </div>

        {/* Breakdown Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-400">Keyword Match</span>
              <span className="text-emerald-700 dark:text-amber-400 font-bold">
                {currentResume?.impactScore?.keywordMatchScore || 90}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentResume?.impactScore?.keywordMatchScore || 90}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-400">Action Verbs</span>
              <span className="text-emerald-700 dark:text-amber-400 font-bold">
                {currentResume?.impactScore?.actionVerbScore || 85}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentResume?.impactScore?.actionVerbScore || 85}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-400">ATS Formatting</span>
              <span className="text-emerald-700 dark:text-amber-400 font-bold">
                {currentResume?.impactScore?.formattingScore || 90}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentResume?.impactScore?.formattingScore || 90}%` }}
              />
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-300/40 mb-4">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Specific Actionable Suggestions for Improvement:
          </h4>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 pl-5 list-disc">
            {currentResume?.impactScore?.suggestions?.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Remote Keywords Identifier */}
        <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-300/40 mb-4">
          <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Missing High-Yield Remote Keywords Extracted:
          </h4>
          <div className="flex flex-wrap gap-2">
            {remoteKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-800 text-amber-300 rounded-lg border border-amber-400/30 shadow-xs"
              >
                + {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Tailoring Engine Table (X-Y-Z Formula) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Tailoring Engine: X-Y-Z Bullet Point Formula (Accomplished [X], as measured by [Y], by doing [Z])
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
              ATS Markdown Table Format
            </span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700 bg-slate-200/70 dark:bg-slate-700/50">
                  <th className="p-2.5 font-bold text-slate-700 dark:text-slate-200 w-1/3">
                    Current / Weak Phrase
                  </th>
                  <th className="p-2.5 font-bold text-emerald-900 dark:text-emerald-300 w-2/3">
                    Optimized Remote-Standard Phrase (X-Y-Z Formula)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {tailoredBullets.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800 transition-all">
                    <td className="p-2.5 text-rose-700 dark:text-rose-400 font-medium align-top">
                      "{row.currentPhrase}"
                    </td>
                    <td className="p-2.5 text-emerald-900 dark:text-emerald-200 font-semibold align-top bg-emerald-50/50 dark:bg-emerald-950/20">
                      {row.optimizedPhrase}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Tailoring Inputs & Live Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: AI Optimization Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Tailor for Target Job Description
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Job Description or Keywords
            </label>
            <textarea
              rows={4}
              value={targetJobDesc}
              onChange={(e) => setTargetJobDesc(e.target.value)}
              placeholder="Paste the target job description (e.g. Senior Frontend React Developer at Shopify, requiring TypeScript, Redux, REST API, Async Loom)..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Additional Unstructured Experience / Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={userExpInput}
              onChange={(e) => setUserExpInput(e.target.value)}
              placeholder="E.g. Built microservices for 2 years, managed 5 VAs, handled customer Zendesk tickets..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            onClick={handleOptimizeWithAI}
            disabled={isGenerating}
            id="run-ai-resume-optimizer-btn"
            className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                Optimizing with Gemini AI Engine...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                Generate Optimized Resume & Impact Score
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Form Preview & Editor */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Resume Content Details
            </h3>
            <button
              onClick={handlePrintPDF}
              id="download-resume-pdf-card-btn"
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
            >
              <Download className="w-3.5 h-3.5 text-emerald-950" />
              Export PDF
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Email
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              Professional Summary
            </label>
            <textarea
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              Core Skills (comma separated)
            </label>
            <input
              type="text"
              value={formData.skills.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  skills: e.target.value.split(',').map((s) => s.trim()),
                })
              }
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Experience Points ({formData.experience?.length || 0})
            </h4>
            {formData.experience?.map((exp, idx) => (
              <div
                key={idx}
                className="p-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <div className="font-bold text-emerald-900 dark:text-emerald-300">
                  {exp.title} - {exp.company} ({exp.period})
                </div>
                <ul className="list-disc pl-4 mt-1 text-slate-600 dark:text-slate-300 space-y-1">
                  {exp.points?.map((pt, pIdx) => (
                    <li key={pIdx}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating 'Download PDF' Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => exportResumeToPDF(formData, currentResume?.title || 'Resume')}
          id="floating-download-pdf-btn"
          className="px-5 py-3.5 rounded-full bg-[#064E3B] hover:bg-emerald-900 text-amber-300 font-extrabold text-xs flex items-center gap-2.5 shadow-2xl border-2 border-amber-400 hover:scale-105 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-amber-400" />
          Download PDF Resume (jsPDF Export)
        </button>
      </div>

      {/* Print-Friendly CSS Stylesheet Modal */}
      {showPrintCSSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-900 text-amber-300">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100">
                    Generated Print-Friendly CSS Stylesheet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target Version: <strong className="text-amber-600">{currentResume?.title}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintCSSModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This custom CSS injects strict ATS print rules (A4/Letter page setup, Georgia serif typography, 0.5-inch margins, high-contrast dark text, hidden navigation, and zero color noise).
            </p>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-300 text-xs font-mono overflow-x-auto max-h-60 border border-slate-800 leading-relaxed">
                {generatedPrintCSS}
              </pre>
              <button
                onClick={handleCopyPrintCSS}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                {copiedCSS ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied CSS!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy CSS Code
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPrintCSSModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={handleApplyPrintCSSAndPrint}
                className="px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                Apply CSS & Trigger Browser Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
