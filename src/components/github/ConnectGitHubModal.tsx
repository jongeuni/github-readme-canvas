import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../Icon';

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
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card">
        <h4>GitHub 연결</h4>
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
          <code>repo</code> 권한으로 발급한 토큰이 필요해요.{' '}
          <a href={NEW_TOKEN_URL} target="_blank" rel="noreferrer">
            새 토큰 만들기 ↗
          </a>
        </p>
        <p className="field-hint">이 브라우저에만 저장돼요. 서버로 전송되지 않고, GitHub API를 직접 호출하는 데만 쓰여요.</p>
        {error && <div className="field-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={connecting}>
            취소
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={submit} disabled={connecting}>
            <Icon name="github" />
            {connecting ? '연결 중...' : '연결하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
