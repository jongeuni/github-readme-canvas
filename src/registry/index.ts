import type { ComponentTypeDefinition } from '../types/component';
import type { LibraryEntry } from '../types/library';

import { badgeDefinition } from '../components/widgets/badge/definition';
import { badgePresets } from '../components/widgets/badge/presets';
import { techIconDefinition } from '../components/widgets/techIcon/definition';
import { techIconPresets } from '../components/widgets/techIcon/presets';
import { statsDefinition } from '../components/widgets/stats/definition';
import { statsPresets } from '../components/widgets/stats/presets';
import { socialDefinition } from '../components/widgets/social/definition';
import { socialPresets } from '../components/widgets/social/presets';
import { headingDefinition } from '../components/widgets/heading/definition';
import { headingPresets } from '../components/widgets/heading/presets';
import { dividerDefinition } from '../components/widgets/divider/definition';
import { dividerPresets } from '../components/widgets/divider/presets';

/**
 * This is the ONE place that wires a new component type into the whole app.
 * To add a brand-new kind of README component:
 *   1. Create src/components/widgets/<name>/ with types.ts, a Preview, a
 *      SettingsForm, and a definition.ts (see any existing widget folder).
 *   2. Add its definition + presets to the two arrays below.
 * The library list, canvas rendering, settings panel, and markdown export
 * all read from this registry — none of them need to change.
 */
export const COMPONENT_TYPES: ComponentTypeDefinition[] = [
  badgeDefinition,
  techIconDefinition,
  statsDefinition,
  socialDefinition,
  headingDefinition,
  dividerDefinition,
];

export const LIBRARY: LibraryEntry[] = [
  ...badgePresets,
  ...techIconPresets,
  ...statsPresets,
  ...socialPresets,
  ...headingPresets,
  ...dividerPresets,
];

export const COMPONENT_TYPE_MAP = new Map(COMPONENT_TYPES.map((d) => [d.type, d]));
export const LIBRARY_MAP = new Map(LIBRARY.map((e) => [e.id, e]));

export function getComponentType(type: string): ComponentTypeDefinition {
  const def = COMPONENT_TYPE_MAP.get(type);
  if (!def) throw new Error(`Unknown component type "${type}" — is it registered in src/registry/index.ts?`);
  return def;
}

export function getLibraryEntry(id: string): LibraryEntry {
  const entry = LIBRARY_MAP.get(id);
  if (!entry) throw new Error(`Unknown library entry id "${id}"`);
  return entry;
}

export const CATEGORIES = ['All', 'Languages', 'Frameworks', 'Databases', 'Tools', 'Stats', 'Social', 'Decorations'] as const;
