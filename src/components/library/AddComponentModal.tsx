import { useMemo, useState } from 'react';
import { CATEGORIES } from '../../registry';
import type { ComponentCategory } from '../../types/component';
import type { LibraryEntry } from '../../types/library';
import type { UrlFieldDef, UrlFieldOption, UrlFieldType } from '../../types/urlComponent';
import { fillUrlTemplate, parseUrlInput } from '../../types/urlComponent';

interface FieldDraft {
  key: string;
  label: string;
  type: UrlFieldType;
  defaultValue: string;
  options: UrlFieldOption[];
}

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c !== 'All') as ComponentCategory[];

function defaultFieldDraft(key: string, defaultValue = ''): FieldDraft {
  return { key, label: key.charAt(0).toUpperCase() + key.slice(1), type: 'text', defaultValue, options: [] };
}

function fieldPreviewValue(f: FieldDraft): string {
  return f.type === 'text' ? f.defaultValue || f.label : (f.options.find((o) => o.value.trim())?.value ?? '');
}

export function AddComponentModal({
  open,
  onCancel,
  onCreate,
}: {
  open: boolean;
  onCancel: () => void;
  onCreate: (entry: Omit<LibraryEntry, 'id'>) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ComponentCategory>(CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [urlTemplate, setUrlTemplate] = useState('');
  const [fields, setFields] = useState<FieldDraft[]>([]);
  const [linkable, setLinkable] = useState(true);
  const [linkDefault, setLinkDefault] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Lets people paste a plain, already-working URL (no {} needed) — query
  // params like ?style=flat&color=blue are auto-detected as fields. Typing
  // {key} manually still works too, for path segments (.../badge/{owner}).
  const parsed = useMemo(() => parseUrlInput(urlTemplate), [urlTemplate]);

  const reset = () => {
    setStep(1);
    setName('');
    setCategory(CATEGORY_OPTIONS[0]);
    setDescription('');
    setUrlTemplate('');
    setFields([]);
    setLinkable(true);
    setLinkDefault('');
    setError(null);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const goToStep2 = () => {
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    if (parsed.fields.length === 0) {
      setError('No values change here. Add a query param like ?style=flat and it becomes a field automatically, or wrap a path segment directly in {fieldName}.');
      return;
    }
    setFields(parsed.fields.map((f) => defaultFieldDraft(f.key, f.defaultValue)));
    setError(null);
    setStep(2);
  };

  const updateField = (index: number, patch: Partial<FieldDraft>) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };
  const addOption = (index: number) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, options: [...f.options, { value: '', label: '', swatch: '#2563eb' }] } : f)),
    );
  };
  const updateOption = (fieldIndex: number, optIndex: number, patch: Partial<UrlFieldOption>) => {
    setFields((prev) =>
      prev.map((f, i) =>
        i === fieldIndex ? { ...f, options: f.options.map((o, j) => (j === optIndex ? { ...o, ...patch } : o)) } : f,
      ),
    );
  };
  const removeOption = (fieldIndex: number, optIndex: number) => {
    setFields((prev) => prev.map((f, i) => (i === fieldIndex ? { ...f, options: f.options.filter((_, j) => j !== optIndex) } : f)));
  };

  const previewUrl = useMemo(() => {
    if (!parsed.template || fields.length === 0) return '';
    const values: Record<string, string> = {};
    fields.forEach((f) => {
      values[f.key] = fieldPreviewValue(f);
    });
    return fillUrlTemplate(parsed.template, values);
  }, [parsed.template, fields]);

  const submit = () => {
    for (const f of fields) {
      if (!f.label.trim()) {
        setError(`Please enter a display name for "${f.key}".`);
        return;
      }
      if ((f.type === 'select' || f.type === 'color') && f.options.filter((o) => o.value.trim() && o.label.trim()).length === 0) {
        setError(`Please add at least one option for "${f.label}".`);
        return;
      }
    }
    const defaultSettings: Record<string, string> = {};
    fields.forEach((f) => {
      defaultSettings[f.key] = fieldPreviewValue(f);
    });
    if (linkable) defaultSettings.link = linkDefault;

    const fieldDefs: UrlFieldDef[] = fields.map((f) => ({
      key: f.key,
      label: f.label.trim(),
      type: f.type,
      options: f.type === 'text' ? undefined : f.options.filter((o) => o.value.trim() && o.label.trim()),
    }));

    onCreate({
      type: 'url-component',
      name: name.trim(),
      description: description.trim() || name.trim(),
      category,
      tags: [category],
      defaultSettings,
      meta: { urlTemplate: parsed.template, linkable, fields: fieldDefs },
    });
    reset();
  };

  if (!open) return <div className="modal-overlay" />;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
      <div className="modal-card wide">
        {step === 1 ? (
          <>
            <div className="modal-head-row">
              <h4>Add Component</h4>
              <a
                className="add-on-github-link"
                href="https://github.com/jongeuni/github-readme-canvas/issues/1"
                target="_blank"
                rel="noreferrer"
              >
                Add directly on GitHub →
              </a>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Name</label>
                <input type="text" value={name} placeholder="e.g. Shields.io badge" onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as ComponentCategory)}>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <input
                type="text"
                value={description}
                placeholder="A custom badge with your own label and color"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="field">
              <label>URL</label>
              <input
                type="text"
                className="mono"
                value={urlTemplate}
                placeholder="https://img.shields.io/badge/mylabel-blue?style=flat"
                onChange={(e) => setUrlTemplate(e.target.value)}
              />
              <p className="field-hint">
                Paste a real, already-working example URL — values after the question mark like <code>?style=flat</code> automatically
                become fields. If a value in the middle of the path (e.g. a repo name) needs to change, wrap just that part in{' '}
                <code>{'{fieldName}'}</code>.
              </p>
            </div>
            {parsed.fields.length > 0 && (
              <div className="detect-row">
                <span className="detect-label">Detected fields</span>
                {parsed.fields.map((f) => (
                  <span className="field-chip" key={f.key}>
                    {f.key}
                  </span>
                ))}
              </div>
            )}
            {error && <div className="field-error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={goToStep2}>
                Next: Configure Fields →
              </button>
            </div>
          </>
        ) : (
          <>
            <h4>Configure Fields</h4>
            <div className="preview-row">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ maxHeight: 28 }} />
              ) : (
                <span className="preview-caption">Fill in the field values to see a preview here</span>
              )}
              <span className="preview-caption">Preview · based on default values</span>
            </div>

            {fields.map((f, i) => (
              <div className="field-config" key={f.key}>
                <div className="fc-head">
                  <span className="fc-key">{`{${f.key}}`}</span>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Display name</label>
                    <input type="text" value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} />
                  </div>
                  {f.type === 'text' && (
                    <div className="field">
                      <label>Default value</label>
                      <input type="text" value={f.defaultValue} onChange={(e) => updateField(i, { defaultValue: e.target.value })} />
                    </div>
                  )}
                </div>
                <div className="input-type-row">
                  {(['text', 'color', 'select'] as UrlFieldType[]).map((t) => (
                    <span
                      key={t}
                      className={`type-chip ${f.type === t ? 'selected' : ''}`}
                      onClick={() => updateField(i, { type: t, options: t === 'text' ? [] : f.options })}
                    >
                      {t === 'text' ? 'Text input' : t === 'color' ? 'Color picker' : 'Dropdown'}
                    </span>
                  ))}
                </div>
                {(f.type === 'color' || f.type === 'select') && (
                  <div className="option-list">
                    {f.options.map((o, j) => (
                      <div className="option-row" key={j}>
                        <input
                          type="text"
                          placeholder="Value (goes into the URL)"
                          value={o.value}
                          onChange={(e) => updateOption(i, j, { value: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Display name"
                          value={o.label}
                          onChange={(e) => updateOption(i, j, { label: e.target.value })}
                        />
                        {f.type === 'color' && (
                          <input type="color" value={o.swatch ?? '#2563eb'} onChange={(e) => updateOption(i, j, { swatch: e.target.value })} />
                        )}
                        <button type="button" className="mini-icon-btn danger" onClick={() => removeOption(i, j)} aria-label="Remove option">
                          ×
                        </button>
                      </div>
                    ))}
                    <span className="add-link" style={{ fontSize: 11 }} onClick={() => addOption(i)}>
                      + Add option
                    </span>
                  </div>
                )}
              </div>
            ))}

            <div className="toggle-row" onClick={() => setLinkable((v) => !v)}>
              <div className={`toggle-switch ${linkable ? 'on' : ''}`}>
                <div className="knob" />
              </div>
              <span>Also add a link field to navigate to on click</span>
            </div>
            {linkable && (
              <div className="field">
                <label>Default link (optional)</label>
                <input type="url" value={linkDefault} placeholder="https://..." onChange={(e) => setLinkDefault(e.target.value)} />
              </div>
            )}

            {error && <div className="field-error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={submit}>
                Add
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
