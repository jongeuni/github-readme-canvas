import type { ComponentTypeDefinition } from '../../../types/component';
import type { UrlComponentMeta } from '../../../types/urlComponent';
import { fillUrlTemplate } from '../../../types/urlComponent';
import type { UrlComponentSettings } from './types';
import { UrlComponentPreview } from './UrlComponentPreview';
import { UrlComponentSettingsForm } from './UrlComponentSettingsForm';

/**
 * Generic "URL template" widget type — represents ANY badge/icon/stat
 * service that works by filling a few parameters into a URL and rendering
 * the resulting image (shields.io, skillicons.dev, github-readme-stats, ...).
 * A specific service (e.g. "Shields.io badge") is not its own React
 * component — it's a LibraryEntry of this one type, whose `meta` carries the
 * urlTemplate + field schema. See src/types/urlComponent.ts.
 */
export const urlComponentDefinition: ComponentTypeDefinition<UrlComponentSettings> = {
  type: 'url-component',
  layout: 'inline',
  Preview: UrlComponentPreview,
  SettingsForm: UrlComponentSettingsForm,
  toMarkdown: (s, meta) => {
    const m = meta as UrlComponentMeta;
    const url = fillUrlTemplate(m.urlTemplate, s);
    const alt = m.altTemplate ? fillUrlTemplate(m.altTemplate, s) : (s[m.fields[0]?.key] ?? 'badge');
    const img = `![${alt}](${url})`;
    const link = m.linkTemplate ? fillUrlTemplate(m.linkTemplate, s) : m.linkable ? s.link : undefined;
    return link ? `[${img}](${link})` : img;
  },
};
