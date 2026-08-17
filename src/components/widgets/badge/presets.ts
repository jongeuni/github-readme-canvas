import type { LibraryEntry } from '../../../types/library';
import type { BadgeSettings } from './types';

/**
 * Library presets for the 'badge' component type. To add a new badge to the
 * library (a new language, tool, database, ...), add one entry here — no
 * other file needs to change.
 */
export const badgePresets: LibraryEntry<BadgeSettings>[] = [
  {
    id: 'lang-cpp',
    type: 'badge',
    name: 'C++',
    description: 'A badge for the C++ programming language.',
    category: 'Languages',
    tags: ['Languages', 'Badge'],
    defaultSettings: { label: 'C++', link: 'https://isocpp.org', style: 'flat', color: 'blue' },
  },
  {
    id: 'lang-python',
    type: 'badge',
    name: 'Python',
    description: 'A badge for the Python programming language.',
    category: 'Languages',
    tags: ['Languages', 'Badge'],
    defaultSettings: { label: 'Python', link: 'https://python.org', style: 'flat', color: 'green' },
  },
  {
    id: 'lang-ts',
    type: 'badge',
    name: 'TypeScript',
    description: 'A badge for the TypeScript language.',
    category: 'Languages',
    tags: ['Languages', 'Badge'],
    defaultSettings: { label: 'TypeScript', link: 'https://typescriptlang.org', style: 'flat', color: 'blue' },
  },
  {
    id: 'lang-java',
    type: 'badge',
    name: 'Java',
    description: 'A badge for the Java programming language.',
    category: 'Languages',
    tags: ['Languages', 'Badge'],
    defaultSettings: { label: 'Java', link: 'https://java.com', style: 'flat', color: 'orange' },
  },
  // Alternate "unified" library item — one card for all languages, picked via
  // a Settings dropdown. Only shown when the badge-mode toggle is 'unified'.
  {
    id: 'lang-badge-unified',
    type: 'badge',
    name: 'Language Badge',
    description: 'Pick any language from the dropdown in Settings.',
    category: 'Languages',
    tags: ['Languages', 'Badge'],
    defaultSettings: { language: 'cpp', label: 'C++', link: 'https://isocpp.org', style: 'flat', color: 'blue' },
  },
  {
    id: 'db-postgres',
    type: 'badge',
    name: 'PostgreSQL',
    description: 'A badge for PostgreSQL.',
    category: 'Databases',
    tags: ['Databases', 'Badge'],
    defaultSettings: { label: 'PostgreSQL', link: 'https://postgresql.org', style: 'flat', color: 'blue' },
  },
  {
    id: 'db-mongo',
    type: 'badge',
    name: 'MongoDB',
    description: 'A badge for MongoDB.',
    category: 'Databases',
    tags: ['Databases', 'Badge'],
    defaultSettings: { label: 'MongoDB', link: 'https://mongodb.com', style: 'flat', color: 'green' },
  },
  {
    id: 'tool-docker',
    type: 'badge',
    name: 'Docker',
    description: 'A badge for Docker.',
    category: 'Tools',
    tags: ['Tools', 'Badge'],
    defaultSettings: { label: 'Docker', link: 'https://docker.com', style: 'flat', color: 'blue' },
  },
  {
    id: 'tool-git',
    type: 'badge',
    name: 'Git',
    description: 'A badge for Git.',
    category: 'Tools',
    tags: ['Tools', 'Badge'],
    defaultSettings: { label: 'Git', link: 'https://git-scm.com', style: 'flat', color: 'gray' },
  },
];

/** IDs hidden when the badge-mode toggle is set to 'unified' (replaced by lang-badge-unified). */
export const PER_LANGUAGE_BADGE_IDS = ['lang-cpp', 'lang-python', 'lang-ts', 'lang-java'];
