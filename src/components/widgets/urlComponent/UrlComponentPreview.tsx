import type { PreviewProps } from '../../../types/component';
import type { UrlComponentMeta } from '../../../types/urlComponent';
import { fillUrlTemplate } from '../../../types/urlComponent';
import type { UrlComponentSettings } from './types';

export function UrlComponentPreview({ settings, meta }: PreviewProps<UrlComponentSettings>) {
  const m = meta as UrlComponentMeta;
  const url = fillUrlTemplate(m.urlTemplate, settings);
  const alt = m.altTemplate ? fillUrlTemplate(m.altTemplate, settings) : (settings[m.fields[0]?.key] ?? '');
  return <img className="url-component-img" src={url} alt={alt} />;
}
