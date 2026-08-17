import type { SettingsFormProps } from '../../../types/component';
import { ReadOnlyField, SelectField, TextField } from '../../settings/fields';
import type { SocialIcon, SocialSettings } from './types';
import { SOCIAL_BASE_URL } from './types';

const ICON_OPTIONS: { value: SocialIcon; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'X / Twitter' },
];

export function SocialSettingsForm({ settings, onChange }: SettingsFormProps<SocialSettings>) {
  return (
    <>
      <TextField label="Username" value={settings.username} onChange={(username) => onChange({ username })} />
      <TextField label="Label" value={settings.label} onChange={(label) => onChange({ label })} />
      <SelectField label="Icon" value={settings.icon} onChange={(icon) => onChange({ icon })} options={ICON_OPTIONS} />
      <ReadOnlyField
        label="Link"
        value={(SOCIAL_BASE_URL[settings.icon] ?? '') + settings.username}
        hint="Auto-generated from icon + username"
      />
    </>
  );
}
