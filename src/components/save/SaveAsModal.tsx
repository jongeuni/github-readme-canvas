import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

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
      setError('이름을 입력해 주세요.');
      return;
    }
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      {open && (
        <div className="modal-card">
          <h4>새 이름으로 저장</h4>
          <div className="field">
            <label>이름</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              placeholder="예: 백엔드 포트폴리오 README"
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
              취소
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={submit}>
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
