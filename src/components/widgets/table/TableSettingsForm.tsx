import type { SettingsFormProps } from '../../../types/component';
import { TextAreaField } from '../../settings/fields';
import type { TableSettings } from './types';

export function TableSettingsForm({ settings, onChange }: SettingsFormProps<TableSettings>) {
  return (
    <TextAreaField
      label="Table (Markdown)"
      value={settings.source}
      onChange={(source) => onChange({ source })}
      rows={8}
      hint={'GitHub table syntax: | Header | Header |\n| --- | --- |\n| Cell | Cell |'}
    />
  );
}
