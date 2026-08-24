import type { PreviewProps } from '../../../types/component';
import type { TechIconMeta, TechIconSettings } from './types';

export function Preview({ settings, meta }: PreviewProps<TechIconSettings>) {
  const m = (meta as TechIconMeta) ?? { glyph: '?', tileColor: '#333', slug: 'code' };
  const justify = settings.align === 'center' ? 'center' : settings.align === 'right' ? 'flex-end' : 'flex-start';
  const fontSize = Math.max(12, Math.round((settings.size || 40) * 0.42));
  return (
    <div style={{ display: 'flex', justifyContent: justify, width: '100%' }}>
      <div className="tech-tile" style={{ width: settings.size, height: settings.size, background: m.tileColor, fontSize }}>
        {m.glyph}
      </div>
    </div>
  );
}
