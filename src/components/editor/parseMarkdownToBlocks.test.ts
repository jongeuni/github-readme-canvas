import { describe, expect, it } from 'vitest';
import { parseMarkdownToBlocks } from './useCanvasEditor';
import type { SerializedTextBlock, SerializedWidgetBlock } from '../../types/document';

function text(block: unknown) {
  return block as SerializedTextBlock;
}
function widget(block: unknown) {
  return block as SerializedWidgetBlock;
}

describe('parseMarkdownToBlocks', () => {
  it('parses headings 1 through 6', () => {
    const md = ['# H1', '## H2', '### H3', '#### H4', '##### H5', '###### H6'].join('\n');
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(6);
    blocks.forEach((b, i) => {
      expect(text(b).className).toBe(`md-h${i + 1}`);
      expect(text(b).html).toBe(`H${i + 1}`);
    });
  });

  it('parses quote, unordered list, and ordered list', () => {
    const blocks = parseMarkdownToBlocks('> a quote\n- bullet one\n1. first');
    expect(text(blocks[0]).className).toBe('md-quote');
    expect(text(blocks[0]).html).toBe('a quote');
    expect(text(blocks[1]).className).toBe('md-ul-item');
    expect(text(blocks[1]).html).toBe('bullet one');
    expect(text(blocks[2]).className).toBe('md-ol-item');
    expect(text(blocks[2]).html).toBe('first');
  });

  it('parses task items and checks precedence over the plain bullet rule', () => {
    const blocks = parseMarkdownToBlocks('- [ ] todo\n- [x] done\n- not a task');
    expect(text(blocks[0]).className).toBe('md-task');
    expect(text(blocks[0]).html).toBe('<input type="checkbox" contenteditable="false">todo');
    expect(text(blocks[1]).className).toBe('md-task');
    expect(text(blocks[1]).html).toBe('<input type="checkbox" contenteditable="false" checked>done');
    expect(text(blocks[2]).className).toBe('md-ul-item');
  });

  it('parses a divider', () => {
    const blocks = parseMarkdownToBlocks('---');
    expect(widget(blocks[0]).libId).toBe('dec-divider');
    expect(widget(blocks[0]).type).toBe('divider');
  });

  it('parses a plain image line', () => {
    const blocks = parseMarkdownToBlocks('![my alt](https://example.com/a.png)');
    const b = widget(blocks[0]);
    expect(b.libId).toBe('inline-image');
    expect(b.type).toBe('url-component');
    expect(b.meta?.urlTemplate).toBe('https://example.com/a.png');
    expect(b.meta?.linkable).toBe(false);
    expect(b.settings).toEqual({});
  });

  it('parses a linked image line', () => {
    const blocks = parseMarkdownToBlocks('[![alt](https://example.com/a.png)](https://example.com)');
    const b = widget(blocks[0]);
    expect(b.meta?.linkable).toBe(true);
    expect(b.settings).toEqual({ link: 'https://example.com' });
  });

  it('applies inline emphasis only to plain paragraphs', () => {
    const blocks = parseMarkdownToBlocks("This is **bold**, *italic*, ~~strike~~, `code`, and [a link](https://x.com).");
    expect(text(blocks[0]).className).toBe('md-text');
    expect(text(blocks[0]).html).toBe(
      'This is <strong>bold</strong>, <em>italic</em>, <del>strike</del>, <code>code</code>, and <a href="https://x.com">a link</a>.',
    );
  });

  it('does not apply inline emphasis inside a heading', () => {
    const blocks = parseMarkdownToBlocks('# **not bold**');
    expect(text(blocks[0]).html).toBe('**not bold**');
  });

  it('escapes stray HTML in plain text', () => {
    const blocks = parseMarkdownToBlocks('a <script> & more');
    expect(text(blocks[0]).html).toBe('a &lt;script&gt; &amp; more');
  });

  it('consumes a fenced code block with its language and content as one widget', () => {
    const md = ['```ts', 'const hello = "world";', 'console.log(hello);', '```'].join('\n');
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(1);
    const b = widget(blocks[0]);
    expect(b.libId).toBe('dec-codeblock');
    expect(b.type).toBe('code-block');
    expect(b.settings.lang).toBe('ts');
    expect(b.settings.code).toBe('const hello = "world";\nconsole.log(hello);');
  });

  it('runs an unclosed fence to the end of input', () => {
    const md = ['```ts', 'const hello = "world";'].join('\n');
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(1);
    expect(widget(blocks[0]).settings.code).toBe('const hello = "world";');
  });

  it('consumes a table (header + separator + data rows) as one widget, stopping at plain text', () => {
    const md = ['| Name | Value |', '| --- | --- |', '| A | 1 |', '| B | 2 |', '', 'hello'].join('\n');
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks).toHaveLength(2);
    const table = widget(blocks[0]);
    expect(table.libId).toBe('dec-table');
    expect(table.type).toBe('table');
    expect(table.settings.source).toBe('| Name | Value |\n| --- | --- |\n| A | 1 |\n| B | 2 |');
    expect(text(blocks[1]).className).toBe('md-text');
    expect(text(blocks[1]).html).toBe('hello');
  });

  it('skips blank lines', () => {
    const blocks = parseMarkdownToBlocks('# Title\n\n\nBody');
    expect(blocks).toHaveLength(2);
  });

  it('keeps correct order across a mixed document', () => {
    const md = ['# Hello', '', 'This is **bold** and [a link](https://example.com).', '', '- first', '- second', '', '---', '', '![image](https://example.com/image.png)'].join('\n');
    const blocks = parseMarkdownToBlocks(md);
    expect(blocks.map((b) => (b.kind === 'text' ? b.className : (b as SerializedWidgetBlock).libId))).toEqual([
      'md-h1',
      'md-text',
      'md-ul-item',
      'md-ul-item',
      'dec-divider',
      'inline-image',
    ]);
  });
});
