import type { ComponentModule, ComponentTypeDefinition } from '../../../types/component';
import type { LibraryEntry } from '../../../types/library';
import type { RawHtmlSettings } from './types';
import { Preview } from './Preview';
import { SettingsForm } from './SettingsForm';

const definition: ComponentTypeDefinition<RawHtmlSettings> = {
  type: 'raw-html',
  layout: 'block',
  Preview,
  SettingsForm,
  toMarkdown: (s) => s.html,
};

const entries: LibraryEntry<RawHtmlSettings>[] = [
  {
    id: 'raw-html',
    type: 'raw-html',
    name: 'Raw HTML',
    description: 'Arbitrary HTML, preserved and rendered as-is — used automatically when pasting raw HTML from a README.',
    category: '✨ decoration',
    tags: ['✨ decoration', 'HTML'],
    defaultSettings: { html: '' },
  },
];

export const module: ComponentModule<RawHtmlSettings> = { definition, entries };
