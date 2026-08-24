import type { PreviewProps } from '../../../types/component';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';
import type { RawHtmlSettings } from './types';

export function Preview({ settings }: PreviewProps<RawHtmlSettings>) {
  if (!settings.html?.trim()) return <div className="md-table-empty">Paste raw HTML in Settings</div>;
  return <div className="raw-html-preview" dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.html) }} />;
}
