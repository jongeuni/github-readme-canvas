import type { LibraryEntry } from '../../../types/library';
import type { TechIconSettings } from './types';

/**
 * A single Component with per-tech Presets (see PresetDefinition's doc
 * comment in types/library.ts) — every tech shares identical tile
 * rendering/settings, only glyph/tileColor/slug/link differ.
 * Preset ids are the original standalone card ids (fw-react, ...) so
 * existing favorites / saved-document / canvas widgets keep resolving to
 * the exact same entries after flattening.
 */
export const techIconPresets: LibraryEntry<TechIconSettings>[] = [
  {
    id: 'tech-icon-picker',
    type: 'tech-icon',
    name: 'Tech Icon',
    description: 'A tech-stack icon tile for your README.',
    category: 'Frameworks',
    tags: ['Frameworks', 'Icon'],
    meta: { glyph: '⚛', tileColor: '#20232a', slug: 'react' },
    defaultSettings: { size: 40, link: 'https://react.dev', align: 'left' },
    presetsLabel: 'icons',
    presets: [
      { id: 'fw-react', name: 'React', settings: { link: 'https://react.dev' }, meta: { glyph: '⚛', tileColor: '#20232a', slug: 'react' } },
      { id: 'fw-node', name: 'Node.js', settings: { link: 'https://nodejs.org' }, meta: { glyph: '⬡', tileColor: '#333333', slug: 'nodejs' } },
      { id: 'fw-spring', name: 'Spring', settings: { link: 'https://spring.io' }, meta: { glyph: '🍃', tileColor: '#6DB33F', slug: 'spring' } },
    ],
  },
];
