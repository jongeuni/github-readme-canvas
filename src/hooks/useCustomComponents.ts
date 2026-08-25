import { useCallback, useState } from 'react';
import type { LibraryEntry } from '../types/library';
import { LIBRARY_MAP } from '../registry';
import { slugify } from '../lib/slugify';

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

/**
 * Community/custom components — added via the "Add Component" flow, kept
 * local (localStorage) until the user submits them as a PR (see the GitHub
 * PR flow). Ids are namespaced ("custom-" + `desiredId`) so they never
 * collide with the hand-authored presets in the static registry, and so
 * `libId.startsWith('custom-')` keeps working everywhere it's checked
 * (App.tsx, LibraryPanel/ComponentCard's "Submit PR" gating). `desiredId`
 * is the {tag}-{username}-projectname slug AddComponentModal already built
 * and previewed to the user as the eventual filename — SubmitComponentPrModal
 * strips the "custom-" prefix back off to get that exact filename back, so
 * what the user saw in the modal is what ships, no re-deriving.
 */
export function useCustomComponents() {
  const [customComponents, setCustomComponents] = useState<LibraryEntry[]>(() => loadCustomComponents());

  const makeUniqueId = useCallback(
    (desiredId: string) => {
      const base = 'custom-' + slugify(desiredId);
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
    (entry: Omit<LibraryEntry, 'id'>, desiredId: string): LibraryEntry => {
      const id = makeUniqueId(desiredId);
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

  return { customComponents, addCustomComponent };
}
