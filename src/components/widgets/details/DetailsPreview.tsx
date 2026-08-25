import type { PreviewProps } from '../../../types/component';
import type { DetailsSettings } from './types';

export function DetailsPreview({ settings }: PreviewProps<DetailsSettings>) {
  return (
    <details className="md-details-preview">
      <summary>{settings.summary || 'Click to expand'}</summary>
      <div className="md-details-content">{settings.content || 'Empty — add content in Settings.'}</div>
    </details>
  );
}
