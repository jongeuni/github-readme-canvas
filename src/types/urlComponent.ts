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

export interface ParsedUrlField {
  key: string;
  /** The real value the pasted URL had for this query param — used to
   *  pre-fill the field's default value in the "add component" wizard. */
  defaultValue: string;
}

export interface ParsedUrlInput {
  /** Always a valid {key}-style template, whichever branch produced it. */
  template: string;
  fields: ParsedUrlField[];
}

/**
 * Turns whatever the user typed into a real {key}-templated URL, so they
 * don't need to know the `{}` syntax for the common case:
 *
 * - Already has `{key}` placeholders (power users doing path-segment
 *   substitution, e.g. .../badge/{owner}/{repo}) — used as-is, unchanged.
 * - Otherwise, treat it as a plain, already-working example URL and turn
 *   every `?key=value` query param into a `{key}` field automatically,
 *   using the pasted value as that field's default. This covers most
 *   shields.io-style customization (style/logo/color/...) without the user
 *   ever writing a brace. Path segments (like a repo owner/name) still
 *   need manual `{}` — there's no way to tell "octocat" apart from a fixed
 *   path segment without the user marking it somehow.
 */
export function parseUrlInput(input: string): ParsedUrlInput {
  const existing = detectTemplateFields(input);
  if (existing.length > 0) {
    return { template: input, fields: existing.map((key) => ({ key, defaultValue: '' })) };
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { template: input, fields: [] };
  }

  const fields: ParsedUrlField[] = [];
  const seen = new Set<string>();
  url.searchParams.forEach((value, key) => {
    if (seen.has(key)) return; // repeated key — keep only the first occurrence
    seen.add(key);
    fields.push({ key, defaultValue: value });
  });
  if (fields.length === 0) return { template: input, fields: [] };

  // Rebuilt manually (not via URLSearchParams.toString()) so the literal
  // `{key}` braces aren't percent-encoded — fillUrlTemplate needs them raw.
  const query = fields.map((f) => `${f.key}={${f.key}}`).join('&');
  return { template: `${url.origin}${url.pathname}?${query}`, fields };
}
