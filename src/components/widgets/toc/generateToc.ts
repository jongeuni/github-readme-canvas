/** GitHub's heading-anchor algorithm isn't published, but this is the same
 *  approximation every popular toc-generator uses: lowercase, drop anything
 *  that isn't a letter/number/space/hyphen/underscore, then turn runs of
 *  whitespace into a single hyphen. */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\- ]+/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

export interface HeadingInfo {
  level: number;
  text: string;
}

/** Turns a flat heading list into indented markdown list lines. Indent is
 *  relative to the shallowest level actually present, not to a fixed H1
 *  baseline, so a README that only uses H2/H3 still gets a TOC starting at
 *  the left margin. Duplicate headings get GitHub's own "-1", "-2", ...
 *  suffix so the generated links don't collide. Split out from the DOM scan
 *  below purely so it's unit-testable without a DOM environment. */
export function buildTocLines(headings: HeadingInfo[]): string {
  if (headings.length === 0) return '';
  const minLevel = Math.min(...headings.map((h) => h.level));
  const seen = new Map<string, number>();
  const lines: string[] = [];
  for (const { level, text: rawText } of headings) {
    const text = rawText.trim();
    if (!text) continue;
    const base = slugify(text) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const anchor = count === 0 ? base : `${base}-${count}`;
    const indent = '  '.repeat(level - minLevel);
    lines.push(`${indent}- [${text}](#${anchor})`);
  }
  return lines.join('\n');
}

const HEADING_CLASS_RE = /^md-h([1-3])$/;

/** Scans the canvas's top-level lines for H1-H3 (deeper levels would make
 *  most READMEs' TOC longer than the README itself) and builds the TOC
 *  source from them. */
export function generateTocSource(canvas: HTMLElement): string {
  const headings: HeadingInfo[] = [...canvas.children]
    .filter((el): el is HTMLElement => el instanceof HTMLElement && HEADING_CLASS_RE.test(el.className))
    .map((el) => ({ level: Number(HEADING_CLASS_RE.exec(el.className)![1]), text: el.textContent ?? '' }));
  return buildTocLines(headings);
}
