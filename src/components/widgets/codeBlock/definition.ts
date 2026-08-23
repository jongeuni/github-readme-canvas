import type { ComponentTypeDefinition } from '../../../types/component';
import type { CodeBlockSettings } from './types';
import { CodeBlockPreview } from './CodeBlockPreview';
import { CodeBlockSettingsForm } from './CodeBlockSettingsForm';

export const codeBlockDefinition: ComponentTypeDefinition<CodeBlockSettings> = {
  type: 'code-block',
  layout: 'block',
  Preview: CodeBlockPreview,
  SettingsForm: CodeBlockSettingsForm,
  toMarkdown: (s) => '```' + s.lang + '\n' + s.code + '\n```',
};
