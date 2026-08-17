import type { ComponentTypeDefinition } from '../../../types/component';
import type { BadgeSettings } from './types';
import { BadgePreview } from './BadgePreview';
import { BadgeSettingsForm } from './BadgeSettingsForm';

export const badgeDefinition: ComponentTypeDefinition<BadgeSettings> = {
  type: 'badge',
  layout: 'inline',
  Preview: BadgePreview,
  SettingsForm: BadgeSettingsForm,
  toMarkdown: (s) =>
    `[![${s.label}](https://img.shields.io/badge/${encodeURIComponent(s.label)}-${s.color}?style=${s.style})](${s.link || '#'})`,
};
