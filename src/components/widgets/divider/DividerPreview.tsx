import type { PreviewProps } from '../../../types/component';
import type { DividerSettings } from './types';

export function DividerPreview({ settings }: PreviewProps<DividerSettings>) {
  return <hr className={settings.style === 'dashed' ? 'divider-dashed' : 'divider-line'} />;
}
