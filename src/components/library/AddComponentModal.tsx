import { useMemo, useState } from 'react';
import { CATEGORIES } from '../../registry';
import type { ComponentCategory } from '../../types/component';
import type { LibraryEntry } from '../../types/library';
import type { UrlFieldDef, UrlFieldOption, UrlFieldType } from '../../types/urlComponent';
import { detectTemplateFields, fillUrlTemplate } from '../../types/urlComponent';

interface FieldDraft {
  key: string;
  label: string;
  type: UrlFieldType;
  defaultValue: string;
  options: UrlFieldOption[];
}

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c !== 'All') as ComponentCategory[];

function defaultFieldDraft(key: string): FieldDraft {
  return { key, label: key.charAt(0).toUpperCase() + key.slice(1), type: 'text', defaultValue: '', options: [] };
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

  const detected = useMemo(() => detectTemplateFields(urlTemplate), [urlTemplate]);

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
      setError('이름을 입력해 주세요.');
      return;
    }
    if (detected.length === 0) {
      setError('URL 템플릿에 {필드}가 최소 1개 있어야 해요.');
      return;
    }
    setFields(detected.map(defaultFieldDraft));
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
    if (!urlTemplate || fields.length === 0) return '';
    const values: Record<string, string> = {};
    fields.forEach((f) => {
      values[f.key] = fieldPreviewValue(f);
    });
    return fillUrlTemplate(urlTemplate, values);
  }, [urlTemplate, fields]);

  const submit = () => {
    for (const f of fields) {
      if (!f.label.trim()) {
        setError(`"${f.key}" 필드에 표시 이름을 입력해 주세요.`);
        return;
      }
      if ((f.type === 'select' || f.type === 'color') && f.options.filter((o) => o.value.trim() && o.label.trim()).length === 0) {
        setError(`"${f.label}" 필드에 옵션을 최소 1개 추가해 주세요.`);
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
      meta: { urlTemplate, linkable, fields: fieldDefs },
    });
    reset();
  };

  if (!open) return <div className="modal-overlay" />;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
      <div className="modal-card wide">
        {step === 1 ? (
          <>
            <h4>컴포넌트 추가하기</h4>
            <div className="field-row">
              <div className="field">
                <label>이름</label>
                <input type="text" value={name} placeholder="예: Shields.io 뱃지" onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>카테고리</label>
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
              <label>설명</label>
              <input
                type="text"
                value={description}
                placeholder="라벨과 색상을 골라 만드는 커스텀 뱃지"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="field">
              <label>URL 템플릿</label>
              <input
                type="text"
                className="mono"
                value={urlTemplate}
                placeholder="https://img.shields.io/badge/{label}-{color}?style={style}"
                onChange={(e) => setUrlTemplate(e.target.value)}
              />
              <p className="field-hint">{'{중괄호}로 감싼 부분이 그대로 설정 화면의 필드가 돼요'}</p>
            </div>
            {detected.length > 0 && (
              <div className="detect-row">
                <span className="detect-label">감지된 필드</span>
                {detected.map((k) => (
                  <span className="field-chip" key={k}>
                    {k}
                  </span>
                ))}
              </div>
            )}
            {error && <div className="field-error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancel}>
                취소
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={goToStep2}>
                다음: 필드 설정 →
              </button>
            </div>
          </>
        ) : (
          <>
            <h4>필드 설정</h4>
            <div className="preview-row">
              {previewUrl ? <img src={previewUrl} alt="미리보기" style={{ maxHeight: 28 }} /> : <span className="preview-caption">필드 값을 채우면 여기에 미리보기가 떠요</span>}
              <span className="preview-caption">미리보기 · 기본값 기준</span>
            </div>

            {fields.map((f, i) => (
              <div className="field-config" key={f.key}>
                <div className="fc-head">
                  <span className="fc-key">{`{${f.key}}`}</span>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>화면에 보일 이름</label>
                    <input type="text" value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} />
                  </div>
                  {f.type === 'text' && (
                    <div className="field">
                      <label>기본값</label>
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
                      {t === 'text' ? '텍스트 입력' : t === 'color' ? '색상 선택' : '드롭다운'}
                    </span>
                  ))}
                </div>
                {(f.type === 'color' || f.type === 'select') && (
                  <div className="option-list">
                    {f.options.map((o, j) => (
                      <div className="option-row" key={j}>
                        <input
                          type="text"
                          placeholder="값 (URL에 들어갈 값)"
                          value={o.value}
                          onChange={(e) => updateOption(i, j, { value: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="표시 이름"
                          value={o.label}
                          onChange={(e) => updateOption(i, j, { label: e.target.value })}
                        />
                        {f.type === 'color' && (
                          <input type="color" value={o.swatch ?? '#2563eb'} onChange={(e) => updateOption(i, j, { swatch: e.target.value })} />
                        )}
                        <button type="button" className="mini-icon-btn danger" onClick={() => removeOption(i, j)} aria-label="옵션 삭제">
                          ×
                        </button>
                      </div>
                    ))}
                    <span className="add-link" style={{ fontSize: 11 }} onClick={() => addOption(i)}>
                      + 옵션 추가
                    </span>
                  </div>
                )}
              </div>
            ))}

            <div className="toggle-row" onClick={() => setLinkable((v) => !v)}>
              <div className={`toggle-switch ${linkable ? 'on' : ''}`}>
                <div className="knob" />
              </div>
              <span>클릭하면 이동할 링크 필드도 추가</span>
            </div>
            {linkable && (
              <div className="field">
                <label>기본 링크 (선택)</label>
                <input type="url" value={linkDefault} placeholder="https://..." onChange={(e) => setLinkDefault(e.target.value)} />
              </div>
            )}

            {error && <div className="field-error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                ← 이전
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={submit}>
                추가하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
