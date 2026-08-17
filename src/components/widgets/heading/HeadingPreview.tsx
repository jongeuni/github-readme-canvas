import type { PreviewProps } from '../../../types/component';
import type { HeadingSettings } from './types';

const CLASS: Record<HeadingSettings['level'], string> = { h1: 'md-h1', h2: 'md-h2', text: 'md-text' };

/** Only used for the library card's static preview — on the canvas a
 *  "Heading" is inserted as plain editable text, never as this widget. */
export function HeadingPreview({ settings }: PreviewProps<HeadingSettings>) {
  const Cls = CLASS[settings.level];
  return <div className={Cls}>{settings.text}</div>;
}
