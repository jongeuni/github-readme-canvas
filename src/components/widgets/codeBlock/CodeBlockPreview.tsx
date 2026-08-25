import type { KeyboardEvent } from 'react';
import type { PreviewProps } from '../../../types/component';
import { useSyncedFieldValue } from '../../../hooks/useSyncedFieldValue';
import { useAutoResizeTextarea } from '../../../hooks/useAutoResizeTextarea';
import type { CodeBlockSettings } from './types';

/** Tab inserts two spaces instead of jumping focus to the next field —
 *  execCommand keeps it on the native undo stack, same primitive the app's
 *  own paste-insert path already uses elsewhere. */
function handleTabKey(e: KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  document.execCommand('insertText', false, '  ');
}

export function CodeBlockPreview({ settings, onChange }: PreviewProps<CodeBlockSettings>) {
  const lang = useSyncedFieldValue<HTMLInputElement>(settings.lang);
  const code = useSyncedFieldValue<HTMLTextAreaElement>(settings.code);
  useAutoResizeTextarea(code.ref, code.value);

  return (
    <pre className="md-codeblock-preview">
      <input
        ref={lang.ref}
        className="md-codeblock-lang-input"
        value={lang.value}
        placeholder="lang"
        spellCheck={false}
        onChange={(e) => {
          lang.setLocal(e.target.value);
          onChange?.({ lang: e.target.value });
        }}
      />
      <textarea
        ref={code.ref}
        className="md-codeblock-code-input"
        value={code.value}
        placeholder="// type your code here"
        spellCheck={false}
        rows={1}
        onChange={(e) => {
          code.setLocal(e.target.value);
          onChange?.({ code: e.target.value });
        }}
        onKeyDown={handleTabKey}
      />
    </pre>
  );
}
