import type { ComponentTypeDefinition } from '../../../types/component';
import type { DividerSettings } from './types';
import { DividerPreview } from './DividerPreview';
import { DividerSettingsForm } from './DividerSettingsForm';

export const dividerDefinition: ComponentTypeDefinition<DividerSettings> = {
  type: 'divider',
  layout: 'block',
  Preview: DividerPreview,
  SettingsForm: DividerSettingsForm,
  toMarkdown: () => '---',
};
