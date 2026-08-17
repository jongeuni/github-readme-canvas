import type { LibraryEntry } from '../../../types/library';
import type { DividerSettings } from './types';

export const dividerPresets: LibraryEntry<DividerSettings>[] = [
  {
    id: 'dec-divider',
    type: 'divider',
    name: 'Divider',
    description: 'A simple horizontal divider.',
    category: 'Decorations',
    tags: ['Decorations'],
    defaultSettings: { style: 'line' },
  },
];
