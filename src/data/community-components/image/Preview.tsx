import type { PreviewProps } from '../../../types/component';
import type { ImageSettings } from './types';

export function Preview({ settings }: PreviewProps<ImageSettings>) {
  if (!settings.url) return <div className="md-table-empty">Paste an image URL in Settings</div>;
  return <img className="url-component-img" src={settings.url} alt={settings.alt || 'image'} style={{ width: settings.width || undefined }} />;
}
