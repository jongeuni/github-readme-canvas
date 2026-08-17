import type { ComponentCategory } from './component';

/**
 * A single catalog entry shown in the left-hand library — e.g. "C++" (a
 * preset of the 'badge' type) or "GitHub Stats" (a preset of the 'stats'
 * type). Adding a new preset to an existing component type is just adding
 * one of these to that type's presets.ts — no component code needed.
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
