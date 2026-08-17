import type { ComponentTypeDefinition } from '../../../types/component';
import type { TechIconMeta, TechIconSettings } from './types';
import { TechIconPreview } from './TechIconPreview';
import { TechIconSettingsForm } from './TechIconSettingsForm';

export const techIconDefinition: ComponentTypeDefinition<TechIconSettings> = {
  type: 'tech-icon',
  layout: 'inline',
  Preview: TechIconPreview,
  SettingsForm: TechIconSettingsForm,
  toMarkdown: (s, meta) => {
    const m = (meta as TechIconMeta) ?? { slug: 'code' };
    return `[![${m.slug}](https://skillicons.dev/icons?i=${m.slug})](${s.link || '#'})`;
  },
};
