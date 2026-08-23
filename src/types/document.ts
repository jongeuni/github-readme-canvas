/** One free-text line (heading or paragraph) as it sits in the canvas DOM. */
export interface SerializedTextBlock {
  kind: 'text';
  className: 'md-h1' | 'md-h2' | 'md-h3' | 'md-h4' | 'md-h5' | 'md-h6' | 'md-quote' | 'md-ul-item' | 'md-ol-item' | 'md-task' | 'md-text';
  /** innerHTML, not textContent — preserves Shift+Enter <br> soft breaks. */
  html: string;
}

/** One placed widget instance (badge / tech-icon / stats / social / divider). */
export interface SerializedWidgetBlock {
  kind: 'widget';
  libId: string;
  type: string;
  name: string;
  settings: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export type SerializedBlock = SerializedTextBlock | SerializedWidgetBlock;

/** A named README draft saved to localStorage. */
export interface SavedDocument {
  id: string;
  name: string;
  savedAt: string;
  blocks: SerializedBlock[];
}

/** A whole-document starting point offered from the Templates picker — same
 *  shape a saved document's content takes (SerializedBlock[]), just static
 *  data instead of something the user saved. Replaces the canvas outright
 *  via editor.loadFromBlocks, same call the "Load" picker already makes. */
export interface Template {
  id: string;
  name: string;
  description: string;
  blocks: SerializedBlock[];
}
