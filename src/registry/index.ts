import type { ComponentTypeDefinition } from '../types/component';
import type { LibraryEntry, PresetDefinition } from '../types/library';

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
import { urlComponentDefinition } from '../components/widgets/urlComponent/definition';
import { CATEGORIES_SEED } from '../data/categories';
import { flattenLibrary } from './presets';

/**
 * One JSON file per community component under src/data/community-components/
 * (filename = the component's own id, e.g. "social-discord.json") — each PR
 * that adds a component only ever touches its own new file, instead of
 * every contributor racing to edit the same shared array (which is exactly
 * how this used to work, as a single community-components.json, before it
 * got split up). `eager: true` inlines every file at build time, same as a
 * normal static import — no runtime fetching.
 */
const communityComponentModules = import.meta.glob<{ default: LibraryEntry }>('../data/community-components/*.json', { eager: true });
const communityComponents: LibraryEntry[] = Object.values(communityComponentModules).map((m) => m.default);

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
  urlComponentDefinition,
];

/**
 * src/data/community-components/ holds "url-component" entries contributed
 * via the app's "GitHub에 PR로 올리기" flow — a PR adds one new file there,
 * and merging it is the ONLY step needed for the new component to go live
 * here. See src/types/urlComponent.ts / src/components/widgets/urlComponent/.
 *
 * This is the "authoring" list — entries here may carry `.presets` (see
 * types/library.ts's PresetDefinition doc comment for when to use one
 * Component-with-presets vs. several separate Components). The Library
 * panel reads THIS list so it can show one card per Component with a
 * preset picker inside. Nothing downstream of `LIBRARY` (below) ever sees
 * `.presets` — it's flattened away first.
 */
export const LIBRARY_COMPONENTS: LibraryEntry[] = [
  ...badgePresets,
  ...techIconPresets,
  ...statsPresets,
  ...socialPresets,
  ...headingPresets,
  ...dividerPresets,
  ...communityComponents,
];

/** Fully flat — one addable LibraryEntry per id, never a `.presets` field.
 *  Everything that resolves/places/persists a component by id reads this. */
export const LIBRARY: LibraryEntry[] = flattenLibrary(LIBRARY_COMPONENTS);

export const COMPONENT_TYPE_MAP = new Map(COMPONENT_TYPES.map((d) => [d.type, d]));
export const LIBRARY_MAP = new Map(LIBRARY.map((e) => [e.id, e]));

/** A flattened preset id (e.g. "lang-cpp") -> the Component it belongs to
 *  and its full sibling preset list. Used only by SettingsPanel to offer a
 *  generic "Preset" selector for an already-placed widget — components
 *  without presets simply have no entry here. */
export interface PresetParent {
  componentId: string;
  componentName: string;
  presets: PresetDefinition[];
}
export const PRESET_PARENT_MAP = new Map<string, PresetParent>();
for (const c of LIBRARY_COMPONENTS) {
  if (c.presets?.length) {
    for (const p of c.presets) {
      PRESET_PARENT_MAP.set(p.id, { componentId: c.id, componentName: c.name, presets: c.presets });
    }
  }
}

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

/** "All" + every category actually used by LIBRARY_COMPONENTS, with the 7
 *  seed categories ordered first (new categories just sort after them —
 *  adding one needs zero edits here). */
const seedOrder = new Map(CATEGORIES_SEED.map((c, i) => [c, i]));
const usedCategories = Array.from(new Set(LIBRARY_COMPONENTS.map((c) => c.category)));
usedCategories.sort((a, b) => (seedOrder.get(a) ?? 999) - (seedOrder.get(b) ?? 999));
export const CATEGORIES = ['All', ...usedCategories] as const;
