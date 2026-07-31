import React, { useState, useRef } from 'react';
import {
  Mic,
  Calendar,
  Layers,
  Sparkles,
  Volume2,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Play,
  Square as StopSquare,
  Flame,
  Award,
  RefreshCw,
  Clock,
  ShieldCheck,
  Send,
  ChevronLeft,
  ChevronRight,
  Video,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InterviewSchedule, InterviewFlashcard, ToneAnalysisResult, UserProfile } from '../types';

interface AIInterviewCoachViewProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const AIInterviewCoachView: React.FC<AIInterviewCoachViewProps> = ({
  userProfile,
  setUserProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'scheduler' | 'tone' | 'flashcards' | 'microtips' | 'practice'>('scheduler');

  // Micro-Tips Engine state
  const [microCompany, setMicroCompany] = useState<string>('GitLab');
  const [microRole, setMicroRole] = useState<string>('Senior Remote Software Engineer');
  const [microTips, setMicroTips] = useState<string[]>([
    'Emphasize written documentation hygiene — Remote leaders value candidates who write concise RFCs over calling meetings.',
    'Highlight experience handling cross-timezone blockers independently using STAR stories.',
    'Reference company public handbook principles and openness to asynchronous peer feedback.',
  ]);
  const [microChecklist, setMicroChecklist] = useState<{
    hours48Before: string[];
    hours2Before: string[];
    duringInterview: string[];
  }>({
    hours48Before: [
      'Research company public blog, handbook, and product release notes',
      'Draft 3 STAR stories highlighting async problem solving & remote self-drive',
      'Test webcam background, HD resolution, and primary ethernet connection',
    ],
    hours2Before: [
      'Test noise-canceling microphone input levels and headset audio',
      'Verify backup internet hotspot (4G/5G mobile tethering ready)',
      'Close all background Slack/Zoom tabs and set status to Do Not Disturb',
    ],
    duringInterview: [
      'Maintain direct eye contact with the camera lens when articulating answers',
      'Use structured answer framing: Situation, Task, Action, Result + Remote Metric',
      'Ask 2 strategic questions about team async workflows & documentation culture',
    ],
  });
  const [isGeneratingMicro, setIsGeneratingMicro] = useState<boolean>(false);

  const handleFetchMicroTips = async () => {
    setIsGeneratingMicro(true);
    try {
      const response = await fetch('/api/gemini/interview-prep-extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: microCompany, roleTitle: microRole }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.microTips) setMicroTips(data.microTips);
        if (data.checklist) setMicroChecklist(data.checklist);
      }
    } catch (err) {
      console.error('Failed to generate micro tips', err);
    } finally {
      setIsGeneratingMicro(false);
    }
  };

  // Interview Scheduler State
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([
    {
      id: 'int-1',
      company: 'GitLab Inc.',
      role: 'Senior Full Stack Engineer',
      date: '2026-08-04',
      time: '14:00',
      timezone: 'UTC / EST',
      type: 'Real Interview',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      checklist: [
        { id: 'c1', text: 'Research GitLab asynchronous company handbook & core values', done: true },
        { id: 'c2', text: 'Prepare STAR examples of cross-timezone conflict resolution', done: false },
        { id: 'c3', text: 'Test webcam & noise-canceling microphone setup', done: false },
        { id: 'c4', text: 'Review REST API and system design diagram on Miro', done: false },
      ],
    },
    {
      id: 'int-2',
      company: 'AI Practice Coach',
      role: 'System Design & Behavioral Mock',
      date: '2026-08-08',
      time: '16:30',
      timezone: 'UTC',
      type: 'Practice Session',
      checklist: [
        { id: 'c2-1', text: 'Practice STAR answer for handling async blockers', done: true },
        { id: 'c2-2', text: 'Review salary negotiation benchmarking arguments', done: false },
      ],
    },
  ]);

  const [newComp, setNewComp] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  const [newSessionType, setNewSessionType] = useState<'Real Interview' | 'Practice Session'>('Real Interview');

  // Calendar View State
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 7, 1)); // Aug 2026
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('2026-08-04');
  const [schedulerSubView, setSchedulerSubView] = useState<'calendar' | 'list'>('calendar');

  // Tone Analysis State
  const [toneQuestion, setToneQuestion] = useState<string>(
    'How do you manage cross-timezone priorities when your team is sleeping?'
  );
  const [toneUserAnswer, setToneUserAnswer] = useState<string>(
    'I organize my task list in Jira at the start of my day, check for unblocking updates in Slack, write concise Loom videos if needed, and make sure my pull requests have detailed documentation before logging off.'
  );
  const [isAnalyzingTone, setIsAnalyzingTone] = useState<boolean>(false);
  const [toneResult, setToneResult] = useState<ToneAnalysisResult | null>({
    overallScore: 88,
    professionalism: 90,
    confidence: 85,
    clarity: 88,
    feedback: 'Strong response emphasizing asynchronous tooling and documentation. Consider adding a specific metric (e.g., reduced blocker wait time by 30%).',
    suggestedRefinement: 'When working across sleeping team timezones, I rely on rigorous asynchronous hygiene. I start by checking Jira blocking tags, record brief 2-minute Loom video walk-throughs for complex PRs, and publish detailed hand-off notes before logging off, cutting cross-timezone dependency delays by 30%.',
  });

  // Flashcard State
  const [jobCategoryInput, setJobCategoryInput] = useState<string>('Software Developer');
  const [flashcards, setFlashcards] = useState<InterviewFlashcard[]>([
    {
      id: 'fc-1',
      question: 'What is asynchronous work culture and why is it essential for global remote roles?',
      answer: 'Asynchronous work means team members do not need to be online at the same time. It relies on written documentation, clear task hand-offs, and self-drive rather than real-time meeting ping-pongs.',
      topic: 'Remote Culture',
      difficulty: 'Easy',
    },
    {
      id: 'fc-2',
      question: 'How do you handle a situation where a critical API bug blocks your task, but the owner is offline?',
      answer: 'I inspect existing documentation, test local mocks, clearly log the reproduction steps in Jira, switch to an unblocked secondary sprint task, and send a structured notification.',
      topic: 'Problem Solving',
      difficulty: 'Medium',
    },
  ]);
  const [isGeneratingCards, setIsGeneratingCards] = useState<boolean>(false);
  const [currentCardIdx, setCurrentCardIdx] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // Audio Practice Mode State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Add Interview Schedule or Practice Session
  const handleAddInterview = () => {
    if (!newComp.trim() || !newRole.trim()) return;
    const targetDate = newDate || selectedCalendarDate || '2026-08-05';
    const newInt: InterviewSchedule = {
      id: `int-${Date.now()}`,
      company: newComp,
      role: newRole,
      date: targetDate,
      time: newTime || '15:00',
      timezone: 'UTC',
      type: newSessionType,
      checklist: [
        { id: `c-${Date.now()}-1`, text: `Research ${newComp} remote culture & expectations`, done: false },
        { id: `c-${Date.now()}-2`, text: `Prepare 3 STAR story accomplishments for ${newRole}`, done: false },
        { id: `c-${Date.now()}-3`, text: 'Test camera, microphone, and quiet environment', done: false },
      ],
    };

    setInterviews((prev) => [newInt, ...prev]);
    setSelectedCalendarDate(targetDate);
    setNewComp('');
    setNewRole('');

    // Reward XP
    triggerXpReward(50, `${newSessionType} Scheduled!`);
  };

  const toggleChecklistItem = (interviewId: string, itemId: string) => {
    setInterviews((prev) =>
      prev.map((i) =>
        i.id === interviewId
          ? {
              ...i,
              checklist: i.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)),
            }
          : i
      )
    );
  };

  // Tone Analysis
  const handleRunToneAnalysis = async () => {
    setIsAnalyzingTone(true);
    try {
      const response = await fetch('/api/gemini/interview-tone-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: toneQuestion,
          userAnswer: toneUserAnswer,
          targetRole: userProfile.preferredTitle,
        }),
      });

      const data = await response.json();
      if (data.success && data.toneAnalysis) {
        setToneResult(data.toneAnalysis);
        triggerXpReward(30, 'Tone Analysis Completed!');
      }
    } catch (err) {
      console.error('Tone Analysis Error', err);
    } finally {
      setIsAnalyzingTone(false);
    }
  };

  // Flashcards Generation
  const handleGenerateFlashcards = async () => {
    setIsGeneratingCards(true);
    try {
      const response = await fetch('/api/gemini/interview-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobCategory: jobCategoryInput,
        }),
      });

      const data = await response.json();
      if (data.success && data.flashcards) {
        setFlashcards(data.flashcards);
        setCurrentCardIdx(0);
        setShowAnswer(false);
        triggerXpReward(40, 'Flashcards Generated!');
      }
    } catch (err) {
      console.error('Flashcards Error', err);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // Voice Recording with MediaRecorder API
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        triggerXpReward(25, 'Voice Practice Recorded!');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access unavailable or denied in browser iframe.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // XP Celebration Trigger
  const triggerXpReward = (points: number, reason: string) => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#006400', '#F59E0B'],
    });

    setUserProfile((prev) => ({
      ...prev,
      xpPoints: prev.xpPoints + points,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#064E3B] dark:bg-emerald-950 text-white rounded-2xl p-6 border border-[#064E3B] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold mb-2 border border-[#FBBF24]/40">
              <Mic className="w-3.5 h-3.5" />
              AI Remote Interview Suite
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI Interview Coach & Scheduler
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              Log upcoming interviews, analyze answer tone & confidence, generate flashcards, record spoken answers, and earn XP rewards.
            </p>
          </div>

          {/* XP & Streak Rewards Widget */}
          <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="flex items-center gap-1.5 text-[#FBBF24] font-extrabold text-sm">
              <Flame className="w-5 h-5 fill-[#FBBF24] animate-bounce" />
              <span>{userProfile.streakDays || 4} Day Streak</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-1.5 text-[#FBBF24] font-extrabold text-sm">
              <Award className="w-5 h-5 text-[#FBBF24]" />
              <span>{userProfile.xpPoints || 350} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setActiveTab('scheduler')}
          id="tab-interview-scheduler"
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'scheduler'
              ? 'bg-amber-400 text-emerald-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Interview Scheduler & Checklist
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          id="tab-flashcards"
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'flashcards'
              ? 'bg-amber-400 text-emerald-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          1. Flashcard Generator
        </button>

        <button
          onClick={() => setActiveTab('tone')}
          id="tab-tone-analysis"
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'tone'
              ? 'bg-amber-400 text-emerald-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          2. Behavioral Tone Analysis
        </button>

        <button
          onClick={() => setActiveTab('microtips')}
          id="tab-microtips"
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'microtips'
              ? 'bg-amber-400 text-emerald-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          3. Company Micro-Tips
        </button>

        <button
          onClick={() => setActiveTab('scheduler')}
          id="tab-scheduler"
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'scheduler'
              ? 'bg-amber-400 text-emerald-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          4. 48h/2h Tech Checklist & Calendar
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          id="tab-voice-practice"
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'practice'
              ? 'bg-amber-400 text-emerald-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          Voice Recording Mode
        </button>
      </div>

      {/* Tab 1: Interview & Practice Calendar Scheduler */}
      {activeTab === 'scheduler' && (
        <div className="space-y-6">
          {/* Subview Toggle Banner & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSchedulerSubView('calendar')}
                id="view-calendar-grid-btn"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  schedulerSubView === 'calendar'
                    ? 'bg-[#064E3B] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#FBBF24]" />
                Calendar Grid View
              </button>

              <button
                onClick={() => setSchedulerSubView('list')}
                id="view-schedule-list-btn"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  schedulerSubView === 'list'
                    ? 'bg-[#064E3B] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200'
                }`}
              >
                <Layers className="w-4 h-4 text-[#FBBF24]" />
                Agenda & Prep Checklists
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#064E3B]" />
                Real Interviews ({interviews.filter((i) => i.type !== 'Practice Session').length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                Practice Sessions ({interviews.filter((i) => i.type === 'Practice Session').length})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar Grid View Column */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#064E3B] dark:text-emerald-100">
                    {currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    Interactive Calendar
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentMonthDate(
                        new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
                      )
                    }
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-slate-700 dark:text-slate-200"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentMonthDate(new Date(2026, 7, 1))}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    Today
                  </button>

                  <button
                    onClick={() =>
                      setCurrentMonthDate(
                        new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
                      )
                    }
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-slate-700 dark:text-slate-200"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Month Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {(() => {
                  const year = currentMonthDate.getFullYear();
                  const month = currentMonthDate.getMonth();
                  const firstDayIndex = new Date(year, month, 1).getDay();
                  const numDays = new Date(year, month + 1, 0).getDate();
                  const cells = [];

                  for (let i = 0; i < firstDayIndex; i++) {
                    cells.push(<div key={`pad-${i}`} className="h-20 bg-gray-50/50 dark:bg-slate-800/20 rounded-xl" />);
                  }

                  for (let d = 1; d <= numDays; d++) {
                    const monthStr = String(month + 1).padStart(2, '0');
                    const dayStr = String(d).padStart(2, '0');
                    const dateIso = `${year}-${monthStr}-${dayStr}`;
                    const isSelected = selectedCalendarDate === dateIso;
                    const dayEvents = interviews.filter((i) => i.date === dateIso);
                    const realCount = dayEvents.filter((i) => i.type !== 'Practice Session').length;
                    const practiceCount = dayEvents.filter((i) => i.type === 'Practice Session').length;

                    cells.push(
                      <button
                        key={dateIso}
                        onClick={() => {
                          setSelectedCalendarDate(dateIso);
                          setNewDate(dateIso);
                        }}
                        className={`h-20 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-[#FBBF24] ring-2 ring-[#FBBF24]/50 shadow-sm'
                            : dayEvents.length > 0
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-800/40 border-gray-100 dark:border-slate-800 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-xs font-bold ${
                              isSelected
                                ? 'text-[#064E3B] dark:text-[#FBBF24] font-extrabold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {d}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
                          )}
                        </div>

                        {/* Event Badges */}
                        <div className="space-y-1 w-full mt-1">
                          {realCount > 0 && (
                            <div className="px-1.5 py-0.5 rounded-md bg-[#064E3B] text-white text-[9px] font-extrabold truncate flex items-center gap-1">
                              <Video className="w-2.5 h-2.5 text-[#FBBF24] shrink-0" />
                              <span className="truncate">{realCount} Real Job Int.</span>
                            </div>
                          )}

                          {practiceCount > 0 && (
                            <div className="px-1.5 py-0.5 rounded-md bg-[#FBBF24] text-[#064E3B] text-[9px] font-extrabold truncate flex items-center gap-1">
                              <Target className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{practiceCount} Practice</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  }

                  return cells;
                })()}
              </div>

              {/* Selected Day Event Banner */}
              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#064E3B] dark:text-[#FBBF24]" />
                  <span>
                    Selected Date: <strong className="text-[#064E3B] dark:text-[#FBBF24]">{selectedCalendarDate}</strong>
                  </span>
                </div>

                <span className="text-[11px] font-bold text-slate-500">
                  {interviews.filter((i) => i.date === selectedCalendarDate).length} Scheduled Sessions
                </span>
              </div>
            </div>

            {/* Schedule Form & Selected Day Events List */}
            <div className="lg:col-span-5 space-y-4">
              {/* Form to schedule session */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-[#064E3B] dark:text-emerald-100 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#FBBF24]" />
                    Schedule Interview or Practice
                  </h3>

                  {/* Type Selector */}
                  <div className="flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-slate-800">
                    <button
                      onClick={() => setNewSessionType('Real Interview')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all ${
                        newSessionType === 'Real Interview'
                          ? 'bg-[#064E3B] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Real Job Int.
                    </button>
                    <button
                      onClick={() => setNewSessionType('Practice Session')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all ${
                        newSessionType === 'Practice Session'
                          ? 'bg-[#FBBF24] text-[#064E3B] shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      AI Practice
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {newSessionType === 'Real Interview' ? 'Company Name' : 'Practice Topic / Provider'}
                  </label>
                  <input
                    type="text"
                    value={newComp}
                    onChange={(e) => setNewComp(e.target.value)}
                    placeholder={
                      newSessionType === 'Real Interview'
                        ? 'E.g. Shopify, Toptal, GitLab'
                        : 'E.g. System Design Mock, STAR Practice'
                    }
                    className="w-full p-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Role / Position Focus
                  </label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="E.g. Full Stack Developer"
                    className="w-full p-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newDate || selectedCalendarDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full p-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddInterview}
                  id="log-interview-btn"
                  className="w-full py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#043e2f] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4 text-[#FBBF24]" />
                  Add to Calendar (+50 XP)
                </button>
              </div>

              {/* Sessions List for Selected Date or All */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                <h4 className="text-xs font-bold text-[#064E3B] dark:text-emerald-100 flex items-center justify-between">
                  <span>Agenda for {selectedCalendarDate}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Showing {interviews.filter((i) => i.date === selectedCalendarDate).length} sessions
                  </span>
                </h4>

                {interviews
                  .filter((i) => i.date === selectedCalendarDate)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold mb-1 ${
                              item.type === 'Practice Session'
                                ? 'bg-[#FBBF24] text-[#064E3B]'
                                : 'bg-[#064E3B] text-white'
                            }`}
                          >
                            {item.type || 'Real Interview'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {item.role} @ {item.company}
                          </h4>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {item.date} at {item.time} ({item.timezone})
                          </p>
                        </div>
                        {item.meetingLink && (
                          <a
                            href={item.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#064E3B] dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold shrink-0"
                          >
                            Join Meeting
                          </a>
                        )}
                      </div>

                      {/* Checklist */}
                      <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                        <h5 className="text-[10px] font-bold text-slate-500 mb-1">Prep Checklist:</h5>
                        <div className="space-y-1">
                          {item.checklist.map((chk) => (
                            <button
                              key={chk.id}
                              onClick={() => toggleChecklistItem(item.id, chk.id)}
                              className="w-full flex items-center gap-2 p-1.5 rounded-lg text-left text-[11px] bg-gray-50 dark:bg-slate-800/60 hover:bg-gray-100 transition-colors"
                            >
                              {chk.done ? (
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <span
                                className={`${
                                  chk.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {chk.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                {interviews.filter((i) => i.date === selectedCalendarDate).length === 0 && (
                  <div className="p-6 text-center bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                    <Calendar className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-semibold">No interviews or practice sessions scheduled on {selectedCalendarDate}.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to schedule a practice mock or real interview!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tone & Confidence Analysis */}
      {activeTab === 'tone' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Evaluate Practice Answer Tone
            </h3>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Interview Question
              </label>
              <input
                type="text"
                value={toneQuestion}
                onChange={(e) => setToneQuestion(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Practice Answer Text
              </label>
              <textarea
                rows={6}
                value={toneUserAnswer}
                onChange={(e) => setToneUserAnswer(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRunToneAnalysis}
              disabled={isAnalyzingTone}
              id="analyze-tone-btn"
              className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              {isAnalyzingTone ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  Analyzing Professional Tone...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Analyze Tone, Confidence & Clarity
                </>
              )}
            </button>
          </div>

          {/* Tone Feedback Output */}
          {toneResult && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  Tone Evaluation Report
                </h4>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 text-xs font-black">
                  Overall Score: {toneResult.overallScore}/100
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Professionalism</span>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-amber-400">
                    {toneResult.professionalism}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Confidence</span>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-amber-400">
                    {toneResult.confidence}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Clarity</span>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-amber-400">
                    {toneResult.clarity}%
                  </span>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Feedback</h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-300/30">
                  {toneResult.feedback}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Suggested Executive Refinement:
                </h5>
                <p className="text-xs text-emerald-950 dark:text-emerald-100 leading-relaxed bg-emerald-50 dark:bg-slate-800 p-3 rounded-xl border border-emerald-200 dark:border-slate-700">
                  "{toneResult.suggestedRefinement}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={jobCategoryInput}
              onChange={(e) => setJobCategoryInput(e.target.value)}
              placeholder="Enter category (e.g., Virtual Assistant, Software Dev)..."
              className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
            <button
              onClick={handleGenerateFlashcards}
              disabled={isGeneratingCards}
              id="generate-flashcards-btn"
              className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Cards
            </button>
          </div>

          {flashcards.length > 0 && (
            <div className="space-y-4 text-center">
              <div
                onClick={() => setShowAnswer(!showAnswer)}
                className="min-h-[200px] p-8 rounded-2xl bg-gradient-to-tr from-emerald-900 to-slate-900 text-white flex flex-col items-center justify-center cursor-pointer shadow-md border border-amber-400/40 transition-all hover:scale-102"
              >
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 bg-emerald-950 px-2.5 py-1 rounded-full border border-amber-400/30 mb-3">
                  Topic: {flashcards[currentCardIdx]?.topic} ({currentCardIdx + 1}/{flashcards.length})
                </span>
                <p className="text-base font-bold leading-relaxed">
                  {showAnswer ? flashcards[currentCardIdx]?.answer : flashcards[currentCardIdx]?.question}
                </p>
                <p className="text-[10px] text-amber-300/80 mt-4 font-semibold">
                  {showAnswer ? 'Click to show question' : 'Click to flip & reveal sample answer'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setCurrentCardIdx((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                    setShowAnswer(false);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Previous Card
                </button>
                <button
                  onClick={() => {
                    setCurrentCardIdx((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                    setShowAnswer(false);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-amber-400 text-emerald-950 rounded-xl"
                >
                  Next Card
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Company Micro-Tips & Tech Checklist Engine */}
      {activeTab === 'microtips' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              Company Micro-Tips & Culture Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Generate 3 hyper-targeted, company-specific tips based on public engineering culture and values.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Company
                </label>
                <input
                  type="text"
                  value={microCompany}
                  onChange={(e) => setMicroCompany(e.target.value)}
                  placeholder="e.g. GitLab, Shopify, Automattic, Zapier"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={microRole}
                  onChange={(e) => setMicroRole(e.target.value)}
                  placeholder="e.g. Senior Remote Software Engineer"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <button
              onClick={handleFetchMicroTips}
              disabled={isGeneratingMicro}
              className="w-full py-3 bg-[#064E3B] hover:bg-emerald-900 text-amber-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isGeneratingMicro ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  Generating Micro-Tips & Checklist...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Generate 3 Hyper-Targeted Micro-Tips & Tech Checklist
                </>
              )}
            </button>
          </div>

          {/* Micro Tips Output Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {microTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300/40 dark:border-emerald-800/40 space-y-2 shadow-xs"
              >
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-800 text-amber-300 font-bold text-[10px]">
                  Micro-Tip #{idx + 1}
                </span>
                <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-100 leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>

          {/* Chronological Prep Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Chronological Remote Interview Preparation Checklist
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 48 Hours Before */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 block border-b border-slate-200 dark:border-slate-700 pb-1">
                  ⏱️ 48 Hours Before Interview
                </span>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  {microChecklist.hours48Before.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2 Hours Before */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 block border-b border-slate-200 dark:border-slate-700 pb-1">
                  ⚡ 2 Hours Before (Remote Tech Check)
                </span>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  {microChecklist.hours2Before.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* During Interview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 block border-b border-slate-200 dark:border-slate-700 pb-1">
                  🎙️ During Interview
                </span>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  {microChecklist.duringInterview.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Voice Recording Practice Mode */}
      {activeTab === 'practice' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl mx-auto text-center space-y-6">
          <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
            MediaRecorder Spoken Audio Practice Mode
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Record your voice answers using your browser's microphone API and listen back to self-review clarity, pace, and vocal tone.
          </p>

          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                id="start-voice-recording-btn"
                className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
              >
                <Mic className="w-8 h-8" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                id="stop-voice-recording-btn"
                className="w-20 h-20 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg animate-pulse"
              >
                <StopSquare className="w-8 h-8 text-amber-400" />
              </button>
            )}
          </div>

          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isRecording ? '🔴 Recording in progress... speak clearly' : 'Click microphone to record answer'}
          </p>

          {audioUrl && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-amber-300 block">
                Recorded Answer Playback:
              </span>
              <audio src={audioUrl} controls className="w-full rounded-xl" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
