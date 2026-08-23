import type { ComponentCategory } from './component';

/**
 * A named variant of a Component that differs ONLY in data/default values —
 * same Settings UI, same Preview rendering, same toMarkdown logic as its
 * parent. If a new item would need different Settings structure, different
 * Preview rendering, different toMarkdown, or serves a different user intent
 * than the parent, it must NOT be shoehorned in here — make it a new
 * top-level LibraryEntry (Component) instead, even if it "looks similar".
 * e.g. C++/Java/Python badges → presets of one "Language Badge" Component
 * (identical badge rendering+settings, only label/color/link differ).
 * "GitHub Star Badge" is NOT a preset of anything — different settings
 * (repo owner/name) and different purpose — it's its own Component.
 */
export interface PresetDefinition<TSettings = any> {
  /** Becomes the flattened LibraryEntry's id (see registry/presets.ts) —
   *  stable, never changes once shipped, same rules as LibraryEntry.id. */
  id: string;
  name: string;
  /** Falls back to the parent Component's description when omitted. */
  description?: string;
  /** Merged over the parent Component's defaultSettings. */
  settings?: Partial<TSettings>;
  /** Merged over the parent Component's meta. */
  meta?: Record<string, unknown>;
}

/**
 * A single catalog entry shown in the left-hand library — e.g. "Language
 * Badge" (a preset-bearing entry of the 'badge' type) or "GitHub Stats" (a
 * preset-less entry of the 'stats' type). Adding a new preset to an existing
 * Component is just adding one to that Component's `presets` array in the
 * owning type's presets.ts — no component code needed.
 */
export interface LibraryEntry<TSettings = any> {
  /** Stable id — used as the React key, canvas widget origin, and the
   *  localStorage favorites key. Never change once shipped. */
  id: string;
  type: string;
  name: string;
  description: string;
  category: ComponentCategory;
  tags: string[];
  defaultSettings: TSettings;
  /** Optional static metadata (icon glyph/color, tile color, ...) that isn't user-editable. */
  meta?: Record<string, unknown>;
  /** See PresetDefinition's doc comment for the Component-vs-Preset rule
   *  before adding to this. Present = Library shows ONE card + a preset
   *  picker; absent/empty = today's single-card behavior, unchanged. Only
   *  ever set on the pre-flatten entries in a widget's presets.ts / on
   *  community-components/*.json entries — never present on a flattened
   *  LIBRARY entry (see registry/presets.ts). */
  presets?: PresetDefinition<TSettings>[];
  /** Noun used in the Library card's auto-generated summary line when this
   *  entry has presets, e.g. "languages" → "6 languages · C++ · Java · ...".
   *  Defaults to "presets" when omitted. */
  presetsLabel?: string;
}

/** A live instance of a component placed on the canvas. */
export interface WidgetInstance<TSettings = any> {
  uid: string;
  libId: string;
  type: string;
  name: string;
  settings: TSettings;
  meta?: Record<string, unknown>;
}
