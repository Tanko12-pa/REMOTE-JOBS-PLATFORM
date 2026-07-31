export type PlatformCategory =
  | 'global_boards'
  | 'national_canada'
  | 'national_nigeria'
  | 'national_ghana'
  | 'national_kenya'
  | 'national_uk'
  | 'national_usa'
  | 'freelance'
  | 'tech_startup'
  | 'creative'
  | 'high_paying'
  | 'aggregator'
  | 'job_alerts'
  | 'saved';

export interface Platform {
  id: string;
  name: string;
  bestFor: string;
  costToJobSeeker: 'Free' | 'Paid' | 'Mixed';
  regionFocus: string;
  website: string;
  category: PlatformCategory;
  shortDescription: string;
  verifiedStatus: 'Verified 2026' | 'Community Vetted';
  tags: string[];
  rating?: number;
}

export interface MainPanelButton {
  id: string;
  label: string;
  category: PlatformCategory | 'ai_resume' | 'ai_letter' | 'ai_interview' | 'scam_tips' | 'ai_career_mentor' | 'categories_roadmap' | 'salary_trends' | 'application_tracker' | 'job_alerts' | 'subscription_billing';
  description: string;
  iconName: string;
  badge?: string;
  count?: number;
}

export interface CareerLevel {
  title: string;
  level: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  avgPay: string;
  description: string;
}

export interface JobCategory {
  id: string;
  name: string;
  description: string;
  avgSalaryRange: string;
  topSkills: string[];
  recommendedPlatforms: string[];
  careerLevels: CareerLevel[];
}

export interface ApplicationLog {
  id: string;
  company: string;
  role: string;
  dateApplied: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected' | 'Saved';
  platformUsed: string;
  salaryOffered?: string;
  notes?: string;
  jobDescription?: string;
  suitabilityScore?: number;
  suitabilityReason?: string;
  voiceNoteUrl?: string;
  voiceNoteDuration?: string;
}

export interface ResumeContent {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  skills: string[];
  experience: { title: string; company: string; period: string; points: string[] }[];
  education: { degree: string; school: string; year: string }[];
  certifications?: string[];
}

export interface ImpactScore {
  overall: number;
  keywordMatchScore: number;
  actionVerbScore: number;
  formattingScore: number;
  suggestions: string[];
}

export interface ResumeVersion {
  id: string;
  title: string;
  targetRole: string;
  updatedAt: string;
  content: ResumeContent;
  impactScore: ImpactScore;
}

export interface CoverLetterData {
  id: string;
  title: string;
  companyName: string;
  jobRole: string;
  date: string;
  letterText: string;
}

export interface InterviewSchedule {
  id: string;
  company: string;
  role: string;
  date: string;
  time: string;
  timezone: string;
  type?: 'Real Interview' | 'Practice Session';
  meetingLink?: string;
  notes?: string;
  checklist: { id: string; text: string; done: boolean }[];
}

export interface InterviewFlashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ToneAnalysisResult {
  overallScore: number;
  professionalism: number;
  confidence: number;
  clarity: number;
  feedback: string;
  suggestedRefinement: string;
}

export interface UserSubscription {
  status: 'free_trial' | 'active' | 'expired' | 'canceled';
  plan: 'Trial' | 'Monthly' | 'Yearly';
  trialStartDate: string;
  trialDaysRemaining: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  nextBillingDate?: string;
  priceAmount?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  preferredTitle: string;
  region: string;
  languages: string[];
  primarySkills: string[];
  experienceSummary?: string;
  linkedinProfileUrl?: string;
  linkedinSynced?: boolean;
  linkedinSyncedAt?: string;
  dailyGoal: number;
  targetSalary: string;
  oauthProvider?: 'Google' | 'GitHub' | 'LinkedIn' | null;
  isLoggedIn: boolean;
  passwordHash?: string;
  subscription?: UserSubscription;
  theme: 'light' | 'dark';
  uiLanguage: 'en' | 'fr' | 'es' | 'ha' | 'ig' | 'yo' | 'sw' | 'pcm';
  notificationsEnabled: boolean;
  xpPoints: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface ScamReportRegion {
  region: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  reportCount: number;
  commonScamTypes: string[];
  safetyTip: string;
}

export interface SalaryTrendPoint {
  year: string;
  Junior: number;
  MidLevel: number;
  Senior: number;
  Lead: number;
}

export type LanguageCode = 'en' | 'fr' | 'es' | 'sw';

export interface PushNotificationPreference {
  enabled: boolean;
  frequency: 'Instant' | 'Daily Summary' | 'Weekly Summary';
  targetKeywords: string[];
  dailyDigestEnabled?: boolean;
  digestEmail?: string;
  digestTime?: string;
}

export interface A2AJudgeAudit {
  timestamp: string;
  platformsChecked: number;
  verifiedCount: number;
  issuesFound: string[];
  factCheckStatus: 'PASSED' | 'WARNINGS';
  lastNewsUpdate: string;
  complianceScore: number;
}
