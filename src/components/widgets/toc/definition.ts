import type { ComponentTypeDefinition } from '../../../types/component';
import type { TocSettings } from './types';
import { TocPreview } from './TocPreview';
import { TocSettingsForm } from './TocSettingsForm';

export const tocDefinition: ComponentTypeDefinition<TocSettings> = {
  type: 'toc',
  layout: 'block',
  Preview: TocPreview,
  SettingsForm: TocSettingsForm,
  toMarkdown: (s) => s.source.trim(),
};
