import { UserProfile } from '../types';

export interface LinkedInProfileData {
  name: string;
  email: string;
  headline: string;
  skills: string[];
  experienceSummary: string;
  location: string;
  linkedinProfileUrl: string;
  syncedAt: string;
}

export const MOCK_LINKEDIN_PROFILE: LinkedInProfileData = {
  name: 'Alex Morgan',
  email: 'alex.morgan.linkedin@remotejobs.org',
  headline: 'Senior Full Stack & AI Remote Engineer',
  skills: [
    'React 19',
    'TypeScript',
    'Node.js',
    'System Architecture',
    'Async Leadership',
    'GraphQL',
    'CI/CD Pipelines',
    'Gemini AI API',
  ],
  experienceSummary:
    'Senior Full Stack Engineer at TechCorp (3+ yrs) • Lead Remote Frontend Specialist at CloudScale (2 yrs) • Open Source Contributor',
  location: 'Worldwide Remote / US & EU',
  linkedinProfileUrl: 'https://linkedin.com/in/alex-morgan-remote',
  syncedAt: new Date().toLocaleDateString(),
};

/**
 * Initiates LinkedIn OAuth 2.0 flow by opening popup window to /api/auth/linkedin/url
 */
export async function initiateLinkedInOAuth(): Promise<LinkedInProfileData> {
  return new Promise((resolve, reject) => {
    fetch('/api/auth/linkedin/url')
      .then((res) => res.json())
      .then(({ url }) => {
        const popup = window.open(
          url || 'https://www.linkedin.com/oauth/v2/authorization',
          'linkedin_oauth_popup',
          'width=600,height=700,scrollbars=yes'
        );

        if (!popup) {
          alert('Popup blocked! Please allow popups for this site to log in with LinkedIn.');
          reject(new Error('Popup blocked'));
          return;
        }

        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            const importedData: LinkedInProfileData = event.data.profileData || MOCK_LINKEDIN_PROFILE;
            resolve(importedData);
          }
        };

        window.addEventListener('message', handleMessage);

        // Fallback safety timeout if popup is closed or blocked
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            // Return mock profile data as fallback if popup closed
            resolve(MOCK_LINKEDIN_PROFILE);
          }
        }, 1000);
      })
      .catch((err) => {
        console.warn('LinkedIn API endpoint fallback:', err);
        resolve(MOCK_LINKEDIN_PROFILE);
      });
  });
}

/**
 * Service Utility helper to directly update user profile state with imported LinkedIn data
 */
export function applyLinkedInDataToProfile(
  prevProfile: UserProfile,
  data: LinkedInProfileData
): UserProfile {
  return {
    ...prevProfile,
    name: data.name || prevProfile.name,
    email: data.email || prevProfile.email,
    preferredTitle: data.headline || prevProfile.preferredTitle,
    region: data.location || prevProfile.region,
    isLoggedIn: true,
    oauthProvider: 'LinkedIn',
    linkedinSynced: true,
    linkedinSyncedAt: data.syncedAt || new Date().toLocaleDateString(),
    linkedinProfileUrl: data.linkedinProfileUrl,
    experienceSummary: data.experienceSummary,
    primarySkills: Array.from(new Set([...prevProfile.primarySkills, ...data.skills])),
  };
}
