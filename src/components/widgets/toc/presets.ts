import type { LibraryEntry } from '../../../types/library';
import type { TocSettings } from './types';

export const tocPresets: LibraryEntry<TocSettings>[] = [
  {
    id: 'dec-toc',
    type: 'toc',
    name: 'Table of Contents (목차)',
    description: 'An auto-generated list of links to your H1-H3 headings.',
    category: '🏷️ markdown',
    tags: ['🏷️ markdown', 'Text', 'Navigation'],
    defaultSettings: { source: '' },
  },
];
