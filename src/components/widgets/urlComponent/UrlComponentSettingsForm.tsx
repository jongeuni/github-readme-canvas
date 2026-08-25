import type { SettingsFormProps } from '../../../types/component';
import type { UrlComponentMeta } from '../../../types/urlComponent';
import { fillUrlTemplate } from '../../../types/urlComponent';
import type { UrlComponentSettings } from './types';
import { CheckboxRow, ReadOnlyField, SelectField, TextField, UrlField } from '../../settings/fields';

function toggleInList(list: string, value: string, checked: boolean): string {
  const values = list ? list.split(',') : [];
  const next = checked ? [...values, value] : values.filter((v) => v !== value);
  return next.join(',');
}

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
        if (f.type === 'number') {
          const value = Number(settings[f.key] ?? f.min ?? 0);
          return (
            <div className="field" key={f.key}>
              <label>
                {f.label} — <span>{value}</span>
              </label>
              <input
                type="range"
                min={f.min ?? 0}
                max={f.max ?? 100}
                step={f.step ?? 1}
                value={value}
                onChange={(e) => onChange({ [f.key]: e.target.value })}
              />
            </div>
          );
        }
        if (f.type === 'checkbox-group') {
          const selected = (settings[f.key] ?? '').split(',').filter(Boolean);
          return (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              {(f.options ?? []).map((o) => (
                <CheckboxRow
                  key={o.value}
                  label={o.label}
                  checked={selected.includes(o.value)}
                  onChange={(checked) => onChange({ [f.key]: toggleInList(settings[f.key] ?? '', o.value, checked) })}
                />
              ))}
            </div>
          );
        }
        // 'color'
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
      <TextField
        label="Display width"
        value={settings.width ?? ''}
        onChange={(width) => onChange({ width })}
        placeholder="Natural size — try 300px, 50%…"
      />
      {m.linkTemplate ? (
        <ReadOnlyField label="Link" value={fillUrlTemplate(m.linkTemplate, settings)} hint="Auto-generated" />
      ) : (
        m.linkable && <UrlField label="Link" value={settings.link ?? ''} onChange={(v) => onChange({ link: v })} />
      )}
    </>
  );
}
