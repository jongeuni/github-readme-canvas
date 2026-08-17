import type { PreviewProps } from '../../../types/component';
import type { StatsSettings } from './types';

export function StatsPreview({ settings }: PreviewProps<StatsSettings>) {
  const themeClass = settings.theme && settings.theme !== 'default' ? `theme-${settings.theme}` : '';
  return (
    <div className={`stats-card ${themeClass}`}>
      <div className="stats-title">{settings.username}'s GitHub Stats</div>
      <div className="stats-row">
        <span>⭐ Total Stars</span>
        <span>128</span>
      </div>
      <div className="stats-row">
        <span>🔥 Total Commits</span>
        <span>1,204</span>
      </div>
      {!settings.hidePRs && (
        <div className="stats-row">
          <span>🔀 Pull Requests</span>
          <span>34</span>
        </div>
      )}
      {!settings.hideIssues && (
        <div className="stats-row">
          <span>⚠️ Issues</span>
          <span>12</span>
        </div>
      )}
      {!settings.hideContrib && (
        <div className="stats-row">
          <span>📈 Contributed to</span>
          <span>9 repos</span>
        </div>
      )}
    </div>
  );
}
