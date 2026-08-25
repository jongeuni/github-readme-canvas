import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Icon } from '../Icon';

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea
        className="field-textarea"
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

/**
 * Shared form-field building blocks used by every widget's SettingsForm.
 * Keeping these in one place is what lets each widget's own settings form
 * stay a few lines long instead of re-implementing input markup everywhere.
 */

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </div>
  );
}

export function UrlField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="url"
        value={value}
        placeholder="https://..."
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="checkbox-row">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

export type AlignValue = 'left' | 'center' | 'right';

const ALIGN_OPTIONS: { value: AlignValue; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

/** Left/Center/Right control for canvas-layout alignment (a text line, or the
 *  row of inline widgets a selected one is part of). Also settable, for
 *  center only, from the floating Bold/Italic toolbar on a drag-selection —
 *  see Canvas.tsx / useCanvasEditor's toggleSelectionCenterAlign — both
 *  write the same underlying value, so either one stays in sync with this. */
export function AlignField({ label = 'Align', value, onChange }: { label?: string; value: AlignValue; onChange: (value: AlignValue) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="align-row">
        {ALIGN_OPTIONS.map((o) => (
          <button key={o.value} type="button" className={`align-btn ${value === o.value ? 'active' : ''}`} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * A text-search combobox for an option list too long to browse comfortably
 * as a plain <select> — filters by label as you type, click a row to pick
 * it. If `allowCustom` is set and the typed text doesn't match anything, an
 * extra row lets that raw text itself become the value (a curated preset
 * list can't cover everything a user might want — see Tech Icon's own use:
 * any skillicons.dev slug works, not just the ones with a named preset).
 */
export function SearchableSelectField({
  label,
  value,
  displayLabel,
  options,
  onChange,
  placeholder,
  allowCustom = false,
  hint,
}: {
  label: string;
  value: string;
  /** What the closed input shows — falls back to `value` itself if omitted. */
  displayLabel?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const exactMatch = options.some((o) => o.label.toLowerCase() === q || o.value.toLowerCase() === q);

  const pick = (v: string) => {
    onChange(v);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="field combobox-field" ref={rootRef}>
      <label>{label}</label>
      <div className="search-box">
        <Icon name="search" />
        <input
          type="text"
          value={open ? query : (displayLabel ?? value)}
          placeholder={placeholder ?? 'Search…'}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          // Also on click, not just focus — closing the panel (Escape, or
          // picking an option) never blurs the input, so a plain onFocus
          // would only ever fire once and a second click wouldn't reopen it.
          onClick={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {open && (
        <div className="combobox-panel">
          {filtered.map((o) => (
            <div key={o.value} className={`combobox-option ${o.value === value ? 'selected' : ''}`} onMouseDown={() => pick(o.value)}>
              {o.label}
            </div>
          ))}
          {filtered.length === 0 && !allowCustom && <div className="combobox-empty">No matches</div>}
          {allowCustom && q && !exactMatch && (
            <div className="combobox-option combobox-option-custom" onMouseDown={() => pick(q.replace(/\s+/g, ''))}>
              Use "{q}" directly
            </div>
          )}
        </div>
      )}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="text" value={value} readOnly style={{ color: 'var(--text-3)', background: '#fafafa' }} />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}
