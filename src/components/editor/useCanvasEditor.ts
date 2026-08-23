import { createElement, useCallback, useEffect, useReducer, useRef, useState, type KeyboardEvent, type ClipboardEvent, type MouseEvent, type DragEvent, type FormEvent } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { COMPONENT_TYPES, LIBRARY, getComponentType, getLibraryEntry } from '../../registry';
import type { HeadingLevel } from '../widgets/heading/types';
import type { LibraryEntry, PresetDefinition, WidgetInstance } from '../../types/library';
import type { SerializedBlock, SerializedTextBlock } from '../../types/document';

/**
 * ============================================================================
 * The canvas is a single free-text contentEditable surface, not a React-owned
 * tree. Two kinds of things live inside it:
 *
 *  - plain text lines (headings / paragraphs) — pure DOM, typed directly,
 *    never represented in React state. The DOM *is* the data.
 *  - "widgets" (badge / tech-icon / stats / social / divider) — atomic,
 *    contentEditable=false islands. Each one gets its OWN React root
 *    (react-dom/client createRoot) mounted imperatively onto a plain DOM
 *    node we create and insert by hand. That root re-renders on settings
 *    change; the outer canvas div itself is never re-rendered by React.
 *
 * WHY: React's virtual-DOM diffing and a live contentEditable region fight
 * each other — if React ever re-renders #canvas-paper's children after
 * mount, it will stomp on whatever the user is mid-typing. So after the
 * initial mount, nothing here is allowed to hand JSX children to the canvas
 * div. Every update is a targeted, imperative DOM mutation (update one
 * widget's React root, append one new line, move one node for drag-and-drop,
 * remove one node). This mirrors the vanilla-JS prototype this was ported
 * from — same constraint, same reasons — see comments below at each step.
 * ============================================================================
 */

interface WidgetRecord {
  instance: WidgetInstance;
  el: HTMLDivElement;
  root: Root;
}

let uidCounter = 1;
const nextUid = () => 'c' + uidCounter++;

/** A whole line that is exactly `![alt](url)`, optionally link-wrapped as
 *  `[![alt](url)](link)` — the two shapes toMarkdown produces for images.
 *  Matched against a line's full trimmed text, same live-conversion idea as
 *  the "# " -> heading rule below. */
const IMAGE_LINE_RE = /^!\[([^\]]*)\]\((\S+)\)$/;
const LINKED_IMAGE_LINE_RE = /^\[!\[([^\]]*)\]\((\S+)\)\]\((\S+)\)$/;

function mkInstanceFromEntry(lib: LibraryEntry, overrides?: Record<string, unknown>): WidgetInstance {
  return {
    uid: nextUid(),
    libId: lib.id,
    type: lib.type,
    name: lib.name,
    settings: { ...(lib.defaultSettings as object), ...(overrides ?? {}) },
    meta: lib.meta,
  };
}

function mkInstance(libId: string, overrides?: Record<string, unknown>): WidgetInstance {
  return mkInstanceFromEntry(getLibraryEntry(libId), overrides);
}

function isEmptyText(n: ChildNode | null): boolean {
  return !!n && n.nodeType === Node.TEXT_NODE && n.textContent === '';
}

/** Shift+Enter inserts a soft <br> that .textContent silently drops — walk
 *  child nodes so a <br> becomes a real line boundary in the markdown output. */
function textWithSoftBreaks(el: Element): string {
  let out = '';
  el.childNodes.forEach((node) => {
    if (node.nodeName === 'BR') out += '\n';
    else out += node.textContent ?? '';
  });
  return out;
}

export function useCanvasEditor() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const widgetsRef = useRef<Map<string, WidgetRecord>>(new Map());
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [selectedTextEl, setSelectedTextEl] = useState<HTMLElement | null>(null);
  // Widget settings live outside React state (in widgetsRef) for the reasons
  // above; this counter is bumped whenever they change so components that
  // *read* the current selection (SettingsPanel) re-render with fresh data.
  const [, bump] = useReducer((n: number) => n + 1, 0);

  // ---------- rendering a widget's own React root ----------
  const renderWidgetRoot = useCallback((record: WidgetRecord) => {
    const def = getComponentType(record.instance.type);
    record.root.render(createElement(def.Preview, { settings: record.instance.settings, meta: record.instance.meta }));
  }, []);

  const widgetHTMLContainer = useCallback((instance: WidgetInstance): HTMLDivElement => {
    const def = getComponentType(instance.type);
    const div = document.createElement('div');
    div.className = 'block';
    div.dataset.uid = instance.uid;
    div.contentEditable = 'false';
    div.draggable = true;
    if (def.layout === 'inline') div.style.display = 'inline-flex';
    return div;
  }, []);

  // ---------- appending blocks — shared by the initial seed content and by
  // loading a saved document (see loadFromBlocks below) ----------
  const appendTextLine = useCallback((className: string, html: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const div = document.createElement('div');
    div.className = className;
    div.innerHTML = html;
    canvas.appendChild(div);
  }, []);

  const appendWidgetInstance = useCallback(
    (instance: WidgetInstance) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const el = widgetHTMLContainer(instance);
      canvas.appendChild(el);
      const root = createRoot(el);
      const record: WidgetRecord = { instance, el, root };
      widgetsRef.current.set(instance.uid, record);
      renderWidgetRoot(record);
    },
    [widgetHTMLContainer, renderWidgetRoot],
  );

  // ---------- selection ----------
  const clearSelectionVisuals = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.querySelector('.block.selected')?.classList.remove('selected');
    canvas.querySelector('.text-selected')?.classList.remove('text-selected');
  }, []);

  const selectWidget = useCallback(
    (uid: string) => {
      clearSelectionVisuals();
      setSelectedTextEl(null);
      setSelectedUid(uid);
      widgetsRef.current.get(uid)?.el.classList.add('selected');
    },
    [clearSelectionVisuals],
  );

  const selectTextBlock = useCallback(
    (el: HTMLElement) => {
      clearSelectionVisuals();
      setSelectedUid(null);
      setSelectedTextEl(el);
      el.classList.add('text-selected');
    },
    [clearSelectionVisuals],
  );

  const clearSelection = useCallback(() => {
    clearSelectionVisuals();
    setSelectedUid(null);
    setSelectedTextEl(null);
  }, [clearSelectionVisuals]);

  // ---------- widgets are contentEditable=false; if one ends up as the very
  // last node there's no editable spot after it (clicking below has nowhere
  // to land) — always keep one trailing empty editable line. ----------
  const ensureTrailingTextLine = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const last = canvas.lastElementChild as HTMLElement | null;
    if (last && !last.dataset.uid) return; // already ends on plain text
    const div = document.createElement('div');
    div.className = 'md-text';
    div.dataset.placeholder = 'Click to keep writing…';
    canvas.appendChild(div);
  }, []);

  // ---------- initial mount ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.dataset.mounted) return;
    canvas.dataset.mounted = '1';

    appendTextLine('md-h1', "Hi, I'm Alex 👋");
    appendTextLine('md-text', 'Backend Developer');
    appendWidgetInstance(mkInstance('lang-cpp'));
    appendWidgetInstance(mkInstance('lang-python'));
    appendWidgetInstance(mkInstance('tool-docker'));
    appendTextLine('md-h2', 'About Me');
    appendTextLine('md-text', 'I build backend systems that scale.');
    appendTextLine('md-h2', 'GitHub Stats');
    appendWidgetInstance(mkInstance('stats-github'));
    appendTextLine('md-h2', 'Connect with me');
    appendWidgetInstance(mkInstance('social-github'));
    appendWidgetInstance(mkInstance('social-linkedin'));

    ensureTrailingTextLine();
    const first = canvas.querySelector<HTMLElement>('[data-uid]');
    if (first?.dataset.uid) selectWidget(first.dataset.uid);

    // Safety net: any brand-new top-level line should default to plain
    // paragraph style, never inherit a heading's size. Needed because the
    // IME-safe Enter path below sometimes falls back to the browser's own
    // native split, which can carry the heading class over.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as HTMLElement;
          if (el.parentElement !== canvas) return;
          if (el.dataset.uid) return; // widget, leave alone
          if (el.dataset.keepClass) {
            delete el.dataset.keepClass;
            return;
          }
          if (el.classList.contains('md-h1') || el.classList.contains('md-h2')) {
            el.className = 'md-text';
          }
        });
      });
    });
    observer.observe(canvas, { childList: true });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- caret helpers ----------
  const placeCaretAtEnd = (el: HTMLElement) => {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };
  const placeCaretAtStart = (el: HTMLElement) => {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const currentTextLine = (): HTMLElement | null => {
    const canvas = canvasRef.current;
    const sel = window.getSelection();
    if (!canvas || !sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.anchorNode;
    let el = node && (node.nodeType === 3 ? node.parentElement : (node as HTMLElement));
    while (el && el.parentElement !== canvas) el = el.parentElement;
    if (!el || el === canvas || (el as HTMLElement).dataset.uid) return null;
    return el as HTMLElement;
  };

  // ---------- typing/pasting a whole "![alt](url)" (optionally link-wrapped)
  // line converts it live into a real image widget, same as any other README
  // — so pasting a snippet straight from a README (or from this app's own
  // "Copy" usage output) renders as a component instead of sitting there as
  // inert text. Mirrors the "# " -> heading rule just below. ----------
  const convertLineToImageWidget = (el: HTMLElement, alt: string, url: string, link?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const linkable = link !== undefined;
    const instance: WidgetInstance = {
      uid: nextUid(),
      libId: 'inline-image',
      type: 'url-component',
      name: alt || 'Image',
      settings: linkable ? { link } : {},
      // No {field} placeholders in the template, so fillUrlTemplate/toMarkdown
      // hand the original url/alt straight back through unchanged.
      meta: { urlTemplate: url, fields: [], linkable, altTemplate: alt || 'image' },
    };
    const widgetEl = widgetHTMLContainer(instance);
    canvas.insertBefore(widgetEl, el);
    el.remove();
    const root = createRoot(widgetEl);
    const record: WidgetRecord = { instance, el: widgetEl, root };
    widgetsRef.current.set(instance.uid, record);
    renderWidgetRoot(record);

    const newLine = document.createElement('div');
    newLine.className = 'md-text';
    widgetEl.insertAdjacentElement('afterend', newLine);
    ensureTrailingTextLine();
    placeCaretAtStart(newLine);
    selectTextBlock(newLine);
  };

  // ---------- "# " / "## " live heading conversion + keep Settings in sync ----------
  const handleInput = useCallback((_e: FormEvent<HTMLDivElement>) => {
    const el = currentTextLine();
    if (!el) return;
    if (!el.classList.contains('md-h1') && !el.classList.contains('md-h2') && !el.classList.contains('md-text')) {
      el.classList.add('md-text');
    }
    const text = el.textContent ?? '';
    const h2 = /^##\s/.exec(text);
    const h1 = !h2 && /^#\s/.exec(text);
    if (h1 || h2) {
      el.className = h2 ? 'md-h2' : 'md-h1';
      el.textContent = text.replace(/^#{1,2}\s/, '');
      placeCaretAtEnd(el);
      if (selectedTextEl === el) bump();
      return;
    }

    const trimmed = text.trim();
    const linkedImg = LINKED_IMAGE_LINE_RE.exec(trimmed);
    const plainImg = !linkedImg && IMAGE_LINE_RE.exec(trimmed);
    if (linkedImg) {
      convertLineToImageWidget(el, linkedImg[1], linkedImg[2], linkedImg[3]);
      return;
    }
    if (plainImg) {
      convertLineToImageWidget(el, plainImg[1], plainImg[2]);
      return;
    }

    if (selectedTextEl === el) bump(); // let SettingsPanel re-read the live text/level
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTextEl]);

  // ---------- Enter: always start a fresh paragraph below, splitting at the
  // caret. Uses Range.extractContents() (not .textContent) so any Shift+Enter
  // <br> soft-breaks before/after the caret move over intact. ----------
  const splitLineAtCaret = (el: HTMLElement) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const postRange = document.createRange();
    postRange.selectNodeContents(el);
    postRange.setStart(range.startContainer, range.startOffset);
    const afterFragment = postRange.extractContents();

    while (afterFragment.firstChild && (isEmptyText(afterFragment.firstChild) || afterFragment.firstChild.nodeName === 'BR')) {
      afterFragment.removeChild(afterFragment.firstChild);
    }
    while (el.lastChild && (isEmptyText(el.lastChild) || el.lastChild.nodeName === 'BR')) {
      el.removeChild(el.lastChild);
    }

    const newDiv = document.createElement('div');
    newDiv.className = 'md-text';
    newDiv.appendChild(afterFragment);
    el.insertAdjacentElement('afterend', newDiv);
    placeCaretAtStart(newDiv);
    selectTextBlock(newDiv);
  };

  // IME composition (Korean/Japanese/Chinese) makes the caret position
  // unreliable mid-keystroke; e.isComposing is true for the Enter that
  // CONFIRMS a composition, so that one is left entirely to the browser's
  // own composition-safe handling. The MutationObserver above is the
  // safety net if that native split inherits a heading class.
  const removeSelectedWidget = useCallback(() => {
    if (!selectedUid) return;
    const record = widgetsRef.current.get(selectedUid);
    if (!record) return;
    record.root.unmount();
    record.el.remove();
    widgetsRef.current.delete(selectedUid);
    setSelectedUid(null);
    ensureTrailingTextLine();
  }, [selectedUid, ensureTrailingTextLine]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      // A selected widget is contentEditable=false, so clicking it never
      // moves the browser's real caret — it just stays wherever it last
      // was (often the trailing line). Without this, Backspace/Delete with
      // a widget selected silently edits that stale caret spot instead of
      // removing the widget the user is actually looking at.
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedUid) {
        e.preventDefault();
        removeSelectedWidget();
        return;
      }
      if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
      const el = currentTextLine();
      if (!el) return;
      e.preventDefault();
      splitLineAtCaret(el);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedUid, removeSelectedWidget],
  );

  // Force plain-text paste so pasted content always matches the design
  // system instead of pulling in foreign fonts/colors/markup.
  const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // ---------- click delegation: widget vs. plain text line ----------
  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const widgetEl = (e.target as HTMLElement).closest<HTMLElement>('[data-uid]');
      if (widgetEl?.dataset.uid) {
        selectWidget(widgetEl.dataset.uid);
        return;
      }
      if (e.target === canvas) return; // clicked empty padding, not a real line
      let el = e.target as HTMLElement | null;
      while (el && el.parentElement !== canvas) el = el.parentElement;
      if (el && el.parentElement === canvas && !el.dataset.uid) selectTextBlock(el);
    },
    [selectWidget, selectTextBlock],
  );

  // ---------- drag-and-drop widget reordering ----------
  const dragUidRef = useRef<string | null>(null);

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>) => {
    const widget = (e.target as HTMLElement).closest<HTMLElement>('[data-uid]');
    if (!widget?.dataset.uid) {
      e.preventDefault();
      return;
    }
    dragUidRef.current = widget.dataset.uid;
    widget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widget.dataset.uid);
  }, []);

  const clearDropIndicators = () => {
    canvasRef.current?.querySelectorAll('.drop-before, .drop-after').forEach((el) => el.classList.remove('drop-before', 'drop-after'));
  };

  const handleDragEnd = useCallback((e: DragEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).closest<HTMLElement>('[data-uid]')?.classList.remove('dragging');
    clearDropIndicators();
    dragUidRef.current = null;
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !dragUidRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = Array.from(canvas.children).find((child) => {
      const el = child as HTMLElement;
      if (el.dataset.uid === dragUidRef.current) return false;
      const r = el.getBoundingClientRect();
      return e.clientY >= r.top && e.clientY <= r.bottom;
    }) as HTMLElement | undefined;
    clearDropIndicators();
    if (!target) return;
    const r = target.getBoundingClientRect();
    target.classList.add(e.clientY < r.top + r.height / 2 ? 'drop-before' : 'drop-after');
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const before = canvas.querySelector('.drop-before');
    const after = canvas.querySelector('.drop-after');
    const target = (before ?? after) as HTMLElement | null;
    const dragUid = dragUidRef.current;
    const draggedEl = dragUid ? canvas.querySelector<HTMLElement>(`[data-uid="${dragUid}"]`) : null;
    if (draggedEl) {
      if (target && target !== draggedEl) {
        if (before) canvas.insertBefore(draggedEl, target);
        else canvas.insertBefore(draggedEl, target.nextSibling);
      } else if (!target) {
        canvas.appendChild(draggedEl); // dropped below/beyond all content — move to the end
      }
      ensureTrailingTextLine();
    }
    clearDropIndicators();
    dragUidRef.current = null;
  }, [ensureTrailingTextLine]);

  // ---------- adding from the library — shared by static presets (looked up
  // by id from the registry) and custom/community entries (passed in whole,
  // since they never make it into the static registry) ----------
  // Whatever the user last clicked in the canvas (a text line or a widget)
  // stays selected even after they click into the Library panel to hit "Use
  // Component" — clicking there doesn't touch the canvas at all. So it's a
  // reliable stand-in for "where the cursor is" at insert time, without
  // depending on the browser's actual (and easily lost) native selection.
  const getInsertionAnchor = (): HTMLElement | null => {
    const canvas = canvasRef.current;
    if (selectedTextEl && selectedTextEl.isConnected && selectedTextEl.parentElement === canvas) return selectedTextEl;
    if (selectedUid) {
      const el = widgetsRef.current.get(selectedUid)?.el;
      if (el?.isConnected) return el;
    }
    return null;
  };

  const placeLibraryEntry = useCallback(
    (lib: LibraryEntry) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const anchor = getInsertionAnchor();
      const insert = (node: HTMLElement) => (anchor ? anchor.insertAdjacentElement('afterend', node) : canvas.appendChild(node));

      if (lib.type === 'heading') {
        // Inserted as plain free text, not a tracked widget — becomes exactly
        // the same kind of editable line as anything typed by hand.
        const level = (lib.defaultSettings as { level: HeadingLevel }).level;
        const cls = level === 'h1' ? 'md-h1' : level === 'h2' ? 'md-h2' : 'md-text';
        const div = document.createElement('div');
        div.className = cls;
        div.textContent = (lib.defaultSettings as { text: string }).text;
        if (cls !== 'md-text') div.dataset.keepClass = '1'; // exempt from the observer's downgrade
        insert(div);
        div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        placeCaretAtEnd(div);
        selectTextBlock(div);
        return;
      }

      const instance = mkInstanceFromEntry(lib);
      const el = widgetHTMLContainer(instance);
      insert(el);
      const root = createRoot(el);
      const record: WidgetRecord = { instance, el, root };
      widgetsRef.current.set(instance.uid, record);
      renderWidgetRoot(record);
      ensureTrailingTextLine();
      selectWidget(instance.uid);
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      el.classList.add('flash');
      setTimeout(() => el.classList.remove('flash'), 1000);
    },
    [ensureTrailingTextLine, renderWidgetRoot, selectTextBlock, selectWidget, selectedTextEl, selectedUid, widgetHTMLContainer],
  );

  const addFromLibrary = useCallback((libId: string) => placeLibraryEntry(getLibraryEntry(libId)), [placeLibraryEntry]);
  const addCustomEntry = useCallback((entry: LibraryEntry) => placeLibraryEntry(entry), [placeLibraryEntry]);

  // ---------- editing the selected widget ----------
  const getSelectedWidget = useCallback((): WidgetInstance | null => {
    if (!selectedUid) return null;
    return widgetsRef.current.get(selectedUid)?.instance ?? null;
  }, [selectedUid]);

  const updateSelectedWidgetSettings = useCallback(
    (patch: Record<string, unknown>) => {
      if (!selectedUid) return;
      const record = widgetsRef.current.get(selectedUid);
      if (!record) return;
      record.instance.settings = { ...record.instance.settings, ...patch };
      renderWidgetRoot(record);
      bump();
    },
    [selectedUid, renderWidgetRoot],
  );

  // Swaps the placed widget to a sibling Preset (see SettingsPanel's generic
  // "Preset" dropdown) — unlike updateSelectedWidgetSettings this also
  // updates `meta` (some Components, e.g. Tech Icon, vary glyph/tileColor
  // per preset, not just settings) and `libId`/`name`, since libId doubles
  // as "which preset is this" for the dropdown's own current-value lookup
  // and for PRESET_PARENT_MAP resolution after a save/reload round-trip.
  const updateSelectedWidgetPreset = useCallback(
    (preset: PresetDefinition) => {
      if (!selectedUid) return;
      const record = widgetsRef.current.get(selectedUid);
      if (!record) return;
      record.instance.libId = preset.id;
      record.instance.name = preset.name;
      record.instance.settings = { ...record.instance.settings, ...preset.settings };
      if (preset.meta) record.instance.meta = { ...record.instance.meta, ...preset.meta };
      renderWidgetRoot(record);
      bump();
    },
    [selectedUid, renderWidgetRoot],
  );

  // ---------- editing the selected text line ----------
  const setSelectedTextValue = useCallback(
    (text: string) => {
      if (!selectedTextEl) return;
      selectedTextEl.textContent = text;
      bump();
    },
    [selectedTextEl],
  );

  const setSelectedTextLevel = useCallback(
    (level: HeadingLevel) => {
      if (!selectedTextEl) return;
      selectedTextEl.className = level === 'h1' ? 'md-h1' : level === 'h2' ? 'md-h2' : 'md-text';
      bump();
    },
    [selectedTextEl],
  );

  // ---------- markdown export ----------
  // Walks the live DOM (not a JS array) since free text only exists there.
  // ---------- serialize / restore (Save feature) ----------
  const serializeCanvas = useCallback((): SerializedBlock[] => {
    const canvas = canvasRef.current;
    if (!canvas) return [];
    const blocks: SerializedBlock[] = [];
    Array.from(canvas.children).forEach((child) => {
      const el = child as HTMLElement;
      const uid = el.dataset.uid;
      if (uid) {
        const record = widgetsRef.current.get(uid);
        if (!record) return;
        const { libId, type, name, settings, meta } = record.instance;
        blocks.push({ kind: 'widget', libId, type, name, settings, meta });
        return;
      }
      if (el.innerHTML.trim() === '') return; // skip the empty trailing line
      blocks.push({ kind: 'text', className: el.className as SerializedTextBlock['className'], html: el.innerHTML });
    });
    return blocks;
  }, []);

  const loadFromBlocks = useCallback(
    (blocks: SerializedBlock[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      widgetsRef.current.forEach((record) => record.root.unmount());
      widgetsRef.current.clear();
      canvas.innerHTML = '';
      blocks.forEach((block) => {
        if (block.kind === 'text') {
          appendTextLine(block.className, block.html);
        } else {
          appendWidgetInstance({
            uid: nextUid(),
            libId: block.libId,
            type: block.type,
            name: block.name,
            settings: block.settings,
            meta: block.meta,
          });
        }
      });
      ensureTrailingTextLine();
      clearSelection();
    },
    [appendTextLine, appendWidgetInstance, ensureTrailingTextLine, clearSelection],
  );

  const buildFullMarkdown = useCallback((): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    const lines: string[] = [];
    let inlineBuffer: string[] = [];
    const flushInline = () => {
      if (inlineBuffer.length) {
        lines.push(inlineBuffer.join(' '));
        inlineBuffer = [];
      }
    };

    Array.from(canvas.children).forEach((child) => {
      const el = child as HTMLElement;
      const uid = el.dataset.uid;
      if (uid) {
        const record = widgetsRef.current.get(uid);
        if (!record) return;
        const def = getComponentType(record.instance.type);
        const md = def.toMarkdown(record.instance.settings, record.instance.meta);
        if (def.layout === 'inline') inlineBuffer.push(md);
        else {
          flushInline();
          lines.push(md);
        }
        return;
      }
      flushInline();
      const raw = textWithSoftBreaks(el).trim();
      if (!raw) return;
      if (el.classList.contains('md-h1')) lines.push('# ' + raw.replace(/\n+/g, ' '));
      else if (el.classList.contains('md-h2')) lines.push('## ' + raw.replace(/\n+/g, ' '));
      else {
        // GFM hard line break: two trailing spaces keeps soft-broken lines
        // inside the SAME paragraph instead of splitting into a new one.
        lines.push(
          raw
            .split('\n')
            .map((s) => s.trim())
            .join('  \n'),
        );
      }
    });
    flushInline();
    return lines.join('\n\n');
  }, []);

  return {
    canvasRef,
    selectedUid,
    selectedTextEl,
    getSelectedWidget,
    addFromLibrary,
    addCustomEntry,
    updateSelectedWidgetSettings,
    updateSelectedWidgetPreset,
    removeSelectedWidget,
    setSelectedTextValue,
    setSelectedTextLevel,
    clearSelection,
    buildFullMarkdown,
    serializeCanvas,
    loadFromBlocks,
    canvasHandlers: {
      onClick: handleClick,
      onInput: handleInput,
      onKeyDown: handleKeyDown,
      onPaste: handlePaste,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}

export type UseCanvasEditor = ReturnType<typeof useCanvasEditor>;
export { COMPONENT_TYPES, LIBRARY };
