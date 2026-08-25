import type { PreviewProps } from '../../../types/component';
import type { TechIconSettings } from './types';

export function Preview({ settings, meta }: PreviewProps<TechIconSettings>) {
  // Falls back to the old meta.slug shape for widgets placed before slug
  // moved into settings (see types.ts) — a saved document from before that
  // change still has its icon here instead of silently going blank.
  const slug = settings.slug || (meta as { slug?: string } | undefined)?.slug || 'code';
  const justify = settings.align === 'center' ? 'center' : settings.align === 'right' ? 'flex-end' : 'flex-start';
  return (
    <div style={{ display: 'flex', justifyContent: justify, width: '100%' }}>
      <img src={`https://skillicons.dev/icons?i=${slug}`} alt={slug} width={settings.size} height={settings.size} />
    </div>
  );
}
