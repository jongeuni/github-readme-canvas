import type { ComponentModule, ComponentTypeDefinition } from '../../../types/component';
import type { LibraryEntry } from '../../../types/library';
import type { TextArtSettings } from './types';
import { Preview } from './Preview';
import { SettingsForm } from './SettingsForm';
import { kaomojiPresets, dividerPresets } from './presets';

const definition: ComponentTypeDefinition<TextArtSettings> = {
  type: 'text-art',
  layout: 'block',
  Preview,
  SettingsForm,
  toMarkdown: (s) => s.text,
};

const entries: LibraryEntry<TextArtSettings>[] = [
  {
    id: 'kaomoji',
    type: 'text-art',
    name: 'Kaomoji',
    description: 'A cute text emoticon — pick one, or type your own.',
    category: '💭 emotion',
    tags: ['💭 emotion', 'Text'],
    defaultSettings: { text: kaomojiPresets[0].settings!.text! },
    presetsLabel: 'kaomoji',
    presets: kaomojiPresets,
  },
  {
    id: 'text-divider',
    type: 'text-art',
    name: 'Decorative Line',
    description: 'A unicode/ASCII-art separator line for your README.',
    category: '✨ decoration',
    tags: ['✨ decoration', 'Text'],
    defaultSettings: { text: dividerPresets[0].settings!.text! },
    presetsLabel: 'styles',
    presets: dividerPresets,
  },
];

export const module: ComponentModule<TextArtSettings> = { definition, entries };
