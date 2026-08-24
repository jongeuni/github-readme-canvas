import type { ComponentModule, ComponentTypeDefinition } from '../../../types/component';
import type { LibraryEntry } from '../../../types/library';
import type { ImageSettings } from './types';
import { Preview } from './Preview';
import { SettingsForm } from './SettingsForm';
import { linePresets } from './presets';

const definition: ComponentTypeDefinition<ImageSettings> = {
  type: 'image',
  layout: 'block',
  Preview,
  SettingsForm,
  toMarkdown: (s) => {
    // Always a complete tag, even with an empty src — the "Usage" preview on
    // an un-filled-in Image/GIF card should show real, copy-pasteable
    // `<img>` markup (to paste a URL into by hand) instead of going blank.
    const width = s.width ? ` width="${s.width}"` : '';
    const alt = s.alt ? ` alt="${s.alt}"` : '';
    return `<img src="${s.url}"${width}${alt}>`;
  },
};

const entries: LibraryEntry<ImageSettings>[] = [
  {
    id: 'image',
    type: 'image',
    name: 'Image',
    description: 'Any image by URL — paste your own.',
    category: 'Decorations',
    tags: ['Decorations', 'Image'],
    defaultSettings: { url: '', width: '100%', alt: '' },
  },
  // Functionally identical to Image — exists as its own card purely so
  // searching "gif" finds something, instead of only ever surfacing "Image".
  {
    id: 'gif',
    type: 'image',
    name: 'GIF',
    description: 'Any GIF by URL — paste your own.',
    category: 'Decorations',
    tags: ['Decorations', 'Image', 'GIF'],
    defaultSettings: { url: '', width: '100%', alt: '' },
  },
  {
    id: 'line',
    type: 'image',
    name: 'Line',
    description: 'A decorative divider line — pick a style below.',
    category: 'Decorations',
    tags: ['Decorations', 'Image'],
    defaultSettings: { ...linePresets[0].settings, alt: '' } as ImageSettings,
    presetsLabel: 'styles',
    presets: linePresets,
    // Read by SettingsForm — Line is variant-only (see presets above), no
    // free-text URL/width/alt fields to fill in, unlike Image/GIF.
    meta: { presetOnly: true },
  },
];

export const module: ComponentModule<ImageSettings> = { definition, entries };
