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

/** Caret anchor used right after auto-closing a bold/italic run — see
 *  convertInlineEmphasis. Invisible on screen; textWithSoftBreaks strips it
 *  before it can leak into the exported Markdown. */
const ZERO_WIDTH_SPACE = '\u200B';
const ZERO_WIDTH_SPACE_RE = /\u200B/g;

/** A whole line that is exactly `![alt](url)`, optionally link-wrapped as
 *  `[![alt](url)](link)` — the two shapes toMarkdown produces for images.
 *  Matched against a line's full trimmed text, same live-conversion idea as
 *  the "# " -> heading rule below. */
const IMAGE_LINE_RE = /^!\[([^\]]*)\]\((\S+)\)$/;
const LINKED_IMAGE_LINE_RE = /^\[!\[([^\]]*)\]\((\S+)\)\]\((\S+)\)$/;

/** Matched against the text run right before the caret, so typing the
 *  closing marker converts immediately — same live-conversion idea as the
 *  line-level rules above, just mid-paragraph instead of whole-line.
 *  Bold checked first: by the time italic is tried, the text is already
 *  known not to end in `**`, so a bare closing `*` is unambiguous. Only
 *  `*`/`**` are handled (not `_`/`__`) — underscores show up too often
 *  inside normal words/identifiers to safely auto-convert. */
const BOLD_INLINE_RE = /\*\*([^*\n]+)\*\*$/;
// (?<!\*) on the opening marker matters mid-keystroke: right after typing
// the FIRST of two closing `*`s for a **bold** still in progress (text so
// far ends "...**bold*"), a lookbehind-less version reads the second `*` of
// that leading "**" as a fresh italic opener and fires one keystroke early.
const ITALIC_INLINE_RE = /(?<!\*)\*([^*\n]+)\*$/;
const STRIKE_INLINE_RE = /~~([^~\n]+)~~$/;
const CODE_INLINE_RE = /`([^`\n]+)`$/;
// (?<!!) excludes `![alt](url)` — that's the image syntax handled as a whole
// line above; without the lookbehind this would misfire on the "[alt](url)"
// tail of an inline image and turn it into a link instead.
const LINK_INLINE_RE = /(?<!!)\[([^\]\n]+)\]\((\S+)\)$/;

/** A line consisting of just `---`, `***`, or `___` (3+) is a thematic break
 *  (GFM horizontal rule) — same live-conversion idea as the image-line rule
 *  above, converted into the existing Divider component instead of a plain
 *  text line since there's nothing else useful a `<hr>`-only line could hold. */
const HR_LINE_RE = /^(-{3,}|\*{3,}|_{3,})$/;

/** `- [ ] text` / `- [x] text` — a GFM task list item. Checked before the
 *  plain `-`/`*` bullet rule below (it's a strict superset of that prefix),
 *  so a task marker never gets caught as a plain bullet first. */
const TASK_LINE_RE = /^[-*]\s\[([ xX])\]\s/;

/** Whole-line prefixes that switch a line's block style the moment the
 *  trailing space is typed — same live-conversion idea as the heading rule,
 *  just for GFM blockquote/list markers instead of `#`. Checked in order;
 *  first match wins (their leading characters never overlap). */
const LINE_PREFIX_PATTERNS: { re: RegExp; className: string }[] = [
  { re: /^>\s/, className: 'md-quote' },
  { re: /^[-*]\s/, className: 'md-ul-item' },
  { re: /^\d+\.\s/, className: 'md-ol-item' },
];

/** A lone "```" or "```lang" line converts into a Code Block component —
 *  same idea as the HR rule above, just for GFM fenced code. Multi-line code
 *  content is typed into that component's own Settings-panel textarea
 *  instead of live in the canvas: the canvas is one div per line, and a
 *  code block's whole point is that Enter inside it must NOT start a new
 *  paragraph, which doesn't fit that model without a second, parallel
 *  editing mode. Reusing the Settings panel keeps one editing model. */
const CODE_FENCE_RE = /^```(\S*)$/;

/** A GFM table's second (separator) row, e.g. "| --- | --- |" or "---|---".
 *  Typing this right after a "| header | header |"-shaped line converts
 *  both into a Table component, seeded with those two rows plus one blank
 *  data row — further rows are added in that component's own textarea, same
 *  reasoning as the code-fence rule above (a table is a multi-row unit that
 *  doesn't fit the one-div-per-line canvas model once past its first row). */
const TABLE_SEP_RE = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/;

export type TextLineStyle = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'quote' | 'ul' | 'ol' | 'task' | 'text';

const STYLE_CLASS: Record<TextLineStyle, string> = {
  h1: 'md-h1',
  h2: 'md-h2',
  h3: 'md-h3',
  h4: 'md-h4',
  h5: 'md-h5',
  h6: 'md-h6',
  quote: 'md-quote',
  ul: 'md-ul-item',
  ol: 'md-ol-item',
  task: 'md-task',
  text: 'md-text',
};

/** Every class handleInput's live-conversion can assign to a top-level line
 *  (used by the MutationObserver's reset-on-native-split safety net, and by
 *  handleInput's own "still needs a default md-text class" check). */
const CUSTOM_LINE_CLASSES = Object.values(STYLE_CLASS).filter((c) => c !== 'md-text');

export const TEXT_LINE_STYLE_OPTIONS: { value: TextLineStyle; label: string }[] = [
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
  { value: 'quote', label: 'Quote' },
  { value: 'ul', label: 'Bulleted List' },
  { value: 'ol', label: 'Numbered List' },
  { value: 'task', label: 'To-do List' },
  { value: 'text', label: 'Paragraph' },
];

export function textLineStyle(el: HTMLElement): TextLineStyle {
  const entry = (Object.entries(STYLE_CLASS) as [TextLineStyle, string][]).find(([style, cls]) => style !== 'text' && el.classList.contains(cls));
  return entry?.[0] ?? 'text';
}

export function textLineStyleLabel(style: TextLineStyle): string {
  return TEXT_LINE_STYLE_OPTIONS.find((o) => o.value === style)?.label ?? 'Paragraph';
}

/** Markdown line-prefix for each block style — shared by buildFullMarkdown's
 *  export and (inverted) by handleInput's live-conversion above. */
const LINE_PREFIX: Partial<Record<string, string>> = {
  'md-h1': '# ',
  'md-h2': '## ',
  'md-h3': '### ',
  'md-h4': '#### ',
  'md-h5': '##### ',
  'md-h6': '###### ',
  'md-quote': '> ',
  'md-ul-item': '- ',
  'md-ol-item': '1. ',
};

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

/** Turns a line into a GFM task-list item: a real, clickable checkbox
 *  (contentEditable=false, so clicking it toggles instead of placing a text
 *  caret) followed by the item's text. Used by both the live "- [ ] "
 *  conversion and the Settings panel's Style dropdown. The checkbox's
 *  `checked` ATTRIBUTE (not just the .checked property) is what gets
 *  serialized — see the click handler and buildFullMarkdown for the two
 *  other places that same attribute is read/written. */
function applyTaskStyle(el: HTMLElement, checked: boolean, text: string) {
  el.className = 'md-task';
  el.innerHTML = '';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.contentEditable = 'false';
  if (checked) checkbox.setAttribute('checked', '');
  el.appendChild(checkbox);
  el.appendChild(document.createTextNode(text));
}

/** Walks a text line's DOM to rebuild its markdown source: Shift+Enter's
 *  soft <br> becomes a real line break (.textContent silently drops it), and
 *  the inline tags produced by the floating toolbar or live `**`/`*`/`~~`/
 *  `` ` ``/`[]()` conversion become their markdown source again so they
 *  round-trip into the exported Markdown instead of just vanishing into
 *  plain text. */
function textWithSoftBreaks(node: Node): string {
  let out = '';
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += (child.textContent ?? '').replace(ZERO_WIDTH_SPACE_RE, '');
      return;
    }
    if (child.nodeName === 'BR') {
      out += '\n';
      return;
    }
    const inner = textWithSoftBreaks(child);
    if (child.nodeName === 'STRONG' || child.nodeName === 'B') out += `**${inner}**`;
    else if (child.nodeName === 'EM' || child.nodeName === 'I') out += `*${inner}*`;
    else if (child.nodeName === 'DEL' || child.nodeName === 'S') out += `~~${inner}~~`;
    else if (child.nodeName === 'CODE') out += `\`${inner}\``;
    else if (child.nodeName === 'A') out += `[${inner}](${(child as HTMLAnchorElement).getAttribute('href') ?? ''})`;
    else out += inner;
  });
  return out;
}

export function useCanvasEditor() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const widgetsRef = useRef<Map<string, WidgetRecord>>(new Map());
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [selectedTextEl, setSelectedTextEl] = useState<HTMLElement | null>(null);
  // Position (relative to .canvas-col) of the floating Bold/Italic toolbar —
  // null hides it. Rendered outside the contentEditable region (see Canvas.tsx)
  // so it's plain React, not another thing fighting the canvas for control.
  const [selectionToolbar, setSelectionToolbar] = useState<{ top: number; left: number } | null>(null);
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
    // paragraph style, never inherit a heading/quote/list line's style.
    // Needed because the IME-safe Enter path below sometimes falls back to
    // the browser's own native split, which can carry the class over.
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
          if (CUSTOM_LINE_CLASSES.some((cls) => el.classList.contains(cls))) {
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

  // ---------- typing a lone "---" / "***" / "___" line converts it live into
  // a Divider component, same idea as convertLineToImageWidget above. ----------
  const convertLineToDividerWidget = (el: HTMLElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const instance = mkInstance('dec-divider');
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

  // ---------- typing a lone "```" or "```lang" line converts it live into a
  // Code Block component, selected right away so its Settings-panel textarea
  // is the very next place the user types — see CODE_FENCE_RE's doc comment
  // for why the code itself is typed there, not live in the canvas. ----------
  const convertLineToCodeBlockWidget = (el: HTMLElement, lang: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const instance = mkInstance('dec-codeblock', lang ? { lang } : undefined);
    const widgetEl = widgetHTMLContainer(instance);
    canvas.insertBefore(widgetEl, el);
    el.remove();
    const root = createRoot(widgetEl);
    const record: WidgetRecord = { instance, el: widgetEl, root };
    widgetsRef.current.set(instance.uid, record);
    renderWidgetRoot(record);
    ensureTrailingTextLine();
    selectWidget(instance.uid);
    widgetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // ---------- typing a table's "| --- | --- |" separator row right after a
  // "| header | header |" row converts both into a Table component, seeded
  // with those two rows — see TABLE_SEP_RE's doc comment for why further
  // rows are added in that component's own Settings-panel textarea. ----------
  const convertLinesToTableWidget = (headerEl: HTMLElement, sepEl: HTMLElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const headerText = (headerEl.textContent ?? '').trim();
    const sepText = (sepEl.textContent ?? '').trim();
    const cellCount = headerText.split('|').map((s) => s.trim()).filter(Boolean).length || 2;
    const dataRow = '| ' + Array(cellCount).fill(' ').join(' | ') + ' |';
    const instance = mkInstance('dec-table', { source: `${headerText}\n${sepText}\n${dataRow}` });
    const widgetEl = widgetHTMLContainer(instance);
    canvas.insertBefore(widgetEl, headerEl);
    headerEl.remove();
    sepEl.remove();
    const root = createRoot(widgetEl);
    const record: WidgetRecord = { instance, el: widgetEl, root };
    widgetsRef.current.set(instance.uid, record);
    renderWidgetRoot(record);
    ensureTrailingTextLine();
    selectWidget(instance.uid);
    widgetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // ---------- typing `**bold**`, `*italic*`, `~~strike~~`, `` `code` `` or
  // `[text](url)` converts that run into real inline markup the moment the
  // closing marker is typed, so the canvas shows the real formatting instead
  // of literal markdown characters. Only touches the text node the caret is
  // in — safe to call on every keystroke. ----------
  const convertInlineEmphasis = (el: HTMLElement): boolean => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;
    const node = sel.anchorNode;
    if (!node || node.nodeType !== Node.TEXT_NODE || !el.contains(node)) return false;
    const text = node.textContent ?? '';
    const caretOffset = sel.anchorOffset;
    const prefix = text.slice(0, caretOffset);

    const boldMatch = BOLD_INLINE_RE.exec(prefix);
    const strikeMatch = !boldMatch && STRIKE_INLINE_RE.exec(prefix);
    const codeMatch = !boldMatch && !strikeMatch && CODE_INLINE_RE.exec(prefix);
    const linkMatch = !boldMatch && !strikeMatch && !codeMatch && LINK_INLINE_RE.exec(prefix);
    const italicMatch = !boldMatch && !strikeMatch && !codeMatch && !linkMatch && ITALIC_INLINE_RE.exec(prefix);
    const match = boldMatch ?? strikeMatch ?? codeMatch ?? linkMatch ?? italicMatch;
    if (!match) return false;

    const parent = node.parentNode;
    if (!parent) return false;

    const matchStart = caretOffset - match[0].length;
    const before = text.slice(0, matchStart);
    const after = text.slice(caretOffset);

    const tag = boldMatch ? 'strong' : strikeMatch ? 'del' : codeMatch ? 'code' : linkMatch ? 'a' : 'em';
    const wrapper = document.createElement(tag);
    wrapper.textContent = match[1];
    if (linkMatch) (wrapper as HTMLAnchorElement).href = linkMatch[2];

    node.textContent = before;
    parent.insertBefore(wrapper, node.nextSibling);

    // A genuinely empty text node — or no text node at all, just the
    // wrapper's element boundary — is an unstable caret anchor: browsers
    // keep typing inside the adjacent <strong>/<em> instead of past it once
    // there's no neutral character to land on. ZERO_WIDTH_SPACE gives the
    // caret real (if invisible) content to sit in; textWithSoftBreaks strips
    // it back out on export.
    const afterNode = document.createTextNode(after || ZERO_WIDTH_SPACE);
    parent.insertBefore(afterNode, wrapper.nextSibling);
    const range = document.createRange();
    range.setStart(afterNode, after ? 0 : 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  };

  // ---------- floating Bold/Italic toolbar on drag-selecting text ----------
  const handleCanvasMouseUp = useCallback(() => {
    const canvas = canvasRef.current;
    const sel = window.getSelection();
    if (!canvas || !sel || sel.isCollapsed || sel.rangeCount === 0) {
      setSelectionToolbar(null);
      return;
    }
    const asEl = (n: Node | null) => (n && (n.nodeType === Node.TEXT_NODE ? n.parentElement : (n as HTMLElement)));
    const anchorEl = asEl(sel.anchorNode);
    const focusEl = asEl(sel.focusNode);
    // Only for a plain-text selection fully inside the canvas — not a
    // selection that starts/ends inside a widget (those aren't editable text).
    if (!anchorEl || !focusEl || !canvas.contains(anchorEl) || !canvas.contains(focusEl) || anchorEl.closest('[data-uid]') || focusEl.closest('[data-uid]')) {
      setSelectionToolbar(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setSelectionToolbar(null);
      return;
    }
    // Viewport-relative on purpose — the toolbar is `position: fixed` (see
    // Canvas.tsx), so this can be used as-is with no ancestor-offset math.
    setSelectionToolbar({ top: rect.top - 42, left: rect.left + rect.width / 2 });
  }, []);

  // Wraps the current selection in <strong>/<em>/<del> via
  // Range.surroundContents (not document.execCommand — its output tag/markup
  // varies across browsers, and textWithSoftBreaks needs to know exactly
  // which tag to expect to round-trip it back into **bold**/*italic*/
  // ~~strike~~ on export).
  const applyInlineFormat = useCallback(
    (tag: 'strong' | 'em' | 'del') => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      try {
        const wrapper = document.createElement(tag);
        range.surroundContents(wrapper);
        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        sel.removeAllRanges();
        sel.addRange(newRange);
      } catch {
        // The range straddles a partial element boundary (e.g. half-overlaps
        // an existing <strong>/<em>) — surroundContents refuses rather than
        // produce broken markup. Just skip; nothing was corrupted.
      }
      setSelectionToolbar(null);
      const line = currentTextLine();
      if (line && selectedTextEl === line) bump();
    },
    [selectedTextEl],
  );

  // ---------- "# " / "## " live heading conversion + keep Settings in sync ----------
  const handleInput = useCallback((_e: FormEvent<HTMLDivElement>) => {
    setSelectionToolbar(null); // typing collapses whatever selection the toolbar was anchored to
    const el = currentTextLine();
    if (!el) return;
    if (!CUSTOM_LINE_CLASSES.concat('md-text').some((cls) => el.classList.contains(cls))) {
      el.classList.add('md-text');
    }
    const text = el.textContent ?? '';

    // "#" through "######" -> heading 1-6. The regex is self-disambiguating:
    // `#{1,6}` backtracks until the char right after it is whitespace, so
    // "### " can never also satisfy the "# " (h1) branch mid-match.
    const headingMatch = /^(#{1,6})\s/.exec(text);
    if (headingMatch) {
      el.className = `md-h${headingMatch[1].length}`;
      el.textContent = text.slice(headingMatch[0].length);
      placeCaretAtEnd(el);
      if (selectedTextEl === el) bump();
      return;
    }

    // "- [ ] " / "- [x] " -> task item. Checked before the plain bullet rule
    // below, which would otherwise also match its "- " prefix.
    const taskMatch = TASK_LINE_RE.exec(text);
    if (taskMatch) {
      applyTaskStyle(el, taskMatch[1].toLowerCase() === 'x', text.slice(taskMatch[0].length));
      placeCaretAtEnd(el);
      if (selectedTextEl === el) bump();
      return;
    }

    for (const { re, className } of LINE_PREFIX_PATTERNS) {
      const m = re.exec(text);
      if (m) {
        el.className = className;
        el.textContent = text.slice(m[0].length);
        placeCaretAtEnd(el);
        if (selectedTextEl === el) bump();
        return;
      }
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
    if (HR_LINE_RE.test(trimmed)) {
      convertLineToDividerWidget(el);
      return;
    }
    const codeFence = CODE_FENCE_RE.exec(trimmed);
    if (codeFence) {
      convertLineToCodeBlockWidget(el, codeFence[1]);
      return;
    }
    if (TABLE_SEP_RE.test(trimmed)) {
      const prev = el.previousElementSibling as HTMLElement | null;
      if (prev && !prev.dataset.uid && (prev.textContent ?? '').includes('|')) {
        convertLinesToTableWidget(prev, el);
        return;
      }
    }

    convertInlineEmphasis(el);
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
      // The browser already toggled checkbox.checked by the time a click
      // listener runs — mirror that onto the `checked` ATTRIBUTE, since
      // that's what ends up in .innerHTML (and so in what gets saved/
      // exported; see applyTaskStyle's doc comment and buildFullMarkdown).
      const checkbox = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
      if (checkbox?.parentElement?.classList.contains('md-task')) {
        if (checkbox.checked) checkbox.setAttribute('checked', '');
        else checkbox.removeAttribute('checked');
        return;
      }
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
      // Plain `.textContent = text` would wipe out a task item's checkbox
      // child along with the old text — re-apply it instead, carrying the
      // checked state over.
      if (selectedTextEl.classList.contains('md-task')) {
        const checked = selectedTextEl.querySelector('input[type="checkbox"]')?.hasAttribute('checked') ?? false;
        applyTaskStyle(selectedTextEl, checked, text);
      } else {
        selectedTextEl.textContent = text;
      }
      bump();
    },
    [selectedTextEl],
  );

  const setSelectedTextLevel = useCallback(
    (style: TextLineStyle) => {
      if (!selectedTextEl) return;
      const wasTask = selectedTextEl.classList.contains('md-task');
      if (style === 'task' && !wasTask) {
        applyTaskStyle(selectedTextEl, false, selectedTextEl.textContent ?? '');
      } else if (style !== 'task' && wasTask) {
        selectedTextEl.querySelector('input[type="checkbox"]')?.remove();
        selectedTextEl.className = STYLE_CLASS[style];
      } else {
        selectedTextEl.className = STYLE_CLASS[style];
      }
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
      if (el.classList.contains('md-task')) {
        const checked = el.querySelector('input[type="checkbox"]')?.hasAttribute('checked') ?? false;
        const raw = textWithSoftBreaks(el).trim();
        lines.push(`- [${checked ? 'x' : ' '}] ${raw}`);
        return;
      }
      const raw = textWithSoftBreaks(el).trim();
      if (!raw) return;
      const prefix = Object.keys(LINE_PREFIX).find((cls) => el.classList.contains(cls));
      if (prefix) lines.push(LINE_PREFIX[prefix] + raw.replace(/\n+/g, ' '));
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
    selectionToolbar,
    applyInlineFormat,
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
      onMouseUp: handleCanvasMouseUp,
    },
  };
}

export type UseCanvasEditor = ReturnType<typeof useCanvasEditor>;
export { COMPONENT_TYPES, LIBRARY };
