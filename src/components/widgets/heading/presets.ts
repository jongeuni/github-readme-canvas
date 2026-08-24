import type { LibraryEntry } from '../../../types/library';
import type { HeadingSettings } from './types';

export const headingPresets: LibraryEntry<HeadingSettings>[] = [
  {
    id: 'dec-heading',
    type: 'heading',
    name: 'Heading',
    description: 'A section heading or text block.',
    category: '🏷️ markdown',
    tags: ['🏷️ markdown', 'Text'],
    defaultSettings: { text: 'About Me', level: 'h2' },
  },
];
