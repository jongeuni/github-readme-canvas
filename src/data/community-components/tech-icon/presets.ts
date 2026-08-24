import type { PresetDefinition } from '../../../types/library';
import type { TechIconSettings } from './types';

/**
 * Named variants of the 'tech-icon' component — every tech shares identical
 * tile rendering/settings, only glyph/tileColor/slug/link differ. Preset ids
 * are the original standalone card ids so existing favorites / saved-document
 * / canvas widgets keep resolving to the exact same entries after flattening.
 */
export const iconPresets: PresetDefinition<TechIconSettings>[] = [
  { id: 'fw-react', name: 'React', settings: { link: 'https://react.dev' }, meta: { glyph: '⚛', tileColor: '#20232a', slug: 'react' } },
  { id: 'fw-node', name: 'Node.js', settings: { link: 'https://nodejs.org' }, meta: { glyph: '⬡', tileColor: '#333333', slug: 'nodejs' } },
  { id: 'fw-spring', name: 'Spring', settings: { link: 'https://spring.io' }, meta: { glyph: '🍃', tileColor: '#6DB33F', slug: 'spring' } },
];
