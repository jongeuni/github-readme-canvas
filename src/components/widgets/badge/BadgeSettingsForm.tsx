import type { SettingsFormProps } from '../../../types/component';
import type { BadgeColorKey, BadgeSettings, BadgeStyle } from './types';
import { BADGE_COLORS, LANGUAGE_PRESETS } from './types';
import { SelectField, TextField, UrlField } from '../../settings/fields';

const STYLE_OPTIONS: { value: BadgeStyle; label: string }[] = [
  { value: 'flat', label: 'Flat' },
  { value: 'flat-square', label: 'Flat Square' },
  { value: 'for-the-badge', label: 'For The Badge' },
  { value: 'plastic', label: 'Plastic' },
];

export function BadgeSettingsForm({ settings, onChange }: SettingsFormProps<BadgeSettings>) {
  return (
    <>
      {settings.language !== undefined && (
        <SelectField
          label="Language"
          value={settings.language}
          onChange={(language) => {
            const preset = LANGUAGE_PRESETS.find((p) => p.key === language);
            onChange(preset ? { language, label: preset.label, color: preset.color, link: preset.link } : { language });
          }}
          options={LANGUAGE_PRESETS.map((p) => ({ value: p.key, label: p.label }))}
        />
      )}
      <TextField label="Label" value={settings.label} onChange={(label) => onChange({ label })} />
      <UrlField label="Link" value={settings.link} onChange={(link) => onChange({ link })} />
      <SelectField label="Style" value={settings.style} onChange={(style) => onChange({ style })} options={STYLE_OPTIONS} />
      <div className="field">
        <label>Color</label>
        <div className="color-swatches">
          {(Object.keys(BADGE_COLORS) as BadgeColorKey[]).map((c) => (
            <div
              key={c}
              className={`swatch ${c === settings.color ? 'selected' : ''}`}
              style={{ background: BADGE_COLORS[c] }}
              title={c}
              onClick={() => onChange({ color: c })}
            />
          ))}
        </div>
      </div>
    </>
  );
}
