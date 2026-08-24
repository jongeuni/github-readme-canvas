import type { ChangeEvent } from 'react';

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

export function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="text" value={value} readOnly style={{ color: 'var(--text-3)', background: '#fafafa' }} />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}
