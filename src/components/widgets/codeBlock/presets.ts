import type { LibraryEntry } from '../../../types/library';
import type { CodeBlockSettings } from './types';

export const codeBlockPresets: LibraryEntry<CodeBlockSettings>[] = [
  {
    id: 'dec-codeblock',
    type: 'code-block',
    name: 'Code Block',
    description: 'A fenced, syntax-labeled code block.',
    category: 'Decorations',
    tags: ['Decorations', 'Text', 'Code'],
    defaultSettings: { lang: '', code: '' },
  },
];
