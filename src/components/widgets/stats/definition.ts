import type { ComponentTypeDefinition } from '../../../types/component';
import type { StatsSettings } from './types';
import { StatsPreview } from './StatsPreview';
import { StatsSettingsForm } from './StatsSettingsForm';

export const statsDefinition: ComponentTypeDefinition<StatsSettings> = {
  type: 'stats',
  layout: 'block',
  Preview: StatsPreview,
  SettingsForm: StatsSettingsForm,
  toMarkdown: (s) => {
    const hide: string[] = [];
    if (s.hideIssues) hide.push('issues');
    if (s.hidePRs) hide.push('prs');
    if (s.hideContrib) hide.push('contrib');
    return `![${s.username}'s GitHub stats](https://github-readme-stats.vercel.app/api?username=${s.username}&show_icons=true&theme=${s.theme}${
      hide.length ? '&hide=' + hide.join(',') : ''
    })`;
  },
};
