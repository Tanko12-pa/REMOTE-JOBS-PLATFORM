import { UserProfile, ResumeVersion, ApplicationLog, InterviewSchedule } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'rjp_user_profile',
  RESUMES: 'rjp_resume_versions',
  APPLICATIONS: 'rjp_application_logs',
  INTERVIEWS: 'rjp_interview_schedules',
  SAVED_PLATFORMS: 'rjp_saved_platforms',
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Alex Morgan',
  email: 'alex.morgan@remotejobs.org',
  preferredTitle: 'Senior Remote Software Developer',
  region: 'Worldwide',
  languages: ['English', 'French'],
  primarySkills: ['React', 'TypeScript', 'Node.js', 'Remote Communication', 'AI Prompting'],
  dailyGoal: 5,
  targetSalary: '$85,000 / yr',
  oauthProvider: null,
  isLoggedIn: false,
  subscription: {
    status: 'free_trial',
    plan: 'Trial',
    trialStartDate: new Date().toISOString(),
    trialDaysRemaining: 7,
    priceAmount: 'Free 7-Day Trial',
  },
  theme: 'light',
  uiLanguage: 'en',
  notificationsEnabled: true,
  xpPoints: 350,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export function loadUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed.subscription) {
        parsed.subscription = DEFAULT_USER_PROFILE.subscription;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load profile from localStorage', e);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save profile', e);
  }
}

export function loadResumeVersions(): ResumeVersion[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESUMES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to load resumes', e);
  }
  return [
    {
      id: 'default-v1',
      title: 'Global Full-Stack Resume',
      targetRole: 'Software Developer',
      updatedAt: '2026-07-28',
      content: {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@email.com',
        phone: '+1 (555) 019-2834',
        location: 'Worldwide Remote (UTC-5)',
        summary: 'Accomplished Full-Stack Developer with 5+ years of experience building scalable web applications for distributed teams. Proven expertise in React, TypeScript, and AI integrations.',
        skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'Git', 'AI/LLM API'],
        experience: [
          {
            title: 'Senior Remote Engineer',
            company: 'Remote Tech Solutions',
            period: '2023 - Present',
            points: [
              'Architected high-throughput REST APIs handling 20,000+ daily active user requests.',
              'Collaborated asynchronously across 6 global timezones using Notion and Slack.',
              'Optimized bundle size by 40% using Vite and code-splitting techniques.'
            ]
          }
        ],
        education: [
          { degree: 'B.S. Computer Science', school: 'Tech University', year: '2021' }
        ]
      },
      impactScore: {
        overall: 89,
        keywordMatchScore: 92,
        actionVerbScore: 86,
        formattingScore: 90,
        suggestions: ['Quantify leadership achievements with $ revenue metrics.', 'Add Docker & CI/CD deployment experience.']
      }
    }
  ];
}

export function saveResumeVersions(resumes: ResumeVersion[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumes));
  } catch (e) {
    console.warn('Failed to save resumes', e);
  }
}

export function loadApplicationLogs(): ApplicationLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to load apps', e);
  }
  return [
    {
      id: 'app-1',
      company: 'Shopify Remote',
      role: 'Full Stack Engineer',
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'Applied',
      platformUsed: 'We Work Remotely',
      salaryOffered: '$95,000',
      notes: 'Applied with ATS optimized version 1.'
    },
    {
      id: 'app-2',
      company: 'GitLab',
      role: 'Frontend Developer',
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'Interviewing',
      platformUsed: 'Remote OK',
      salaryOffered: '$110,000',
      notes: 'Technical screen scheduled for Thursday.'
    }
  ];
}

export function saveApplicationLogs(logs: ApplicationLog[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(logs));
  } catch (e) {
    console.warn('Failed to save application logs', e);
  }
}

export function loadSavedPlatformIds(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_PLATFORMS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to load saved platforms', e);
  }
  return ['wwr', 'remoteok', 'himalayas'];
}

export function saveSavedPlatformIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_PLATFORMS, JSON.stringify(ids));
  } catch (e) {
    console.warn('Failed to save platform ids', e);
  }
}

export function exportFullBackupJSON() {
  const backupData = {
    profile: loadUserProfile(),
    resumes: loadResumeVersions(),
    applications: loadApplicationLogs(),
    savedPlatforms: loadSavedPlatformIds(),
    exportDate: new Date().toISOString(),
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `REMOTE_JOBS_PLATFORM_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportApplicationsCSV(logsParam?: ApplicationLog[]) {
  const logs = logsParam && logsParam.length > 0 ? logsParam : loadApplicationLogs();
  let csvContent = 'Company,Role,Date Applied,Status,Platform,Salary Offered,Notes\n';

  logs.forEach((log) => {
    csvContent += `"${log.company.replace(/"/g, '""')}","${log.role.replace(/"/g, '""')}","${log.dateApplied}","${log.status}","${log.platformUsed.replace(/"/g, '""')}","${(log.salaryOffered || '').replace(/"/g, '""')}","${(log.notes || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Job_Applications_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportApplicationsJSON(logsParam?: ApplicationLog[]) {
  const logs = logsParam && logsParam.length > 0 ? logsParam : loadApplicationLogs();
  const jsonStr = JSON.stringify(logs, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Job_Applications_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSavedJobsCSV(savedPlatformIds?: string[]) {
  const savedIds = savedPlatformIds || loadSavedPlatformIds();
  let csvContent = 'Saved Platform ID,Date Saved,Status\n';

  savedIds.forEach((id) => {
    csvContent += `"${id}","${new Date().toISOString().split('T')[0]}","Saved Bookmark"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Saved_Jobs_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAllCareerDataCSV(logs: ApplicationLog[], savedPlatformIds: string[]) {
  let csvContent = 'Record Type,Company / Platform,Role / Category,Date,Status,Platform Used,Salary Offered,Notes\n';

  logs.forEach((log) => {
    csvContent += `"APPLICATION","${log.company.replace(/"/g, '""')}","${log.role.replace(/"/g, '""')}","${log.dateApplied}","${log.status}","${log.platformUsed.replace(/"/g, '""')}","${(log.salaryOffered || '').replace(/"/g, '""')}","${(log.notes || '').replace(/"/g, '""')}"\n`;
  });

  savedPlatformIds.forEach((id) => {
    csvContent += `"SAVED_JOB","${id}","Remote Platform Bookmark","${new Date().toISOString().split('T')[0]}","Saved","${id}","","Bookmarked for job hunting"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Career_Logs_And_Saved_Jobs_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

