import type { SettingsFormProps } from '../../../types/component';
import type { UrlComponentMeta } from '../../../types/urlComponent';
import type { UrlComponentSettings } from './types';
import { SelectField, TextField, UrlField } from '../../settings/fields';

export function UrlComponentSettingsForm({ settings, meta, onChange }: SettingsFormProps<UrlComponentSettings>) {
  const m = meta as UrlComponentMeta;
  return (
    <>
      {m.fields.map((f) => {
        if (f.type === 'text') {
          return <TextField key={f.key} label={f.label} value={settings[f.key] ?? ''} onChange={(v) => onChange({ [f.key]: v })} />;
        }
        if (f.type === 'select') {
          return (
            <SelectField
              key={f.key}
              label={f.label}
              value={settings[f.key] ?? ''}
              onChange={(v) => onChange({ [f.key]: v })}
              options={(f.options ?? []).map((o) => ({ value: o.value, label: o.label }))}
            />
          );
        }
        return (
          <div className="field" key={f.key}>
            <label>{f.label}</label>
            <div className="color-swatches">
              {(f.options ?? []).map((o) => (
                <div
                  key={o.value}
                  className={`swatch ${settings[f.key] === o.value ? 'selected' : ''}`}
                  style={{ background: o.swatch ?? o.value }}
                  title={o.label}
                  onClick={() => onChange({ [f.key]: o.value })}
                />
              ))}
            </div>
          </div>
        );
      })}
      {m.linkable && <UrlField label="Link" value={settings.link ?? ''} onChange={(v) => onChange({ link: v })} />}
    </>
  );
}
