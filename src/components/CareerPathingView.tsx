import React, { useState } from 'react';
import {
  GitMerge,
  Sparkles,
  Award,
  TrendingUp,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Brain,
  ChevronRight,
  Layers,
  BarChart2,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { UserProfile } from '../types';

interface CareerPathingViewProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const CareerPathingView: React.FC<CareerPathingViewProps> = ({
  userProfile,
  setUserProfile,
}) => {
  const [targetTrack, setTargetTrack] = useState<string>(
    userProfile.preferredTitle || 'Senior Full Stack & AI Systems Architect'
  );
  const [yearsExp, setYearsExp] = useState<string>('3-5 years');
  const [skillsInput, setSkillsInput] = useState<string>(
    userProfile.primarySkills.join(', ') || 'React, TypeScript, Node.js, Tailwind CSS'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const [careerPathData, setCareerPathData] = useState<{
    targetTrack: string;
    marketDemandIndex: string;
    projectedSalaryUplift: string;
    skillGaps: { skill: string; urgency: string; demandReason: string }[];
    recommendedCertifications: {
      id: string;
      title: string;
      provider: string;
      estHours: string;
      cost: string;
      url: string;
      impact: string;
    }[];
    timelinePhases: {
      phaseNumber: number;
      title: string;
      timeframe: string;
      status: string;
      description: string;
      items: string[];
    }[];
  } | null>({
    targetTrack: 'Senior Full Stack & AI Systems Architect',
    marketDemandIndex: '94/100 (Extremely High Global Demand)',
    projectedSalaryUplift: '+38% ($125,000 → $175,000/yr)',
    skillGaps: [
      {
        skill: 'Agentic AI & Function Calling',
        urgency: 'Critical',
        demandReason: 'Top 10% remote tech jobs require LLM integration and function calling mastery.',
      },
      {
        skill: 'Distributed System Architecture',
        urgency: 'High',
        demandReason: 'Essential for high-scale global SaaS infrastructure and microservices.',
      },
      {
        skill: 'Async Engineering Leadership',
        urgency: 'Medium',
        demandReason: 'Key differentiator for Senior and Lead remote engineering positions.',
      },
    ],
    recommendedCertifications: [
      {
        id: 'cert-1',
        title: 'AWS Certified Solutions Architect – Associate',
        provider: 'Amazon Web Services',
        estHours: '40 hours',
        cost: '$150',
        url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
        impact: 'Validates scalable cloud infrastructure design skills.',
      },
      {
        id: 'cert-2',
        title: 'Google Cloud Professional Cloud Developer',
        provider: 'Google Cloud Platform',
        estHours: '35 hours',
        cost: '$200',
        url: 'https://cloud.google.com/learn/certification/cloud-developer',
        impact: 'Master cloud-native application deployment and serverless pipelines.',
      },
      {
        id: 'cert-3',
        title: 'Certified Scrum Product Owner (CSPO) / Agile Lead',
        provider: 'Scrum Alliance',
        estHours: '16 hours',
        cost: '$300',
        url: 'https://www.scrumalliance.org',
        impact: 'Unlocks engineering lead and product management career tracks.',
      },
    ],
    timelinePhases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Core Foundation & Mastered Skills',
        timeframe: 'Current Profile',
        status: 'Completed',
        description: 'Primary core competency baseline established.',
        items: ['React 19', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: High-Demand Skill Gap Acquisition',
        timeframe: 'Months 1 - 3',
        status: 'In Progress',
        description: 'Bridge critical skill gaps required for senior remote listings.',
        items: ['Agentic AI Tool Calling', 'GraphQL & Microservices', 'Async RFC Documentation'],
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: Industry Certifications & Portfolio Micro-Projects',
        timeframe: 'Months 3 - 6',
        status: 'Upcoming',
        description: 'Earn verified credentials and build multi-region cloud portfolio app.',
        items: ['AWS Solutions Architect Cert', 'Google Cloud Developer Cert', 'Open-Source Distributed App'],
      },
      {
        phaseNumber: 4,
        title: 'Phase 4: Senior/Lead Career Milestone',
        timeframe: 'Months 6 - 9',
        status: 'Target Milestone',
        description: 'Apply for senior remote positions with +38% salary uplift target.',
        items: ['Principal Remote Engineer ($160k+)', 'Lead Async Architect', 'Global Tech Advisor'],
      },
    ],
  });

  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState<number>(1);

  const handleRunCareerPathAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await fetch('/api/gemini/career-pathing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSkills: skillsArray,
          targetTrack,
          yearsExperience: yearsExp,
        }),
      });

      const data = await response.json();
      if (data.success && data.careerPath) {
        setCareerPathData(data.careerPath);
      }
    } catch (err) {
      console.error('Failed to run career path analysis', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#064E3B] dark:bg-emerald-950 text-white rounded-2xl p-6 border border-[#064E3B] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold mb-2 border border-[#FBBF24]/40">
              <GitMerge className="w-3.5 h-3.5 text-[#FBBF24]" />
              AI Market Demand & Skill Gap Analysis
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Interactive AI Career Pathing & Skill Gap Roadmap
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              Evaluates your current skills against live 2026 global market demand to highlight missing certifications, skill gaps, and a step-by-step visual career timeline.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 bg-black/20 rounded-xl border border-white/20 text-right">
              <span className="text-[10px] font-bold text-emerald-200 block uppercase tracking-wider">
                Target Salary Uplift
              </span>
              <span className="text-sm font-extrabold text-[#FBBF24]">
                {careerPathData?.projectedSalaryUplift || '+35% Growth'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Form & Parameters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
          <Brain className="w-4 h-4 text-amber-500" />
          Career Track & Skills Profile Input
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Career Track / Position
            </label>
            <input
              type="text"
              value={targetTrack}
              onChange={(e) => setTargetTrack(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer, AI Product Manager"
              id="career-target-track-input"
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Years of Relevant Experience
            </label>
            <select
              value={yearsExp}
              onChange={(e) => setYearsExp(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <option value="0-2 years">0-2 years (Entry/Junior)</option>
              <option value="3-5 years">3-5 years (Mid-Level)</option>
              <option value="5-8 years">5-8 years (Senior)</option>
              <option value="8+ years">8+ years (Lead / Architect)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Core Skills (Comma-Separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Node.js, Python..."
              id="career-skills-input"
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <button
          onClick={handleRunCareerPathAnalysis}
          disabled={isAnalyzing}
          id="run-career-path-analysis-btn"
          className="w-full py-3 bg-[#064E3B] hover:bg-emerald-900 text-amber-300 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              Analyzing Market Skill Demand & Missing Certifications...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              Run AI Market Demand Analysis & Generate Career Roadmap
            </>
          )}
        </button>
      </div>

      {careerPathData && (
        <>
          {/* Skill Gaps & Market Demand Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Market Demand Overview Card */}
            <div className="p-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl border border-emerald-500/30 text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  2026 Global Market Demand Index
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40">
                  Verified Data
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-300 block">Target Position</span>
                <h4 className="text-base font-extrabold text-white mt-0.5">
                  {careerPathData.targetTrack}
                </h4>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Demand Strength</span>
                <div className="text-sm font-extrabold text-emerald-300">
                  {careerPathData.marketDemandIndex}
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Projected Salary Growth</span>
                <div className="text-sm font-extrabold text-amber-300">
                  {careerPathData.projectedSalaryUplift}
                </div>
              </div>
            </div>

            {/* AI Identified Skill Gaps (2 Cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                AI-Identified Missing Skill Gaps in High Demand
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {careerPathData.skillGaps.map((gap, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {gap.skill}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          gap.urgency === 'Critical'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : gap.urgency === 'High'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                        }`}
                      >
                        {gap.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {gap.demandReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Visual Timeline Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                  Interactive Career Progression Timeline
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click on any phase node to inspect milestones and target achievements
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-800 dark:text-amber-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                4 Chronological Phases
              </span>
            </div>

            {/* Visual Steps Timeline Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {careerPathData.timelinePhases.map((phase, idx) => {
                const isSelected = selectedPhaseIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhaseIdx(idx)}
                    className={`p-4 rounded-2xl text-left border transition-all duration-200 relative space-y-2 ${
                      isSelected
                        ? 'bg-[#064E3B] text-white border-[#064E3B] ring-2 ring-amber-400 shadow-lg scale-102'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                          isSelected
                            ? 'bg-amber-400 text-emerald-950'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        0{phase.phaseNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/20 text-emerald-100'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {phase.timeframe}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold line-clamp-1">{phase.title}</h4>
                    <p
                      className={`text-[11px] line-clamp-2 ${
                        isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {phase.description}
                    </p>

                    <div className="pt-1 flex items-center gap-1 text-[10px] font-extrabold text-amber-500 dark:text-amber-400">
                      <span>View Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detailed Inspector Card for Selected Phase */}
            {careerPathData.timelinePhases[selectedPhaseIdx] && (
              <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-2">
                  <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                    {careerPathData.timelinePhases[selectedPhaseIdx].title} — Actionable Steps
                  </h4>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-300 font-mono">
                    {careerPathData.timelinePhases[selectedPhaseIdx].timeframe}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {careerPathData.timelinePhases[selectedPhaseIdx].description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                  {careerPathData.timelinePhases[selectedPhaseIdx].items.map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-2xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommended Missing Certifications Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Recommended Certifications & Micro-Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified industry credentials that directly fill identified skill gaps and boost resume ATS scoring
                </p>
              </div>

              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {careerPathData.recommendedCertifications.length} Credentials Listed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {careerPathData.recommendedCertifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        {cert.provider}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {cert.estHours}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                      {cert.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {cert.impact}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#064E3B] dark:text-emerald-300 font-mono">
                      Cost: {cert.cost}
                    </span>

                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#064E3B] hover:bg-emerald-900 text-amber-300 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      View Course
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
