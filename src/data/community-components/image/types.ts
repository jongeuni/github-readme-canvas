/** A raw `<img>` by URL — not a shields.io-style badge, so it doesn't fit
 *  url-component's `![alt](url)` markdown-image model. `width` needs to be
 *  a real HTML attribute (not query-string data) to support the common
 *  README pattern of a full-width decorative image/GIF, e.g.
 *  `<img src="..." width="100%">` — GitHub renders that but not the
 *  equivalent markdown syntax, which has no width control at all. */
export interface ImageSettings {
  url: string;
  width: string;
  alt: string;
}
