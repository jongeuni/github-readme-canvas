import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useOverlayDismiss } from '../../hooks/useOverlayDismiss';

export function SaveAsModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const overlayDismiss = useOverlayDismiss(onCancel);

  useEffect(() => {
    if (open) {
      setName('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name.');
      return;
    }
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} {...overlayDismiss}>
      {open && (
        <div className="modal-card">
          <h4>Save As</h4>
          <div className="field">
            <label>Name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              placeholder="e.g. Backend Portfolio README"
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          {error && <div className="field-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={submit}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
