/** Splits one GFM table row ("| a | b |" or "a | b") into trimmed cells. */
function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) => c.trim());
}

/** Parses raw GFM table source for the canvas preview only — export just
 *  hands the source back verbatim (see TableSettings' doc comment), so this
 *  never needs to be lossless, just good enough to preview. Line 2 (the
 *  "---|---" separator) is assumed present and skipped; a table still being
 *  typed without one yet just renders with no data rows. */
export function parseTableSource(source: string): { headers: string[]; rows: string[][] } {
  const lines = source
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  return { headers: splitRow(lines[0]), rows: lines.slice(2).map(splitRow) };
}

/** Inverse of parseTableSource, for the inline grid editor — rebuilds the
 *  raw GFM source from an in-memory headers/rows grid so edits round-trip
 *  back into TableSettings.source, still the single source of truth. */
export function serializeTableSource(headers: string[], rows: string[][]): string {
  const headerLine = `| ${headers.join(' | ')} |`;
  const sepLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const rowLines = rows.map((row) => `| ${row.join(' | ')} |`);
  return [headerLine, sepLine, ...rowLines].join('\n');
}
