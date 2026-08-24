import type { ComponentModule, ComponentTypeDefinition } from '../types/component';
import type { LibraryEntry, PresetDefinition } from '../types/library';

import { urlComponentDefinition } from '../components/widgets/urlComponent/definition';
import { headingDefinition } from '../components/widgets/heading/definition';
import { headingPresets } from '../components/widgets/heading/presets';
import { dividerDefinition } from '../components/widgets/divider/definition';
import { dividerPresets } from '../components/widgets/divider/presets';
import { codeBlockDefinition } from '../components/widgets/codeBlock/definition';
import { codeBlockPresets } from '../components/widgets/codeBlock/presets';
import { tableDefinition } from '../components/widgets/table/definition';
import { tablePresets } from '../components/widgets/table/presets';
import { CATEGORIES_SEED } from '../data/categories';
import { flattenLibrary } from './presets';

/**
 * src/data/community-components/ is where every PLUGGABLE library component
 * lives — badges, cards, links that pull from an external URL/service, the
 * kind a community contributor would reasonably submit a variant of. No
 * other file needs to change when one is added, edited, or removed:
 *
 *   - A no-code component is one JSON file (filename = its own id, e.g.
 *     "social-discord.json") — each PR that adds one only ever touches its
 *     own new file, instead of every contributor racing to edit a shared
 *     array. It's a "url-component" entry (see src/types/urlComponent.ts):
 *     just a urlTemplate + a field schema, rendered generically.
 *   - A component that needs real code (its rendering can't be expressed as
 *     "fill a URL template") is a directory (e.g. "badge/") whose
 *     component.ts exports `module: ComponentModule` — its renderer
 *     (Preview/SettingsForm/toMarkdown) plus the Library card(s) it backs.
 *     Everything it needs lives inside that same directory.
 *
 * Both are discovered by `import.meta.glob` below (`eager: true` inlines
 * every file at build time, same as a normal static import — no runtime
 * fetching), so adding either kind is purely additive: create the file or
 * directory and it's live, nothing here needs editing.
 *
 * heading/divider/codeBlock/table are NOT here — they're core editor
 * primitives (they emit raw markdown directly, e.g. `# text` or `---`),
 * not services a community would contribute variants of, so they stay
 * hand-wired below like url-component itself.
 */
const jsonModules = import.meta.glob<{ default: LibraryEntry }>('../data/community-components/*.json', { eager: true });
const dirModules = import.meta.glob<{ module: ComponentModule }>('../data/community-components/*/component.ts', { eager: true });

const jsonComponents: LibraryEntry[] = Object.values(jsonModules).map((m) => m.default);
const componentModules: ComponentModule[] = Object.values(dirModules).map((m) => m.module);

export const COMPONENT_TYPES: ComponentTypeDefinition[] = [
  urlComponentDefinition,
  headingDefinition,
  dividerDefinition,
  codeBlockDefinition,
  tableDefinition,
  ...componentModules.map((m) => m.definition),
];

/**
 * This is the "authoring" list — entries here may carry `.presets` (see
 * types/library.ts's PresetDefinition doc comment for when to use one
 * Component-with-presets vs. several separate Components). The Library
 * panel reads THIS list so it can show one card per Component with a
 * preset picker inside. Nothing downstream of `LIBRARY` (below) ever sees
 * `.presets` — it's flattened away first.
 */
export const LIBRARY_COMPONENTS: LibraryEntry[] = [
  ...headingPresets,
  ...dividerPresets,
  ...codeBlockPresets,
  ...tablePresets,
  ...componentModules.flatMap((m) => m.entries),
  ...jsonComponents,
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
