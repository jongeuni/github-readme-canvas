import type { LibraryEntry } from '../../../types/library';
import type { SocialSettings } from './types';

export const socialPresets: LibraryEntry<SocialSettings>[] = [
  {
    id: 'social-github',
    type: 'social',
    name: 'GitHub',
    description: 'Link to your GitHub profile.',
    category: 'Social',
    tags: ['Social', 'Link'],
    defaultSettings: { username: 'alex123', label: 'GitHub', icon: 'github' },
  },
  {
    id: 'social-linkedin',
    type: 'social',
    name: 'LinkedIn',
    description: 'Link to your LinkedIn profile.',
    category: 'Social',
    tags: ['Social', 'Link'],
    defaultSettings: { username: 'alex123', label: 'LinkedIn', icon: 'linkedin' },
  },
  {
    id: 'social-twitter',
    type: 'social',
    name: 'X (Twitter)',
    description: 'Link to your X profile.',
    category: 'Social',
    tags: ['Social', 'Link'],
    defaultSettings: { username: 'alex123', label: 'X', icon: 'twitter' },
  },
];
