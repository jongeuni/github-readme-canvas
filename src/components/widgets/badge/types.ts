export type BadgeStyle = 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
export type BadgeColorKey = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'black' | 'gray';

export interface BadgeSettings {
  label: string;
  link: string;
  style: BadgeStyle;
  color: BadgeColorKey;
  /** Present only on the "unified language picker" preset — selecting a
   *  language here also fills in label/color/link (see BadgeSettingsForm). */
  language?: string;
}

export const BADGE_COLORS: Record<BadgeColorKey, string> = {
  blue: '#2563eb',
  green: '#16a34a',
  red: '#dc2626',
  orange: '#ea580c',
  purple: '#9333ea',
  black: '#18181b',
  gray: '#6b7280',
};

export interface LanguagePreset {
  key: string;
  label: string;
  color: BadgeColorKey;
  link: string;
}

/** Shared by the "unified badge" library preset's Settings dropdown. */
export const LANGUAGE_PRESETS: LanguagePreset[] = [
  { key: 'cpp', label: 'C++', color: 'blue', link: 'https://isocpp.org' },
  { key: 'python', label: 'Python', color: 'green', link: 'https://python.org' },
  { key: 'typescript', label: 'TypeScript', color: 'blue', link: 'https://typescriptlang.org' },
  { key: 'java', label: 'Java', color: 'orange', link: 'https://java.com' },
  { key: 'go', label: 'Go', color: 'blue', link: 'https://go.dev' },
  { key: 'rust', label: 'Rust', color: 'orange', link: 'https://rust-lang.org' },
];
