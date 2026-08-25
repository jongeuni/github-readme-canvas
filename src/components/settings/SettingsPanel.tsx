import { createElement } from 'react';
import type { UseCanvasEditor } from '../editor/useCanvasEditor';
import { TEXT_LINE_STYLE_OPTIONS, textLineStyle, textLineStyleLabel } from '../editor/useCanvasEditor';
import { getComponentType, LIBRARY_MAP, PRESET_PARENT_MAP } from '../../registry';
import { Icon } from '../Icon';
import { AlignField, SelectField, TextField } from './fields';
import { kaomojiPresets } from '../../data/community-components/text-art/presets';
import { iconPresets } from '../../data/community-components/tech-icon/presets';
import { generateTocSource } from '../widgets/toc/generateToc';

/** Align is only offered for these text-line styles — Quote/List/Task markdown
 *  prefixes (`>`/`-`/`1.`) don't combine cleanly with an HTML align wrapper,
 *  and centering a bullet list isn't a real use case. See buildFullMarkdown. */
const ALIGNABLE_TEXT_STYLES = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'text', 'kaomoji']);

/** Types with their own bespoke rendering code get a fixed label. Anything
 *  else (every 'url-component' entry — badges, stats, social links, ...)
 *  falls back to that entry's own Library category (e.g. "🧑‍💻 tech",
 *  "🌐 social"), which is more specific than one flat "Component" label ever
 *  was — see the fallback at its use site below. */
const TYPE_LABELS: Record<string, string> = {
  'tech-icon': 'Tech Icon',
  heading: 'Heading / Text',
  divider: 'Divider',
  'code-block': 'Code Block',
  table: 'Table',
  toc: 'Table of Contents (목차)',
  details: 'Collapsible Section',
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
    canvasRef,
    selectedTextEl,
    selectedUid,
    getSelectedWidget,
    updateSelectedWidgetSettings,
    updateSelectedWidgetPreset,
    updateSelectedWidgetAlign,
    removeSelectedWidget,
    removeSelectedTextLine,
    setSelectedTextValue,
    setSelectedTextLevel,
    setSelectedTextAlign,
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
          {style === 'kaomoji' && (
            // Picking a look, not reading a label — same as the Library
            // card's own picker (see text-art/SettingsForm.tsx). Just
            // writes into the line's text directly, same as the Text field
            // above — there's no separate widget settings object here.
            <SelectField
              label="Kaomoji"
              value={selectedTextEl.textContent ?? ''}
              onChange={setSelectedTextValue}
              options={kaomojiPresets.map((p) => ({ value: p.settings!.text!, label: p.settings!.text! }))}
            />
          )}
          {ALIGNABLE_TEXT_STYLES.has(style) && (
            <AlignField value={(selectedTextEl.dataset.align as 'left' | 'center' | 'right') ?? 'left'} onChange={setSelectedTextAlign} />
          )}
          <div className="hint">
            You can type directly on the canvas, or change it here. Starting a line with #…###### / &gt; / - / 1. / - [ ] also converts it
            live, and **bold**, *italic*, ~~strike~~, `code`, and [link](url) work mid-paragraph. A lone ``` line becomes a Code Block, and a
            table header followed by a --- separator row becomes a Table.
          </div>
        </form>
        <div className="remove-row">
          <button type="button" className="remove-link" onClick={removeSelectedTextLine}>
            <Icon name="trash" />
            Remove line
          </button>
        </div>
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
  // text-art and tech-icon are the exceptions: each already renders its own
  // preset picker inline in its own SettingsForm (text-art shows the actual
  // glyphs instead of names; tech-icon is a search+custom-entry combobox,
  // see that file), so this plain name-based dropdown would just be a
  // confusing duplicate for either.
  const presetGroup = widget.type === 'text-art' || widget.type === 'tech-icon' ? undefined : PRESET_PARENT_MAP.get(widget.libId);
  // widget.name is fixed at placement time (whichever preset it started as,
  // e.g. "Plus Dots") — text-art's own Style dropdown and tech-icon's own
  // Icon combobox only ever change `settings`, so a name-based title would
  // go stale the moment the user picks a different look there. Settings-
  // derived instead, stays accurate.
  const title =
    widget.type === 'text-art'
      ? (widget.meta as { family?: string } | undefined)?.family === 'divider'
        ? 'Decorative Line'
        : 'Kaomoji'
      : widget.type === 'tech-icon'
        ? (iconPresets.find((p) => p.settings?.slug === (widget.settings as { slug?: string }).slug)?.name ?? (widget.settings as { slug?: string }).slug ?? 'Tech Icon')
        : widget.name;
  return (
    <div className="settings-col">
      <div className="settings-head">
        <div className="settings-eyebrow">{TYPE_LABELS[widget.type] ?? LIBRARY_MAP.get(widget.libId)?.category ?? widget.type}</div>
        <div className="settings-title">{title}</div>
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
        {widget.type === 'toc' && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: 12 }}
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) updateSelectedWidgetSettings({ source: generateTocSource(canvas) });
            }}
          >
            Regenerate from headings
          </button>
        )}
        {createElement(def.SettingsForm, { settings: widget.settings, meta: widget.meta, onChange: updateSelectedWidgetSettings })}
        <AlignField value={widget.align ?? 'left'} onChange={updateSelectedWidgetAlign} />
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
