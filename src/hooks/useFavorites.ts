import { useCallback, useState } from 'react';
import { LEGACY_ID_REMAP } from '../data/legacyIdRemap';

const FAVORITES_STORAGE_KEY = 'readmeComponents:favorites';

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const ids: string[] = Array.isArray(arr) ? arr : [];
    return new Set(ids.map((id) => LEGACY_ID_REMAP[id] ?? id));
  } catch {
    return new Set();
  }
}

function saveFavorites(favorites: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites)));
  } catch {
    // Private mode / quota exceeded — favorites just won't persist across reloads.
  }
}

/**
 * Favorites are keyed by library id (e.g. "lang-cpp"), not canvas widget
 * uid — favoriting is about the catalog entry, not a placed instance.
 * Persisted to localStorage so it survives reloads without an account.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites());

  const toggleFavorite = useCallback((libId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(libId)) next.delete(libId);
      else next.add(libId);
      saveFavorites(next);
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
