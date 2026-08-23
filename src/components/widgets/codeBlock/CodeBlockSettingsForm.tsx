import type { SettingsFormProps } from '../../../types/component';
import { TextField, TextAreaField } from '../../settings/fields';
import type { CodeBlockSettings } from './types';

export function CodeBlockSettingsForm({ settings, onChange }: SettingsFormProps<CodeBlockSettings>) {
  return (
    <>
      <TextField label="Language" value={settings.lang} onChange={(lang) => onChange({ lang })} placeholder="js, python, bash…" />
      <TextAreaField label="Code" value={settings.code} onChange={(code) => onChange({ code })} rows={10} placeholder="paste or type your code here" />
    </>
  );
}
