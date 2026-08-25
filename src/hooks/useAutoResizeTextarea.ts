import { useLayoutEffect, type RefObject } from 'react';

/**
 * Grows a <textarea> to fit its content instead of scrolling internally, so
 * it reads as part of the page rather than a form widget. Takes the same
 * ref you're already attaching to the element (e.g. from
 * useSyncedFieldValue) and the *local* value driving it — resizing off the
 * external/settings value would lag a keystroke behind what's on screen.
 */
export function useAutoResizeTextarea(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [ref, value]);
}
