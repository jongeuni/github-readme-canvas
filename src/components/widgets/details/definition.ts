import type { ComponentTypeDefinition } from '../../../types/component';
import type { DetailsSettings } from './types';
import { DetailsPreview } from './DetailsPreview';
import { DetailsSettingsForm } from './DetailsSettingsForm';

export const detailsDefinition: ComponentTypeDefinition<DetailsSettings> = {
  type: 'details',
  layout: 'block',
  Preview: DetailsPreview,
  SettingsForm: DetailsSettingsForm,
  toMarkdown: (s) => `<details>\n<summary>${s.summary || 'Click to expand'}</summary>\n\n${s.content}\n\n</details>`,
};
