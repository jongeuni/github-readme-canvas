import { useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import type { PreviewProps } from '../../../types/component';
import { useSyncedFieldValue } from '../../../hooks/useSyncedFieldValue';
import { Icon } from '../../Icon';
import type { TableSettings } from './types';
import { parseTableSource, serializeTableSource } from './parseTable';

/** One header or body cell. Its own component (not just a mapped <input>)
 *  so useSyncedFieldValue's hook call has a stable instance per cell —
 *  React doesn't allow a variable number of hook calls in one component
 *  body, which a directly-inlined map over a resizable grid would be. */
function TableCellField({
  value,
  placeholder,
  dataRow,
  dataCol,
  onCommit,
  onEnter,
}: {
  value: string;
  placeholder?: string;
  dataRow: number;
  dataCol: number;
  onCommit: (value: string) => void;
  onEnter: () => void;
}) {
  const field = useSyncedFieldValue<HTMLInputElement>(value);
  return (
    <input
      ref={field.ref}
      className="md-table-cell-input"
      value={field.value}
      placeholder={placeholder}
      data-row={dataRow}
      data-col={dataCol}
      onChange={(e) => {
        field.setLocal(e.target.value);
        onCommit(e.target.value);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        onEnter();
      }}
    />
  );
}

export function TablePreview({ settings, onChange }: PreviewProps<TableSettings>) {
  const { headers, rows } = parseTableSource(settings.source);
  const tableRef = useRef<HTMLTableElement>(null);
  // Set right before appending a new row (Enter on the last row), since the
  // new cell doesn't exist in the DOM until this commit's re-render lands —
  // picked up by the layout effect below once it does.
  const pendingFocusRef = useRef<{ row: number; col: number } | null>(null);

  useLayoutEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending) return;
    pendingFocusRef.current = null;
    tableRef.current?.querySelector<HTMLInputElement>(`input[data-row="${pending.row}"][data-col="${pending.col}"]`)?.focus();
  });

  const commit = (nextHeaders: string[], nextRows: string[][]) => {
    onChange?.({ source: serializeTableSource(nextHeaders, nextRows) });
  };

  /** Focuses the given cell if it already exists in the DOM; otherwise
   *  defers to the layout effect above and returns false, so callers know
   *  whether they still need to create that row/cell themselves. */
  const focusCellAt = (row: number, col: number): boolean => {
    const el = tableRef.current?.querySelector<HTMLInputElement>(`input[data-row="${row}"][data-col="${col}"]`);
    if (el) {
      el.focus();
      return true;
    }
    pendingFocusRef.current = { row, col };
    return false;
  };

  const goToNextRow = (rowIndex: number, colIndex: number) => {
    if (!focusCellAt(rowIndex + 1, colIndex)) {
      commit(headers, [...rows, headers.map(() => '')]);
    }
  };

  const addRow = () => commit(headers, [...rows, headers.map(() => '')]);
  const removeRow = (rowIndex: number) => commit(headers, rows.filter((_, i) => i !== rowIndex));
  const addColumn = () => commit([...headers, `Column ${headers.length + 1}`], rows.map((r) => [...r, '']));
  const removeColumn = (colIndex: number) => {
    if (headers.length <= 1) return;
    commit(
      headers.filter((_, i) => i !== colIndex),
      rows.map((r) => r.filter((_, i) => i !== colIndex)),
    );
  };

  if (headers.length === 0) {
    return (
      <div className="md-table-empty">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => commit(['Column 1'], [['']])}>
          <Icon name="plus" /> Add column
        </button>
      </div>
    );
  }

  return (
    <div className="md-table-preview-wrap">
      <table className="md-table-preview" ref={tableRef}>
        <thead>
          <tr>
            <th className="md-table-gutter-cell" />
            {headers.map((h, ci) => (
              <th key={ci} className="md-table-header-cell">
                <TableCellField
                  value={h}
                  placeholder={`Column ${ci + 1}`}
                  dataRow={-1}
                  dataCol={ci}
                  onCommit={(v) => {
                    const next = headers.slice();
                    next[ci] = v;
                    commit(next, rows);
                  }}
                  onEnter={() => {
                    if (!focusCellAt(0, ci)) commit(headers, [...rows, headers.map(() => '')]);
                  }}
                />
                {headers.length > 1 && (
                  <button type="button" tabIndex={-1} className="md-table-remove-col" onClick={() => removeColumn(ci)} aria-label="Remove column">
                    <Icon name="close" />
                  </button>
                )}
              </th>
            ))}
            <th className="md-table-add-col-cell">
              <button type="button" tabIndex={-1} className="md-table-add-col" onClick={addColumn} aria-label="Add column">
                <Icon name="plus" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <td className="md-table-gutter-cell">
                <button type="button" tabIndex={-1} className="md-table-remove-row" onClick={() => removeRow(ri)} aria-label="Remove row">
                  <Icon name="close" />
                </button>
              </td>
              {row.map((cell, ci) => (
                <td key={ci}>
                  <TableCellField
                    value={cell}
                    dataRow={ri}
                    dataCol={ci}
                    onCommit={(v) => {
                      const next = rows.map((r) => r.slice());
                      next[ri][ci] = v;
                      commit(headers, next);
                    }}
                    onEnter={() => goToNextRow(ri, ci)}
                  />
                </td>
              ))}
              <td className="md-table-gutter-cell" />
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" tabIndex={-1} className="md-table-add-row" onClick={addRow}>
        <Icon name="plus" /> Add row
      </button>
    </div>
  );
}
