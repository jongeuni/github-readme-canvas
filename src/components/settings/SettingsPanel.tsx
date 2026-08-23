import { createElement } from 'react';
import type { UseCanvasEditor } from '../editor/useCanvasEditor';
import { TEXT_LINE_STYLE_OPTIONS, textLineStyle, textLineStyleLabel } from '../editor/useCanvasEditor';
import { getComponentType, PRESET_PARENT_MAP } from '../../registry';
import { Icon } from '../Icon';
import { SelectField, TextField } from './fields';

const TYPE_LABELS: Record<string, string> = {
  badge: 'Badge',
  'tech-icon': 'Tech Icon',
  stats: 'GitHub Stats',
  social: 'Social Link',
  heading: 'Heading / Text',
  divider: 'Divider',
  'url-component': 'Component',
};

/**
 * Right-hand settings column. Two mutually-exclusive selection kinds from
 * useCanvasEditor drive this: a plain text line (selectedTextEl, a raw DOM
 * node — the canvas owns that data, not React state) or a tracked widget
 * (selectedUid, looked up via getSelectedWidget()). Widget forms are never
 * hand-written here — each component type supplies its own SettingsForm via
 * the registry, so adding a new widget kind needs zero changes to this file.
 */
export function SettingsPanel({ editor }: { editor: UseCanvasEditor }) {
  const {
    selectedTextEl,
    selectedUid,
    getSelectedWidget,
    updateSelectedWidgetSettings,
    updateSelectedWidgetPreset,
    removeSelectedWidget,
    setSelectedTextValue,
    setSelectedTextLevel,
  } = editor;

  if (selectedTextEl && selectedTextEl.isConnected) {
    const style = textLineStyle(selectedTextEl);
    return (
      <div className="settings-col">
        <div className="settings-head">
          <div className="settings-eyebrow">Text</div>
          <div className="settings-title">{textLineStyleLabel(style)}</div>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <TextField label="Text" value={selectedTextEl.textContent ?? ''} onChange={setSelectedTextValue} />
          <SelectField label="Style" value={style} onChange={setSelectedTextLevel} options={TEXT_LINE_STYLE_OPTIONS} />
          <div className="hint">
            You can type directly on the canvas, or change it here. Starting a line with #…###### / &gt; / - / 1. also converts it live, and
            **bold**, *italic*, ~~strike~~, `code`, and [link](url) work mid-paragraph.
          </div>
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
  // Generic across every component type — undefined for anything without
  // presets, so this renders nothing extra for them. A new preset-bearing
  // Component gets this dropdown automatically, no change needed here.
  const presetGroup = PRESET_PARENT_MAP.get(widget.libId);
  return (
    <div className="settings-col">
      <div className="settings-head">
        <div className="settings-eyebrow">{TYPE_LABELS[widget.type] ?? widget.type}</div>
        <div className="settings-title">{widget.name}</div>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {presetGroup && (
          <SelectField
            label="Preset"
            value={widget.libId}
            onChange={(id) => {
              const preset = presetGroup.presets.find((p) => p.id === id);
              if (preset) updateSelectedWidgetPreset(preset);
            }}
            options={presetGroup.presets.map((p) => ({ value: p.id, label: p.name }))}
          />
        )}
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
