import type { PresetDefinition } from '../../../types/library';
import type { ImageSettings } from './types';

/**
 * Presets for the "Line" entry (see component.ts) — a few decorative divider
 * GIFs, curated from repos people already use them from (verified live
 * before adding). Not meant to be exhaustive, and not user-extensible via a
 * URL field (Line is variant-only) — "Image"/"GIF" are the entries for
 * pasting any URL.
 */
export const linePresets: PresetDefinition<ImageSettings>[] = [
  {
    id: 'img-line-neon',
    name: 'Neon Line',
    settings: { url: 'https://raw.githubusercontent.com/AnderMendoza/AnderMendoza/main/assets/line-neon.gif', width: '100%' },
  },
  {
    id: 'img-line-fading',
    name: 'Fading Line',
    settings: { url: 'https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif', width: '100%' },
  },
  {
    id: 'img-line-gradient',
    name: 'Gradient Line',
    settings: { url: 'https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif', width: '100%' },
  },
];
