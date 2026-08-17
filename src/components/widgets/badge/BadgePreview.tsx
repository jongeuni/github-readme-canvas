import type { PreviewProps } from '../../../types/component';
import type { BadgeSettings } from './types';
import { BADGE_COLORS } from './types';

const STYLE_CLASS: Record<BadgeSettings['style'], string> = {
  flat: '',
  'flat-square': 'style-square',
  'for-the-badge': 'style-badge',
  plastic: 'style-plastic',
};

export function BadgePreview({ settings }: PreviewProps<BadgeSettings>) {
  return (
    <span className={`md-badge ${STYLE_CLASS[settings.style]}`} style={{ background: BADGE_COLORS[settings.color] }}>
      {settings.label}
    </span>
  );
}
