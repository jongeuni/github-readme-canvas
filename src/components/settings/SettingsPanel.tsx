import { createElement } from 'react';
import type { UseCanvasEditor } from '../editor/useCanvasEditor';
import { getComponentType } from '../../registry';
import type { HeadingLevel } from '../widgets/heading/types';
import { Icon } from '../Icon';
import { SelectField, TextField } from './fields';

const TYPE_LABELS: Record<string, string> = {
  badge: 'Badge',
  'tech-icon': 'Tech Icon',
  stats: 'GitHub Stats',
  social: 'Social Link',
  heading: 'Heading / Text',
  divider: 'Divider',
};

const LEVEL_OPTIONS: { value: HeadingLevel; label: string }[] = [
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'text', label: 'Paragraph' },
];

function textLineLevel(el: HTMLElement): HeadingLevel {
  if (el.classList.contains('md-h1')) return 'h1';
  if (el.classList.contains('md-h2')) return 'h2';
  return 'text';
}

function textLineTitle(level: HeadingLevel): string {
  return level === 'h1' ? 'Heading (H1)' : level === 'h2' ? 'Heading (H2)' : 'Paragraph Text';
}

/**
 * Right-hand settings column. Two mutually-exclusive selection kinds from
 * useCanvasEditor drive this: a plain text line (selectedTextEl, a raw DOM
 * node — the canvas owns that data, not React state) or a tracked widget
 * (selectedUid, looked up via getSelectedWidget()). Widget forms are never
 * hand-written here — each component type supplies its own SettingsForm via
 * the registry, so adding a new widget kind needs zero changes to this file.
 */
export function SettingsPanel({ editor }: { editor: UseCanvasEditor }) {
  const { selectedTextEl, selectedUid, getSelectedWidget, updateSelectedWidgetSettings, removeSelectedWidget, setSelectedTextValue, setSelectedTextLevel } =
    editor;

  if (selectedTextEl && selectedTextEl.isConnected) {
    const level = textLineLevel(selectedTextEl);
    return (
      <div className="settings-col">
        <div className="settings-head">
          <div className="settings-eyebrow">Text</div>
          <div className="settings-title">{textLineTitle(level)}</div>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <TextField label="Text" value={selectedTextEl.textContent ?? ''} onChange={setSelectedTextValue} />
          <SelectField label="Style" value={level} onChange={setSelectedTextLevel} options={LEVEL_OPTIONS} />
          <div className="hint">캔버스에서 직접 타이핑해도 되고, 여기서 바꿔도 됩니다. 줄 앞에 # / ##을 입력해도 실시간으로 바뀝니다.</div>
        </form>
      </div>
    );
  }

  const widget = selectedUid ? getSelectedWidget() : null;
  if (!widget) {
    return (
      <div className="settings-col">
        <div className="settings-empty">
          <Icon name="cursor" />
          <p>
            Select a component on the canvas
            <br />
            to edit its settings.
          </p>
        </div>
      </div>
    );
  }

  const def = getComponentType(widget.type);
  return (
    <div className="settings-col">
      <div className="settings-head">
        <div className="settings-eyebrow">{TYPE_LABELS[widget.type] ?? widget.type}</div>
        <div className="settings-title">{widget.name}</div>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {createElement(def.SettingsForm, { settings: widget.settings, meta: widget.meta, onChange: updateSelectedWidgetSettings })}
      </form>
      <div className="remove-row">
        <button type="button" className="remove-link" onClick={removeSelectedWidget}>
          <Icon name="trash" />
          Remove component
        </button>
      </div>
    </div>
  );
}
