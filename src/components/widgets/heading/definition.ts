import type { ComponentTypeDefinition } from '../../../types/component';
import type { HeadingSettings } from './types';
import { HeadingPreview } from './HeadingPreview';
import { HeadingSettingsForm } from './HeadingSettingsForm';

export const headingDefinition: ComponentTypeDefinition<HeadingSettings> = {
  type: 'heading',
  layout: 'block',
  Preview: HeadingPreview,
  SettingsForm: HeadingSettingsForm,
  toMarkdown: (s) => {
    if (s.level === 'h1') return `# ${s.text}`;
    if (s.level === 'h2') return `## ${s.text}`;
    return s.text;
  },
};
