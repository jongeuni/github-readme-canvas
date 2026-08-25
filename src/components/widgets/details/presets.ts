import type { LibraryEntry } from '../../../types/library';
import type { DetailsSettings } from './types';

export const detailsPresets: LibraryEntry<DetailsSettings>[] = [
  {
    id: 'dec-details',
    type: 'details',
    name: 'Collapsible Section',
    description: 'A click-to-expand toggle — GitHub\'s native <details> element.',
    category: '🏷️ markdown',
    tags: ['🏷️ markdown', 'Text', 'Toggle'],
    defaultSettings: { summary: 'Click to expand', content: 'Hidden content goes here.' },
  },
];
