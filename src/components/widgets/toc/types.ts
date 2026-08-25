/** One markdown link-list line per heading, e.g. "- [About Me](#about-me)",
 *  indented two spaces per level below the shallowest heading found —
 *  produced by "Regenerate from headings" (see SettingsPanel), then edited
 *  and exported verbatim, same single-source-of-truth pattern as Table's
 *  own `source` field. */
export interface TocSettings {
  source: string;
}
