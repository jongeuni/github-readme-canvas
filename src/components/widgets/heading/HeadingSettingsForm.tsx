import type { SettingsFormProps } from '../../../types/component';
import { SelectField, TextField } from '../../settings/fields';
import type { HeadingLevel, HeadingSettings } from './types';

const LEVEL_OPTIONS: { value: HeadingLevel; label: string }[] = [
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'text', label: 'Paragraph' },
];

export function HeadingSettingsForm({ settings, onChange }: SettingsFormProps<HeadingSettings>) {
  return (
    <>
      <TextField label="Text" value={settings.text} onChange={(text) => onChange({ text })} />
      <SelectField label="Style" value={settings.level} onChange={(level) => onChange({ level })} options={LEVEL_OPTIONS} />
    </>
  );
}
