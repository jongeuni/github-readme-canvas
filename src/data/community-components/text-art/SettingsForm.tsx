import type { SettingsFormProps } from '../../../types/component';
import { TextAreaField } from '../../../components/settings/fields';
import type { TextArtSettings } from './types';

export function SettingsForm({ settings, onChange }: SettingsFormProps<TextArtSettings>) {
  return (
    <TextAreaField
      label="Text"
      value={settings.text}
      onChange={(text) => onChange({ text })}
      rows={4}
      hint="Pick a style from the Preset dropdown above, or type/paste your own."
    />
  );
}
