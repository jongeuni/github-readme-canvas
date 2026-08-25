import type { LibraryEntry } from '../types/library';

/**
 * Turns the "authoring" list (some entries carry `.presets`) into the fully
 * flat list every other piece of the app already understands — one
 * LibraryEntry per addable id, no `.presets` field on the output. This is
 * the generalized version of the old PER_LANGUAGE_BADGE_IDS special-case:
 * LIBRARY_MAP / getLibraryEntry / mkInstanceFromEntry / WidgetInstance.libId
 * / favorites-by-id / loadFromBlocks all keep working unchanged because
 * they only ever see this flat shape.
 */
export function flattenLibrary(components: LibraryEntry[]): LibraryEntry[] {
  return components.flatMap((c) => {
    if (!c.presets?.length) return [c];
    return c.presets.map((p) => ({
      id: p.id,
      type: c.type,
      name: p.name,
      description: p.description ?? c.description,
      category: c.category,
      tags: c.tags,
      defaultSettings: { ...c.defaultSettings, ...p.settings },
      meta: p.meta ? { ...c.meta, ...p.meta } : c.meta,
      defaultAlign: c.defaultAlign,
      status: c.status,
      statusReason: c.statusReason,
      author: c.author,
      projectUrl: c.projectUrl,
    }));
  });
}
