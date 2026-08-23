import type { LibraryEntry } from '../../../types/library';
import type { TableSettings } from './types';

export const tablePresets: LibraryEntry<TableSettings>[] = [
  {
    id: 'dec-table',
    type: 'table',
    name: 'Table',
    description: 'A GitHub-flavored-markdown table.',
    category: 'Decorations',
    tags: ['Decorations', 'Text', 'Table'],
    defaultSettings: { source: '| Column A | Column B |\n| --- | --- |\n| Cell 1 | Cell 2 |' },
  },
];
