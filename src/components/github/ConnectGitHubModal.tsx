import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../Icon';
import { useOverlayDismiss } from '../../hooks/useOverlayDismiss';

const NEW_TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=repo&description=GitHub%20Readme%20Canvas';

export function ConnectGitHubModal({
  open,
  connecting,
  error,
  onCancel,
  onConnect,
  onDismissError,
}: {
  open: boolean;
  connecting: boolean;
  error: string | null;
  onCancel: () => void;
  onConnect: (token: string) => void;
  onDismissError: () => void;
}) {
  const [token, setToken] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const overlayDismiss = useOverlayDismiss(onCancel);

  useEffect(() => {
    if (open) {
      setToken('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const submit = () => {
    if (!token.trim() || connecting) return;
    onConnect(token.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') onCancel();
  };

  if (!open) return <div className="modal-overlay" />;

  return (
    <div className="modal-overlay open" {...overlayDismiss}>
      <div className="modal-card">
        <h4>Connect GitHub</h4>
        <div className="field">
          <label>Personal Access Token</label>
          <input
            ref={inputRef}
            type="password"
            value={token}
            placeholder="ghp_..."
            onChange={(e) => {
              setToken(e.target.value);
              if (error) onDismissError();
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <p className="field-hint">
          You need a token issued with <code>repo</code> scope.{' '}
          <a href={NEW_TOKEN_URL} target="_blank" rel="noreferrer">
            Create a new token ↗
          </a>
        </p>
        <p className="field-hint">This is only stored in this browser. It's never sent to a server — it's used only to call the GitHub API directly.</p>
        {error && <div className="field-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={connecting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={submit} disabled={connecting}>
            <Icon name="github" />
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}
