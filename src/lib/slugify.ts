/** Lowercase, hyphen-separated, filename/id-safe. Falls back to "component"
 *  for input that's empty or has nothing alphanumeric in it (pure emoji/CJK). */
export function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'component'
  );
}

/** A Library `category` (e.g. "✨ decoration") -> the plain-English tag word
 *  used as the first segment of a community-components filename
 *  ({tag}-{username}-projectname.json, see that directory's README). Strips
 *  the leading emoji/whitespace and keeps the trailing word. */
export function categoryToTag(category: string): string {
  const words = category.replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/);
  return slugify(words[words.length - 1] ?? category);
}
