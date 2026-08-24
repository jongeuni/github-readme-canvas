import type { PreviewProps } from '../../../types/component';
import type { TextArtSettings } from './types';

export function Preview({ settings }: PreviewProps<TextArtSettings>) {
  if (!settings.text?.trim()) return <div className="md-table-empty">Pick a style from the Preset dropdown</div>;
  return <div className="text-art-preview">{settings.text}</div>;
}
