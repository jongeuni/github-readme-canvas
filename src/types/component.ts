import type { ComponentType } from 'react';
import type { LibraryEntry } from './library';

/**
 * Data-driven, not a closed union — a Component's category is just whatever
 * string its presets.ts / community-components/*.json entry uses. The 7 seed
 * values in src/data/categories.ts only control chip ORDER in the Library;
 * a brand-new category value works immediately, no file needs editing.
 */
export type ComponentCategory = string;

/** 'inline' widgets (badges, icons, social pills) flow next to each other on one line;
 *  'block' widgets (stats cards, dividers) always occupy their own line. */
export type LayoutMode = 'inline' | 'block';

export interface PreviewProps<TSettings> {
  settings: TSettings;
  meta?: Record<string, unknown>;
}

export interface SettingsFormProps<TSettings> {
  settings: TSettings;
  meta?: Record<string, unknown>;
  /** Merge a partial settings patch into the widget/preset's current settings. */
  onChange: (patch: Partial<TSettings>) => void;
}

/**
 * The single contract every README component TYPE (badge, stats card, social
 * link, heading, divider, ...) implements.
 *
 * To add a brand-new KIND of component: create one directory under
 * src/data/community-components/<name>/ whose component.ts exports a
 * `ComponentModule` (see below) built from one of these. Nothing else in the
 * app needs to change — the library, canvas, settings panel, and markdown
 * export all read from src/registry/index.ts, which discovers this
 * directory automatically.
 *
 * To add a new PRESET of an existing kind (e.g. a new badge color, a new
 * tech icon) — see src/types/library.ts — you only ever add a plain data
 * object to that component's presets.ts, no new component code at all.
 */
export interface ComponentTypeDefinition<TSettings = any> {
  type: string;
  layout: LayoutMode;
  Preview: ComponentType<PreviewProps<TSettings>>;
  SettingsForm: ComponentType<SettingsFormProps<TSettings>>;
  toMarkdown: (settings: TSettings, meta?: Record<string, unknown>) => string;
}

/**
 * What one `src/data/community-components/<name>/component.ts` file must
 * export as `module` — the renderer (`definition`) plus the Library card(s)
 * it backs (`entries`). See that directory's own doc comment for the full
 * contract; this is the type the registry's directory-discovery reads.
 */
export interface ComponentModule<TSettings = any> {
  definition: ComponentTypeDefinition<TSettings>;
  entries: LibraryEntry<TSettings>[];
}
