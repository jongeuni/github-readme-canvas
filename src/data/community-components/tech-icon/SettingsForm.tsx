import type { SettingsFormProps } from '../../../types/component';
import type { Align, TechIconSettings } from './types';
import { UrlField, SearchableSelectField } from '../../../components/settings/fields';
import { iconPresets } from './presets';

const ALIGN_OPTIONS: { value: Align; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export function SettingsForm({ settings, onChange }: SettingsFormProps<TechIconSettings>) {
  const matched = iconPresets.find((p) => p.settings?.slug === settings.slug);
  return (
    <>
      <SearchableSelectField
        label="Icon"
        value={settings.slug}
        displayLabel={matched?.name ?? settings.slug}
        options={iconPresets.map((p) => ({ value: p.settings!.slug!, label: p.name }))}
        placeholder="Search e.g. “spring boot”…"
        allowCustom
        onChange={(slug) => {
          const preset = iconPresets.find((p) => p.settings?.slug === slug);
          onChange(preset ? { slug, link: preset.settings!.link! } : { slug });
        }}
        hint='Not listed? Type any skillicons.dev icon name and pick "Use ... directly".'
      />
      <div className="field">
        <label>
          Size — <span>{settings.size}px</span>
        </label>
        <input
          type="range"
          min={24}
          max={72}
          step={4}
          value={settings.size}
          onChange={(e) => onChange({ size: Number(e.target.value) })}
        />
      </div>
      <UrlField label="Link" value={settings.link} onChange={(link) => onChange({ link })} />
      <div className="field">
        <label>Alignment</label>
        <div className="align-row">
          {ALIGN_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`align-btn ${settings.align === o.value ? 'active' : ''}`}
              onClick={() => onChange({ align: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
