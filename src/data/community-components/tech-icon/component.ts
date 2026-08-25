import type { ComponentModule, ComponentTypeDefinition } from '../../../types/component';
import type { LibraryEntry } from '../../../types/library';
import type { TechIconSettings } from './types';
import { Preview } from './Preview';
import { SettingsForm } from './SettingsForm';
import { iconPresets } from './presets';

const definition: ComponentTypeDefinition<TechIconSettings> = {
  type: 'tech-icon',
  layout: 'inline',
  Preview,
  SettingsForm,
  toMarkdown: (s, meta) => {
    // Falls back to the old meta.slug shape for widgets placed before slug
    // moved into settings — see types.ts and Preview.tsx's same fallback.
    const slug = s.slug || (meta as { slug?: string } | undefined)?.slug || 'code';
    return `[![${slug}](https://skillicons.dev/icons?i=${slug})](${s.link || '#'})`;
  },
};

const entries: LibraryEntry<TechIconSettings>[] = [
  {
    id: 'tech-icon-picker',
    type: 'tech-icon',
    name: 'Tech Icon',
    description: 'A tech-stack icon for your README, from skillicons.dev.',
    category: '🧑‍💻 tech',
    tags: ['🧑‍💻 tech', 'Icon'],
    defaultSettings: { size: 40, link: 'https://react.dev', align: 'left', slug: 'react' },
    presetsLabel: 'icons',
    presets: iconPresets,
  },
];

export const module: ComponentModule<TechIconSettings> = { definition, entries };
