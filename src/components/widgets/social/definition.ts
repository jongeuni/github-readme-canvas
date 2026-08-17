import type { ComponentTypeDefinition } from '../../../types/component';
import type { SocialSettings } from './types';
import { SOCIAL_BASE_URL, SOCIAL_COLORS } from './types';
import { SocialPreview } from './SocialPreview';
import { SocialSettingsForm } from './SocialSettingsForm';

export const socialDefinition: ComponentTypeDefinition<SocialSettings> = {
  type: 'social',
  layout: 'inline',
  Preview: SocialPreview,
  SettingsForm: SocialSettingsForm,
  toMarkdown: (s) => {
    const base = SOCIAL_BASE_URL[s.icon] ?? 'https://';
    const color = (SOCIAL_COLORS[s.icon] ?? '#18181b').replace('#', '');
    return `[![${s.label}](https://img.shields.io/badge/${encodeURIComponent(s.label)}-${color}?logo=${s.icon}&logoColor=white)](${base}${s.username})`;
  },
};
