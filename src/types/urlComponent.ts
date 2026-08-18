export type UrlFieldType = 'text' | 'color' | 'select';

export interface UrlFieldOption {
  value: string;
  label: string;
  /** Only meaningful for 'color' fields — a CSS color for the swatch. Falls back to `value`. */
  swatch?: string;
}

export interface UrlFieldDef {
  /** Must match a `{key}` placeholder in the owning component's urlTemplate. */
  key: string;
  label: string;
  type: UrlFieldType;
  /** Required for 'color' and 'select' types. */
  options?: UrlFieldOption[];
}

/**
 * Stored as a LibraryEntry's `meta` for the generic 'url-component' widget
 * type — this is what makes one component (e.g. "Shields.io badge") a
 * reusable definition instead of a single hardcoded preset. `settings` on
 * the placed instance holds one string value per field.key, plus `link`
 * when linkable.
 */
export interface UrlComponentMeta {
  urlTemplate: string;
  fields: UrlFieldDef[];
  linkable: boolean;
  /** Alt-text template, same {key} substitution as urlTemplate. Defaults to the first field's value. */
  altTemplate?: string;
  [key: string]: unknown;
}

export function fillUrlTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => encodeURIComponent(values[key] ?? ''));
}

/** `{label}`, `{color}`, ... in order of first appearance — used to auto-detect fields from a pasted URL template. */
export function detectTemplateFields(template: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of template.matchAll(/\{(\w+)\}/g)) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      out.push(m[1]);
    }
  }
  return out;
}
