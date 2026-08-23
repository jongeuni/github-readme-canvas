import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../Icon';
import type { SavedDocument } from '../../types/document';

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export function SaveMenu({
  documents,
  activeDocId,
  onQuickSave,
  onOpenSaveAs,
  onLoad,
  onRename,
  onDelete,
}: {
  documents: SavedDocument[];
  activeDocId: string | null;
  onQuickSave: () => void;
  onOpenSaveAs: () => void;
  onLoad: (doc: SavedDocument) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setRenamingId(null);
        setConfirmDeleteId(null);
      }
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setRenamingId(null);
        setConfirmDeleteId(null);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const sorted = [...documents].sort((a, b) => b.savedAt.localeCompare(a.savedAt));

  const startRename = (doc: SavedDocument) => {
    setConfirmDeleteId(null);
    setRenamingId(doc.id);
    setRenameValue(doc.name);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (renamingId && trimmed) onRename(renamingId, trimmed);
    setRenamingId(null);
  };

  const handleRenameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setRenamingId(null);
  };

  return (
    <div className="save-menu" ref={rootRef}>
      <div className="split-btn">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => (activeDocId ? onQuickSave() : onOpenSaveAs())}
        >
          Save
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm split-chevron"
          aria-label="Saved documents"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name="chevron-down" />
        </button>
      </div>

      {open && (
        <div className="save-popover">
          <div className="save-popover-list">
            {sorted.length === 0 && <div className="save-popover-empty">No saved documents yet</div>}
            {sorted.map((doc) => (
              <div key={doc.id} className={`save-row ${doc.id === activeDocId ? 'active' : ''}`}>
                <div className="doc-icon">{doc.name.trim().charAt(0).toUpperCase() || '·'}</div>
                {renamingId === doc.id ? (
                  <input
                    className="save-row-rename"
                    value={renameValue}
                    autoFocus
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={commitRename}
                  />
                ) : (
                  <div
                    className="save-row-meta"
                    onClick={() => {
                      onLoad(doc);
                      setOpen(false);
                    }}
                  >
                    <div className="save-row-name">{doc.name}</div>
                    <div className="save-row-time">{formatRelativeTime(doc.savedAt)}</div>
                  </div>
                )}
                {renamingId !== doc.id && confirmDeleteId === doc.id && (
                  <div className="save-row-confirm">
                    <button type="button" className="confirm-delete" onClick={() => onDelete(doc.id)}>
                      Delete
                    </button>
                    <button type="button" className="confirm-cancel" onClick={() => setConfirmDeleteId(null)}>
                      Cancel
                    </button>
                  </div>
                )}
                {renamingId !== doc.id && confirmDeleteId !== doc.id && (
                  <div className="save-row-actions">
                    <button type="button" className="mini-icon-btn" aria-label="Rename" onClick={() => startRename(doc)}>
                      <Icon name="edit" />
                    </button>
                    <button
                      type="button"
                      className="mini-icon-btn danger"
                      aria-label="Delete"
                      onClick={() => setConfirmDeleteId(doc.id)}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="save-popover-new"
            onClick={() => {
              setOpen(false);
              onOpenSaveAs();
            }}
          >
            <Icon name="plus" />
            Save As
          </button>
        </div>
      )}
    </div>
  );
}
