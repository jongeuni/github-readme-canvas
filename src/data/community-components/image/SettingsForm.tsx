import type { SettingsFormProps } from '../../../types/component';
import { TextField, UrlField } from '../../../components/settings/fields';
import type { ImageSettings } from './types';

export function SettingsForm({ settings, meta, onChange }: SettingsFormProps<ImageSettings>) {
  // Line (see component.ts) is variant-only — its presets already carry a
  // fixed url/width, nothing here for the user to type in.
  if ((meta as { presetOnly?: boolean } | undefined)?.presetOnly) {
    return <div className="hint">Pick a style from the Preset dropdown above.</div>;
  }
  return (
    <>
      <UrlField label="Image URL" value={settings.url} onChange={(url) => onChange({ url })} />
      <TextField label="Width" value={settings.width} onChange={(width) => onChange({ width })} placeholder="100%, 300px, 50%…" />
      <TextField label="Alt text" value={settings.alt} onChange={(alt) => onChange({ alt })} placeholder="Optional" />
    </>
  );
}
