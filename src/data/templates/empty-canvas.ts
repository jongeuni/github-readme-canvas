import type { Template } from '../../types/document';

/** Not a real starting point, just the "clear everything and start typing"
 *  option living in the same picker as every other template — see
 *  TemplatesMenu.tsx, which needed no changes to support this: an empty
 *  `blocks` array is exactly what editor.loadFromBlocks([]) already does. */
export const emptyCanvasTemplate: Template = {
  id: 'tpl-empty-canvas',
  name: 'Empty Canvas',
  description: 'Start from a blank canvas.',
  blocks: [],
};
