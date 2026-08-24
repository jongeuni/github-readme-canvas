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
  // A copy-pasteable placeholder, not blank, when nothing's been typed yet —
  // same reasoning as Image/GIF's Usage preview (see that component.ts).
  toMarkdown: (s) => s.html || '<div align="center">\n\n</div>',
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
