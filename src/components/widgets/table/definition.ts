import type { ComponentTypeDefinition } from '../../../types/component';
import type { TableSettings } from './types';
import { TablePreview } from './TablePreview';
import { TableSettingsForm } from './TableSettingsForm';

export const tableDefinition: ComponentTypeDefinition<TableSettings> = {
  type: 'table',
  layout: 'block',
  Preview: TablePreview,
  SettingsForm: TableSettingsForm,
  toMarkdown: (s) => s.source.trim(),
};
