import { useEffect, useRef, useState } from 'react';

/**
 * Local, freely-editable copy of `value` for a controlled input/textarea
 * that's also fed by an external source (a widget's `settings`, shared
 * across e.g. every cell derived from one Table `source` string, or the
 * Settings panel editing the same field). Only re-syncs local state from
 * `value` when this field ISN'T the one currently focused — otherwise an
 * external update arriving mid-keystroke (or mid-IME-composition) would
 * overwrite exactly what the user is in the middle of typing, jumping the
 * cursor and breaking composition. An unfocused field (another cell, or
 * this one after blur/undo/an edit made in the Settings panel) still picks
 * up the fresh value normally.
 */
export function useSyncedFieldValue<E extends HTMLInputElement | HTMLTextAreaElement>(value: string) {
  const [local, setLocal] = useState(value);
  const ref = useRef<E | null>(null);

  useEffect(() => {
    if (document.activeElement !== ref.current) setLocal(value);
  }, [value]);

  return { ref, value: local, setLocal };
}
