import type { PreviewProps } from '../../../types/component';
import type { TocSettings } from './types';
import { parseTocSource } from './parseToc';

export function TocPreview({ settings }: PreviewProps<TocSettings>) {
  const entries = parseTocSource(settings.source);
  if (entries.length === 0) {
    return <div className="md-toc-empty">No headings yet — add some H1-H3 lines, then click "Regenerate from headings".</div>;
  }
  return (
    <ul className="md-toc-preview">
      {entries.map((e, i) => (
        <li key={i} style={{ paddingLeft: e.depth * 16 }}>
          <a href={`#${e.anchor}`}>{e.text}</a>
        </li>
      ))}
    </ul>
  );
}
