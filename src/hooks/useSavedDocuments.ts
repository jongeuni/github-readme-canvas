import { useCallback, useState } from 'react';
import type { SavedDocument, SerializedBlock } from '../types/document';

const STORAGE_KEY = 'readmeCanvas:documents';

function loadDocuments(): SavedDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistDocuments(docs: SavedDocument[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // Private mode / quota exceeded — saves just won't persist across reloads.
  }
}

function nextId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : 'doc' + Date.now() + Math.random().toString(16).slice(2);
}

/**
 * Named README drafts, persisted to localStorage — no account, no server.
 * Each draft is a snapshot of canvas blocks (see useCanvasEditor's
 * serializeCanvas / loadFromBlocks), keyed by its own id so the editor can
 * hold many drafts side by side (e.g. one README per project).
 */
export function useSavedDocuments() {
  const [documents, setDocuments] = useState<SavedDocument[]>(() => loadDocuments());

  const saveAs = useCallback((name: string, blocks: SerializedBlock[]): SavedDocument => {
    const doc: SavedDocument = { id: nextId(), name, savedAt: new Date().toISOString(), blocks };
    setDocuments((prev) => {
      const next = [doc, ...prev];
      persistDocuments(next);
      return next;
    });
    return doc;
  }, []);

  const overwrite = useCallback((id: string, blocks: SerializedBlock[]) => {
    setDocuments((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, blocks, savedAt: new Date().toISOString() } : d));
      persistDocuments(next);
      return next;
    });
  }, []);

  const rename = useCallback((id: string, name: string) => {
    setDocuments((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, name } : d));
      persistDocuments(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setDocuments((prev) => {
      const next = prev.filter((d) => d.id !== id);
      persistDocuments(next);
      return next;
    });
  }, []);

  return { documents, saveAs, overwrite, rename, remove };
}
