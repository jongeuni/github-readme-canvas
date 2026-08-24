import type { SettingsFormProps } from '../../../types/component';
import { TextAreaField } from '../../../components/settings/fields';
import type { RawHtmlSettings } from './types';

export function SettingsForm({ settings, onChange }: SettingsFormProps<RawHtmlSettings>) {
  return (
    <TextAreaField
      label="HTML"
      value={settings.html}
      onChange={(html) => onChange({ html })}
      rows={10}
      hint="Raw HTML, preserved and rendered as-is."
    />
  );
}
