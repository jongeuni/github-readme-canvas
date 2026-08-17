import type { LibraryEntry } from '../../../types/library';
import type { StatsSettings } from './types';

export const statsPresets: LibraryEntry<StatsSettings>[] = [
  {
    id: 'stats-github',
    type: 'stats',
    name: 'GitHub Stats',
    description: 'A live card of your GitHub statistics.',
    category: 'Stats',
    tags: ['Stats', 'Card'],
    defaultSettings: { username: 'alex123', theme: 'default', hideIssues: false, hidePRs: false, hideContrib: false },
  },
];
