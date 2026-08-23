import type { PreviewProps } from '../../../types/component';
import type { CodeBlockSettings } from './types';

export function CodeBlockPreview({ settings }: PreviewProps<CodeBlockSettings>) {
  return (
    <pre className="md-codeblock-preview">
      {settings.lang && <div className="md-codeblock-lang">{settings.lang}</div>}
      <code>{settings.code || '// empty code block'}</code>
    </pre>
  );
}
