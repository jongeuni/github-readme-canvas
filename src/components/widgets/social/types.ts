export type SocialIcon = 'github' | 'linkedin' | 'twitter';

export interface SocialSettings {
  username: string;
  label: string;
  icon: SocialIcon;
}

export const SOCIAL_COLORS: Record<SocialIcon, string> = {
  github: '#18181b',
  linkedin: '#0a66c2',
  twitter: '#18181b',
};

export const SOCIAL_BASE_URL: Record<SocialIcon, string> = {
  github: 'https://github.com/',
  linkedin: 'https://linkedin.com/in/',
  twitter: 'https://x.com/',
};
