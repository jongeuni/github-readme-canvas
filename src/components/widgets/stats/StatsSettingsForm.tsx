import type { SettingsFormProps } from '../../../types/component';
import type { StatsSettings, StatsTheme } from './types';
import { CheckboxRow, SelectField, TextField } from '../../settings/fields';

const THEME_OPTIONS: { value: StatsTheme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'radical', label: 'Radical' },
  { value: 'merko', label: 'Merko' },
];

export function StatsSettingsForm({ settings, onChange }: SettingsFormProps<StatsSettings>) {
  return (
    <>
      <TextField label="Username" value={settings.username} onChange={(username) => onChange({ username })} />
      <SelectField label="Theme" value={settings.theme} onChange={(theme) => onChange({ theme })} options={THEME_OPTIONS} />
      <div className="field">
        <label>Hide</label>
        <CheckboxRow label="Issues" checked={settings.hideIssues} onChange={(hideIssues) => onChange({ hideIssues })} />
        <CheckboxRow label="Pull Requests" checked={settings.hidePRs} onChange={(hidePRs) => onChange({ hidePRs })} />
        <CheckboxRow label="Contributions" checked={settings.hideContrib} onChange={(hideContrib) => onChange({ hideContrib })} />
      </div>
    </>
  );
}
