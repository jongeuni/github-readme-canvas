import type { PreviewProps } from '../../../types/component';
import type { UrlComponentMeta } from '../../../types/urlComponent';
import { fillUrlTemplate } from '../../../types/urlComponent';
import type { UrlComponentSettings } from './types';

export function UrlComponentPreview({ settings, meta }: PreviewProps<UrlComponentSettings>) {
  const m = meta as UrlComponentMeta;
  const url = fillUrlTemplate(m.urlTemplate, settings);
  const alt = m.altTemplate ? fillUrlTemplate(m.altTemplate, settings) : (settings[m.fields[0]?.key] ?? '');
  // No width style here on purpose — for an inline-layout widget the
  // container itself carries `settings.width` (see widgetHTMLContainer /
  // updateSelectedWidgetSettings), and `.url-component-img`'s own
  // `max-width: 100%` naturally caps the image to that container's real
  // size. Setting width here too would double-apply a percentage (45% of
  // an already-45%-sized container isn't 45% of the canvas).
  return <img className="url-component-img" src={url} alt={alt} />;
}
