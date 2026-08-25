import type { PreviewProps } from '../../../types/component';
import type { UrlComponentMeta } from '../../../types/urlComponent';
import { fillUrlTemplate } from '../../../types/urlComponent';
import type { UrlComponentSettings } from './types';

export function UrlComponentPreview({ settings, meta }: PreviewProps<UrlComponentSettings>) {
  const m = meta as UrlComponentMeta;
  const url = fillUrlTemplate(m.urlTemplate, settings);
  const alt = m.altTemplate ? fillUrlTemplate(m.altTemplate, settings) : (settings[m.fields[0]?.key] ?? '');
  // `width: 100%` of the CONTAINER (not a percentage of the canvas — the
  // container itself already carries `settings.width`, see
  // widgetHTMLContainer / updateSelectedWidgetSettings), only when a width
  // is actually set. `.url-component-img`'s own `max-width: 100%` only ever
  // caps an oversized image down — real GitHub `width="..."` also GROWS an
  // undersized one, which this preview needs to match: a 330px-natural
  // image set to width 100% genuinely renders huge on GitHub (the
  // container there is the whole README content column), not "as big as
  // its own pixels" the way max-width-only sizing would show here.
  return <img className="url-component-img" src={url} alt={alt} style={{ width: settings.width ? '100%' : undefined }} />;
}
