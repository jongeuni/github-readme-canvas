export interface DetailsSettings {
  /** The always-visible toggle label — GitHub renders this as the clickable line. */
  summary: string;
  /** Markdown, same as anything else on the canvas — GitHub renders the
   *  content between <summary> and </details> as regular markdown, not
   *  plain text. Exported verbatim; the canvas preview shows it as plain
   *  text (same fidelity tradeoff as Code Block/Table's own source-only
   *  preview) since rendering nested markdown is out of scope here. */
  content: string;
}
