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

  describe('raw HTML blocks', () => {
    it('parses a single self-closing HTML img tag as one raw-html block', () => {
      const blocks = parseMarkdownToBlocks('<img src="https://example.com/a.png" />');
      const b = widget(blocks[0]);
      expect(b.libId).toBe('raw-html');
      expect(b.type).toBe('raw-html');
      expect(b.settings.html).toBe('<img src="https://example.com/a.png" />');
    });

    it('parses a void element without a self-closing slash as one raw-html block', () => {
      const blocks = parseMarkdownToBlocks('<br>');
      expect(blocks).toHaveLength(1);
      expect(widget(blocks[0]).settings.html).toBe('<br>');
    });

    it('absorbs a multi-line wrapper into one raw-html block, preserving the source verbatim', () => {
      const md = ['<div align="center">', '  <img src="https://example.com/a.png">', '</div>'].join('\n');
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks).toHaveLength(1);
      expect(widget(blocks[0]).settings.html).toBe(md);
    });

    it('tracks same-tag nesting depth instead of stopping at the first closing tag', () => {
      const md = ['<div>', '  <div>', '    <span>Hello</span>', '  </div>', '</div>'].join('\n');
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks).toHaveLength(1);
      expect(widget(blocks[0]).settings.html).toBe(md);
    });

    it('absorbs an SVG with a self-closing child element as one block', () => {
      const md = ['<svg viewBox="0 0 100 100">', '  <circle cx="50" cy="50" r="40"/>', '</svg>'].join('\n');
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks).toHaveLength(1);
      expect(widget(blocks[0]).settings.html).toBe(md);
    });

    it('does not decompose markdown-looking lines or blank lines inside an HTML wrapper', () => {
      const md = ['<div align="center">', '', '# Hello', '', 'This is **bold**.', '', '<img src="https://example.com/a.png">', '', '</div>'].join('\n');
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks).toHaveLength(1);
      expect(widget(blocks[0]).settings.html).toBe(md);
    });

    it('runs an unclosed HTML tag to the end of input', () => {
      const md = ['<div>', 'stray content'].join('\n');
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks).toHaveLength(1);
      expect(widget(blocks[0]).settings.html).toBe(md);
    });

    it('keeps correct order across a mixed markdown + HTML document', () => {
      const md = [
        '# My Project',
        '',
        '<div align="center">',
        '<img src="https://example.com/a.png">',
        '</div>',
        '',
        '## Features',
        '',
        '- feature 1',
        '- feature 2',
      ].join('\n');
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.map((b) => (b.kind === 'text' ? b.className : (b as SerializedWidgetBlock).libId))).toEqual([
        'md-h1',
        'raw-html',
        'md-h2',
        'md-ul-item',
        'md-ul-item',
      ]);
    });

    it('still escapes a bare stray HTML-like fragment mid-sentence as plain text', () => {
      const blocks = parseMarkdownToBlocks('a <script> & more');
      expect(text(blocks[0]).className).toBe('md-text');
      expect(text(blocks[0]).html).toBe('a &lt;script&gt; &amp; more');
    });
  });

  describe('Copy Markdown round-trip (buildFullMarkdown align wrappers + inline widget runs)', () => {
    it('restores an aligned heading instead of swallowing it as raw HTML', () => {
      const blocks = parseMarkdownToBlocks('<h2 align="center">Centered</h2>');
      expect(blocks).toHaveLength(1);
      expect(text(blocks[0]).className).toBe('md-h2');
      expect(text(blocks[0]).html).toBe('Centered');
      expect(text(blocks[0]).align).toBe('center');
    });

    it('unwraps a <p align> around a single inline image into one aligned widget', () => {
      const blocks = parseMarkdownToBlocks('<p align="center">![alt](https://example.com/a.png)</p>');
      expect(blocks).toHaveLength(1);
      const b = widget(blocks[0]);
      expect(b.libId).toBe('inline-image');
      expect(b.align).toBe('center');
    });

    it('splits a row of inline widgets joined by buildFullMarkdown into separate blocks, all sharing the wrapper align', () => {
      const blocks = parseMarkdownToBlocks('<p align="center">![a](https://example.com/a.png) ![b](https://example.com/b.png)</p>');
      expect(blocks).toHaveLength(2);
      expect(widget(blocks[0]).align).toBe('center');
      expect(widget(blocks[1]).align).toBe('center');
      expect(widget(blocks[0]).meta?.urlTemplate).toBe('https://example.com/a.png');
      expect(widget(blocks[1]).meta?.urlTemplate).toBe('https://example.com/b.png');
    });

    it('splits a bare (unwrapped) row of inline widgets with no align', () => {
      const blocks = parseMarkdownToBlocks('![a](https://example.com/a.png) ![b](https://example.com/b.png) ![c](https://example.com/c.png)');
      expect(blocks).toHaveLength(3);
      blocks.forEach((b) => expect(widget(b).align).toBeUndefined());
    });

    it('unwraps a <p align> around plain text, still applying inline emphasis', () => {
      const blocks = parseMarkdownToBlocks('<p align="right">This is **bold** text.</p>');
      expect(blocks).toHaveLength(1);
      expect(text(blocks[0]).className).toBe('md-text');
      expect(text(blocks[0]).html).toBe('This is <strong>bold</strong> text.');
      expect(text(blocks[0]).align).toBe('right');
    });

    it('unwraps a blank-line-separated <p align> (current wrapAlign format) around an image', () => {
      const blocks = parseMarkdownToBlocks(['<p align="center">', '', '![alt](https://example.com/a.png)', '', '</p>'].join('\n'));
      expect(blocks).toHaveLength(1);
      const b = widget(blocks[0]);
      expect(b.libId).toBe('inline-image');
      expect(b.align).toBe('center');
    });

    it('unwraps a blank-line-separated <p align> around plain text, still applying inline emphasis', () => {
      const blocks = parseMarkdownToBlocks(['<p align="right">', '', 'This is **bold** text.', '', '</p>'].join('\n'));
      expect(blocks).toHaveLength(1);
      expect(text(blocks[0]).className).toBe('md-text');
      expect(text(blocks[0]).html).toBe('This is <strong>bold</strong> text.');
      expect(text(blocks[0]).align).toBe('right');
    });

    it('splits a blank-line-separated <p align> around a badge row into separate blocks, all sharing the align', () => {
      const blocks = parseMarkdownToBlocks(
        ['<p align="center">', '', '![a](https://example.com/a.png) ![b](https://example.com/b.png)', '', '</p>'].join('\n'),
      );
      expect(blocks).toHaveLength(2);
      expect(widget(blocks[0]).align).toBe('center');
      expect(widget(blocks[1]).align).toBe('center');
    });

    it('does not let the new <h>/<p> align cases interfere with an unrelated raw-html <div>', () => {
      const md = ['<div align="center">', '<img src="https://example.com/a.png">', '</div>'].join('\n');
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks).toHaveLength(1);
      expect(widget(blocks[0]).libId).toBe('raw-html');
      expect(widget(blocks[0]).align).toBeUndefined();
    });

    it('restores a full mixed document shaped like real buildFullMarkdown output', () => {
      const md = [
        '<h1 align="center">Welcome</h1>',
        '',
        '<p align="center">![C++](https://img.shields.io/badge/c%2B%2B-blue) ![Python](https://img.shields.io/badge/python-green)</p>',
        '',
        '<div align="center">',
        '<img src="https://example.com/a.png">',
        '</div>',
        '',
        'Some text here.',
      ].join('\n\n');
      const blocks = parseMarkdownToBlocks(md);
      expect(blocks.map((b) => (b.kind === 'text' ? b.className : (b as SerializedWidgetBlock).libId))).toEqual([
        'md-h1',
        'inline-image',
        'inline-image',
        'raw-html',
        'md-text',
      ]);
      expect(text(blocks[0]).align).toBe('center');
      expect(widget(blocks[1]).align).toBe('center');
      expect(widget(blocks[2]).align).toBe('center');
      expect(widget(blocks[3]).align).toBeUndefined();
      expect(text(blocks[4]).align).toBeUndefined();
    });

    it('merges a hard-broken paragraph (trailing double space) into one block with <br>', () => {
      const blocks = parseMarkdownToBlocks('Line one  \nLine two');
      expect(blocks).toHaveLength(1);
      expect(text(blocks[0]).className).toBe('md-text');
      expect(text(blocks[0]).html).toBe('Line one<br>Line two');
    });
  });
});
