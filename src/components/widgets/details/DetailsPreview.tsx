import type { PreviewProps } from '../../../types/component';
import { useSyncedFieldValue } from '../../../hooks/useSyncedFieldValue';
import { useAutoResizeTextarea } from '../../../hooks/useAutoResizeTextarea';
import { Icon } from '../../Icon';
import type { DetailsSettings } from './types';

/** Native <summary> toggles open/closed on any click inside it, which would
 *  fight with placing a cursor to edit it — so the canvas preview is a
 *  custom, always-expanded stand-in (chevron + editable fields) rather than
 *  a real <details>/<summary>. Same "preview approximates, export is the
 *  real thing" split already used for Table's grid-from-source rendering;
 *  toMarkdown (definition.ts) still emits a genuine, collapsible
 *  <details><summary> for GitHub. */
export function DetailsPreview({ settings, onChange }: PreviewProps<DetailsSettings>) {
  const summary = useSyncedFieldValue<HTMLInputElement>(settings.summary);
  const content = useSyncedFieldValue<HTMLTextAreaElement>(settings.content);
  useAutoResizeTextarea(content.ref, content.value);

  return (
    <div className="md-details-preview">
      <div className="md-details-summary-row">
        <Icon name="chevron-down" className="md-details-chevron" />
        <input
          ref={summary.ref}
          className="md-details-summary-input"
          value={summary.value}
          placeholder="Click to expand"
          onChange={(e) => {
            summary.setLocal(e.target.value);
            onChange?.({ summary: e.target.value });
          }}
        />
      </div>
      <textarea
        ref={content.ref}
        className="md-details-content-input"
        value={content.value}
        placeholder="Hidden content goes here — regular markdown, same as anywhere else on the canvas."
        rows={1}
        onChange={(e) => {
          content.setLocal(e.target.value);
          onChange?.({ content: e.target.value });
        }}
      />
    </div>
  );
}
