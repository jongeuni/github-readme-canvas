import type { SettingsFormProps } from '../../../types/component';
import { SelectField } from '../../settings/fields';
import type { DividerSettings, DividerStyle } from './types';

const STYLE_OPTIONS: { value: DividerStyle; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'dashed', label: 'Dashed' },
];

export function DividerSettingsForm({ settings, onChange }: SettingsFormProps<DividerSettings>) {
  return <SelectField label="Style" value={settings.style} onChange={(style) => onChange({ style })} options={STYLE_OPTIONS} />;
}
