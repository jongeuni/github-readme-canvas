import { useRef } from 'react';

/**
 * Closes a modal when the overlay backdrop is clicked, but not when a
 * drag-select started inside the modal (e.g. selecting URL input text)
 * ends up releasing the mouse over the backdrop — the browser still fires
 * a `click` on the overlay in that case, since `click` targets are
 * resolved from the `mouseup` position, not where the drag began.
 */
export function useOverlayDismiss(onDismiss: () => void) {
  const mouseDownOnOverlay = useRef(false);

  return {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
      mouseDownOnOverlay.current = e.target === e.currentTarget;
    },
    onClick: (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && mouseDownOnOverlay.current) onDismiss();
      mouseDownOnOverlay.current = false;
    },
  };
}
