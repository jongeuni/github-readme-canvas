import { createElement } from 'react';
import { parseMarkdownToBlocks } from '../../editor/useCanvasEditor';
import { getComponentType } from '../../../registry';
import type { SerializedBlock } from '../../../types/document';

/** A read-only "how this will actually look" preview for the Content
 *  textarea above it — parses the same way pasted markdown does (headings,
 *  bold/italic/links, lists, images, ...) and renders each block with the
 *  same classes/components the main canvas uses, so `## Heading` genuinely
 *  shows up sized like a heading instead of staying literal `##` text. */
export function DetailsContentPreview({ content }: { content: string }) {
  if (!content.trim()) return null;
  const blocks = parseMarkdownToBlocks(content);

  return (
    <div className="field">
      <label>Preview</label>
      <div className="canvas-paper md-details-content-preview">
        {blocks.map((block, i) => (
          <PreviewBlock key={i} block={block} />
        ))}
      </div>
    </div>
  );
}

function PreviewBlock({ block }: { block: SerializedBlock }) {
  const align = block.align && block.align !== 'left' ? block.align : undefined;
  if (block.kind === 'text') {
    return <div className={block.className} data-align={align} dangerouslySetInnerHTML={{ __html: block.html }} />;
  }
  const def = getComponentType(block.type);
  return (
    <div className="md-details-preview-widget" data-align={align}>
      {createElement(def.Preview, { settings: block.settings, meta: block.meta })}
    </div>
  );
}
