import type { PreviewProps } from '../../../types/component';
import type { TableSettings } from './types';
import { parseTableSource } from './parseTable';

export function TablePreview({ settings }: PreviewProps<TableSettings>) {
  const { headers, rows } = parseTableSource(settings.source);
  if (headers.length === 0) return <div className="md-table-empty">Empty table</div>;
  return (
    <table className="md-table-preview">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
