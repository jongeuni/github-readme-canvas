import type { ComponentType } from 'react';

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
 * To add a brand-new KIND of component: create one folder under
 * src/components/widgets/<name>/ exporting one of these, then add it to the
 * list in src/registry/componentTypes.ts. Nothing else in the app needs to
 * change — the library, canvas, settings panel, and markdown export all work
 * off this registry.
 *
 * To add a new PRESET of an existing kind (e.g. a new badge color, a new
 * tech icon) — see src/types/library.ts — you only ever add a plain data
 * object, no component code at all.
 */
export interface ComponentTypeDefinition<TSettings = any> {
  type: string;
  layout: LayoutMode;
  Preview: ComponentType<PreviewProps<TSettings>>;
  SettingsForm: ComponentType<SettingsFormProps<TSettings>>;
  toMarkdown: (settings: TSettings, meta?: Record<string, unknown>) => string;
}
