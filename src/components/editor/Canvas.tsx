import { Icon } from '../Icon';
import type { UseCanvasEditor } from './useCanvasEditor';

/**
 * Thin wrapper around the contentEditable surface. All the real behavior
 * lives in useCanvasEditor (see the long comment at the top of that file for
 * why this div is never given JSX children) — this component only wires the
 * ref and the event handlers onto the DOM node.
 */
export function Canvas({ editor }: { editor: UseCanvasEditor }) {
  const toolbar = editor.selectionToolbar;
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
      {/* Lives outside the contentEditable div on purpose — same reason as
          everything else in useCanvasEditor's file-top comment: React must
          never hand the canvas div itself JSX children. `position: fixed`
          means it can sit anywhere in the tree and still land in the right
          spot using the viewport-relative coordinates the hook computed. */}
      {toolbar && (
        <div className="selection-toolbar" style={{ top: toolbar.top, left: toolbar.left }}>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.applyInlineFormat('strong'); }} title="Bold">
            <strong>B</strong>
          </button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.applyInlineFormat('em'); }} title="Italic">
            <em>I</em>
          </button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.applyInlineFormat('del'); }} title="Strikethrough">
            <del>S</del>
          </button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.toggleSelectionCenterAlign(); }} title="Center align">
            <Icon name="align-center" />
          </button>
        </div>
      )}
    </div>
  );
}
