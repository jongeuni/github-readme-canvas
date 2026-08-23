/** Raw GitHub-flavored-markdown table source, e.g.
 *  "| A | B |\n| --- | --- |\n| 1 | 2 |" — edited and exported verbatim,
 *  parsed only for the canvas preview. Keeping the source itself as the
 *  single source of truth (rather than a rows/cols data structure) means
 *  power users can paste a table straight from anywhere GFM is written. */
export interface TableSettings {
  source: string;
}
