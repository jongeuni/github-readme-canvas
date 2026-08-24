import type { ComponentModule, ComponentTypeDefinition } from '../../../types/component';
import type { LibraryEntry } from '../../../types/library';
import type { TechIconMeta, TechIconSettings } from './types';
import { Preview } from './Preview';
import { SettingsForm } from './SettingsForm';
import { iconPresets } from './presets';

const definition: ComponentTypeDefinition<TechIconSettings> = {
  type: 'tech-icon',
  layout: 'inline',
  Preview,
  SettingsForm,
  toMarkdown: (s, meta) => {
    const m = (meta as TechIconMeta) ?? { slug: 'code' };
    return `[![${m.slug}](https://skillicons.dev/icons?i=${m.slug})](${s.link || '#'})`;
  },
};

const entries: LibraryEntry<TechIconSettings>[] = [
  {
    id: 'tech-icon-picker',
    type: 'tech-icon',
    name: 'Tech Icon',
    description: 'A tech-stack icon tile for your README.',
    category: '🧑‍💻 tech',
    tags: ['🧑‍💻 tech', 'Icon'],
    meta: { glyph: '⚛', tileColor: '#20232a', slug: 'react' },
    defaultSettings: { size: 40, link: 'https://react.dev', align: 'left' },
    presetsLabel: 'icons',
    presets: iconPresets,
  },
];

export const module: ComponentModule<TechIconSettings> = { definition, entries };
