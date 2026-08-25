export interface TocEntry {
  depth: number;
  text: string;
  anchor: string;
}

const TOC_LINE_RE = /^(\s*)-\s*\[(.+?)\]\(#(.+?)\)\s*$/;

/** Parses generated/hand-edited TOC source for the canvas preview only —
 *  export hands `source` back verbatim (see TocSettings' doc comment), same
 *  split as Table's own parse-for-preview-only helper. Indent is measured
 *  in raw spaces and only used to rank entries relative to each other, so a
 *  hand-typed 3-space indent still nests one level deep. */
export function parseTocSource(source: string): TocEntry[] {
  return source
    .split('\n')
    .map((line) => TOC_LINE_RE.exec(line))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ depth: Math.floor(m[1].length / 2), text: m[2], anchor: m[3] }));
}
