import type { SettingsFormProps } from '../../../types/component';
import { TextField, TextAreaField } from '../../settings/fields';
import { DetailsContentPreview } from './DetailsContentPreview';
import type { DetailsSettings } from './types';

export function DetailsSettingsForm({ settings, onChange }: SettingsFormProps<DetailsSettings>) {
  return (
    <>
      <TextField label="Summary" value={settings.summary} onChange={(summary) => onChange({ summary })} placeholder="Click to expand" />
      <TextAreaField
        label="Content (Markdown)"
        value={settings.content}
        onChange={(content) => onChange({ content })}
        rows={8}
        hint="Regular markdown — headings, images, code blocks, etc. all work here on GitHub, same as anywhere else in the README."
      />
      <DetailsContentPreview content={settings.content} />
    </>
  );
}
