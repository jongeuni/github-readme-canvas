import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { TEMPLATES } from '../../data/templates';
import type { Template } from '../../types/document';

/**
 * Mirrors SaveMenu's popover pattern (same outside-click/Escape-to-close
 * effect, same .save-popover shell) — a single button here instead of a
 * split-button, since there's no "quick" primary action the way Save has
 * quick-save vs. Save As; picking a template is always "browse and pick".
 */
export function TemplatesMenu({ onUse }: { onUse: (template: Template) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="templates-menu" ref={rootRef}>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen((v) => !v)}>
        <Icon name="layout" />
        Templates
      </button>
      {open && (
        <div className="save-popover templates-popover">
          <div className="save-popover-list">
            {TEMPLATES.map((t) => (
              <div
                key={t.id}
                className="template-row"
                onClick={() => {
                  onUse(t);
                  setOpen(false);
                }}
              >
                <div className="template-row-name">{t.name}</div>
                <div className="template-row-desc">{t.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
