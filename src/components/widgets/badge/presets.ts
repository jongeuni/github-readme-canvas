import type { LibraryEntry } from '../../../types/library';
import type { BadgeSettings } from './types';

/**
 * Library presets for the 'badge' component type. To add a new badge to the
 * library (a new language, tool, database, ...), add one entry here — no
 * other file needs to change.
 */
export const badgePresets: LibraryEntry<BadgeSettings>[] = [
  // A single Component with per-language Presets (see PresetDefinition's doc
  // comment in types/library.ts for the Component-vs-Preset rule) — every
  // language here shares identical badge rendering/settings, only
  // label/color/link differ, so this is exactly the "preset" case.
  // Preset ids are the original standalone card ids (lang-cpp, ...) so
  // existing favorites / saved-document / canvas widgets keep resolving to
  // the exact same entries after flattening.
  {
    id: 'lang-badge',
    type: 'badge',
    name: 'Language Badge',
    description: 'A badge for your programming language.',
    category: 'Languages',
    tags: ['Languages', 'Badge'],
    defaultSettings: { label: 'C++', link: 'https://isocpp.org', style: 'flat', color: 'blue' },
    presetsLabel: 'languages',
    presets: [
      { id: 'lang-cpp', name: 'C++', settings: { label: 'C++', color: 'blue', link: 'https://isocpp.org' } },
      { id: 'lang-python', name: 'Python', settings: { label: 'Python', color: 'green', link: 'https://python.org' } },
      { id: 'lang-ts', name: 'TypeScript', settings: { label: 'TypeScript', color: 'blue', link: 'https://typescriptlang.org' } },
      { id: 'lang-java', name: 'Java', settings: { label: 'Java', color: 'orange', link: 'https://java.com' } },
      { id: 'lang-go', name: 'Go', settings: { label: 'Go', color: 'blue', link: 'https://go.dev' } },
      { id: 'lang-rust', name: 'Rust', settings: { label: 'Rust', color: 'orange', link: 'https://rust-lang.org' } },
    ],
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
