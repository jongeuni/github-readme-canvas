import { useCallback, useState } from 'react';
import type { LibraryEntry } from '../types/library';
import { LIBRARY_MAP } from '../registry';

const STORAGE_KEY = 'readmeCanvas:customComponents';

function loadCustomComponents(): LibraryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistCustomComponents(entries: LibraryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Private mode / quota exceeded — the component just won't persist across reloads.
  }
}

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || 'component';
}

/**
 * Community/custom components — added via the "Add Component" flow, kept
 * local (localStorage) until the user submits them as a PR (see the GitHub
 * PR flow). Ids are namespaced ("custom-...") so they never collide with the
 * hand-authored presets in the static registry.
 */
export function useCustomComponents() {
  const [customComponents, setCustomComponents] = useState<LibraryEntry[]>(() => loadCustomComponents());

  const makeUniqueId = useCallback(
    (name: string) => {
      const base = 'custom-' + slugify(name);
      let id = base;
      let n = 2;
      const taken = (candidate: string) => LIBRARY_MAP.has(candidate) || customComponents.some((c) => c.id === candidate);
      while (taken(id)) {
        id = `${base}-${n}`;
        n += 1;
      }
      return id;
    },
    [customComponents],
  );

  const addCustomComponent = useCallback(
    (entry: Omit<LibraryEntry, 'id'>): LibraryEntry => {
      const id = makeUniqueId(entry.name);
      const full: LibraryEntry = { ...entry, id };
      setCustomComponents((prev) => {
        const next = [...prev, full];
        persistCustomComponents(next);
        return next;
      });
      return full;
    },
    [makeUniqueId],
  );

  const removeCustomComponent = useCallback((id: string) => {
    setCustomComponents((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persistCustomComponents(next);
      return next;
    });
  }, []);

  return { customComponents, addCustomComponent, removeCustomComponent };
}
