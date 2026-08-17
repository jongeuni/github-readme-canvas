import { createElement, useMemo } from 'react';
import { getComponentType } from '../../registry';
import type { LibraryEntry } from '../../types/library';
import { Icon } from '../Icon';

/**
 * One catalog card in the left-hand library. Rendering the preview via the
 * component type's own <Preview/> (rather than a hand-rolled switch) means a
 * brand-new widget folder shows up correctly here with zero changes to this
 * file — the whole point of the registry.
 */
export function ComponentCard({
  entry,
  expanded,
  favorite,
  onToggleExpand,
  onToggleFavorite,
  onUse,
}: {
  entry: LibraryEntry;
  expanded: boolean;
  favorite: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onUse: () => void;
}) {
  const def = getComponentType(entry.type);
  const usage = useMemo(() => def.toMarkdown(entry.defaultSettings, entry.meta), [def, entry.defaultSettings, entry.meta]);

  return (
    <div className={`comp-card ${expanded ? 'expanded' : ''}`}>
      <div className="comp-card-head" onClick={onToggleExpand}>
        <div className="comp-card-preview">{createElement(def.Preview, { settings: entry.defaultSettings, meta: entry.meta })}</div>
        <div className="comp-card-name-row">
          <div className="comp-card-name">{entry.name}</div>
          <button
            type="button"
            className={`fav-btn ${favorite ? 'active' : ''}`}
            title={favorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Icon name="star" />
          </button>
        </div>
        <div className="comp-card-desc">{entry.description}</div>
        <div className="comp-card-tags">
          {entry.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </div>
      {expanded && (
        <div className="comp-detail">
          <div className="comp-detail-preview">{createElement(def.Preview, { settings: entry.defaultSettings, meta: entry.meta })}</div>
          <div className="comp-detail-desc">{entry.description}</div>
          <div className="comp-detail-label">Usage</div>
          <div className="usage-block">
            <code>{usage}</code>
            <button
              type="button"
              className="usage-copy"
              title="Copy"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard?.writeText(usage);
              }}
            >
              <Icon name="copy" />
            </button>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
            onClick={(e) => {
              e.stopPropagation();
              onUse();
            }}
          >
            Use Component
          </button>
        </div>
      )}
    </div>
  );
}
