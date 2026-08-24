/** Plain text/unicode art — kaomoji, decorative separator lines. No URL, no
 *  image, nothing to fetch — the text IS the whole component, exported
 *  verbatim (see component.ts's toMarkdown). */
export interface TextArtSettings {
  text: string;
}
