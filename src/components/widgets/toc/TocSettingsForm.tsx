import type { SettingsFormProps } from '../../../types/component';
import { TextAreaField } from '../../settings/fields';
import type { TocSettings } from './types';

export function TocSettingsForm({ settings, onChange }: SettingsFormProps<TocSettings>) {
  return (
    <TextAreaField
      label="Table of Contents (Markdown)"
      value={settings.source}
      onChange={(source) => onChange({ source })}
      rows={8}
      hint={'One "- [Heading](#anchor)" per line, indented 2 spaces per level. Use "Regenerate from headings" above to rebuild it from the canvas.'}
    />
  );
}
