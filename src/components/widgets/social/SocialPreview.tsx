import type { PreviewProps } from '../../../types/component';
import { Icon } from '../../Icon';
import type { SocialSettings } from './types';
import { SOCIAL_COLORS } from './types';

export function SocialPreview({ settings }: PreviewProps<SocialSettings>) {
  return (
    <span className="social-pill" style={{ background: SOCIAL_COLORS[settings.icon] }}>
      <Icon name={settings.icon} />
      {settings.label}
    </span>
  );
}
