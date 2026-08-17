import type { UseCanvasEditor } from './useCanvasEditor';

/**
 * Thin wrapper around the contentEditable surface. All the real behavior
 * lives in useCanvasEditor (see the long comment at the top of that file for
 * why this div is never given JSX children) — this component only wires the
 * ref and the event handlers onto the DOM node.
 */
export function Canvas({ editor }: { editor: UseCanvasEditor }) {
  return (
    <div className="canvas-col">
      <div
        ref={editor.canvasRef}
        id="canvas-paper"
        className="canvas-paper"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        {...editor.canvasHandlers}
      />
    </div>
  );
}
