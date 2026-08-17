import type { LibraryEntry } from '../../../types/library';
import type { TechIconSettings } from './types';

export const techIconPresets: LibraryEntry<TechIconSettings>[] = [
  {
    id: 'fw-react',
    type: 'tech-icon',
    name: 'React',
    description: 'Tech stack icon for React.',
    category: 'Frameworks',
    tags: ['Frameworks', 'Icon'],
    meta: { glyph: '⚛', tileColor: '#20232a', slug: 'react' },
    defaultSettings: { size: 40, link: 'https://react.dev', align: 'left' },
  },
  {
    id: 'fw-node',
    type: 'tech-icon',
    name: 'Node.js',
    description: 'Tech stack icon for Node.js.',
    category: 'Frameworks',
    tags: ['Frameworks', 'Icon'],
    meta: { glyph: '⬡', tileColor: '#333333', slug: 'nodejs' },
    defaultSettings: { size: 40, link: 'https://nodejs.org', align: 'left' },
  },
  {
    id: 'fw-spring',
    type: 'tech-icon',
    name: 'Spring',
    description: 'Tech stack icon for Spring Boot.',
    category: 'Frameworks',
    tags: ['Frameworks', 'Icon'],
    meta: { glyph: '🍃', tileColor: '#6DB33F', slug: 'spring' },
    defaultSettings: { size: 40, link: 'https://spring.io', align: 'left' },
  },
];
