import type { SettingsFormProps } from '../../../types/component';
import { TextAreaField } from '../../../components/settings/fields';
import type { TextArtSettings } from './types';
import { kaomojiPresets, dividerPresets } from './presets';

/** A plain <select> whose OPTION LABELS are the preset's actual text (the
 *  kaomoji/decorative line itself), not its name — picking one is picking a
 *  look, not reading a label. Bypasses SettingsPanel's generic name-based
 *  Preset dropdown entirely (see the `text-art` special-case there); this is
 *  a completely separate, self-contained control that just writes straight
 *  into `settings.text`, no libId/preset-identity swap involved. */
export function SettingsForm({ settings, meta, onChange }: SettingsFormProps<TextArtSettings>) {
  const family = (meta as { family?: 'kaomoji' | 'divider' } | undefined)?.family;
  const presets = family === 'divider' ? dividerPresets : kaomojiPresets;

  return (
    <>
      <div className="field">
        <label>Style</label>
        <select value={settings.text} onChange={(e) => onChange({ text: e.target.value })}>
          {presets.map((p) => (
            <option key={p.id} value={p.settings!.text}>
              {p.settings!.text}
            </option>
          ))}
        </select>
      </div>
      <TextAreaField
        label="Text"
        value={settings.text}
        onChange={(text) => onChange({ text })}
        rows={4}
        hint="Pick a style above, or type/paste your own."
      />
    </>
  );
}
