import { useMemo, useState } from 'react';
import { CATEGORIES, LIBRARY_COMPONENTS } from '../../registry';
import { useFavorites } from '../../hooks/useFavorites';
import { Icon } from '../Icon';
import { ComponentCard } from './ComponentCard';
import type { LibraryEntry } from '../../types/library';

type ViewMode = 'all' | 'components';

/**
 * Left-hand library column: search, category chips, a favorites-only
 * filter, an All/Components view toggle, and the scrollable card list. One
 * card per Component — a Component with `.presets` shows a preset picker
 * inside its own card (see ComponentCard) instead of getting one card per
 * preset. "Components" view narrows that down further to only the entries
 * that actually bundle presets (e.g. Language Badge, Tech Icon) — single-
 * purpose entries like "PostgreSQL" or "Docker" don't have presets, so they
 * only ever show up in "All".
 */
export function LibraryPanel({
  onUse,
  customComponents,
  onRemoveCustomComponent,
  onRequestAddComponent,
  onSubmitPr,
}: {
  onUse: (libId: string) => void;
  customComponents: LibraryEntry[];
  onRemoveCustomComponent: (id: string) => void;
  onRequestAddComponent: () => void;
  onSubmitPr: (entry: LibraryEntry) => void;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { favorites, toggleFavorite } = useFavorites();

  const visible = useMemo(() => {
    const combined = [...LIBRARY_COMPONENTS, ...customComponents];
    const q = search.trim().toLowerCase();
    return combined.filter((item) => {
      if (viewMode === 'components' && !item.presets?.length) return false;
      if (category !== 'All' && item.category !== category) return false;
      if (favoritesOnly && !favorites.has(item.id)) return false;
      if (!q) return true;
      const presetNames = (item.presets ?? []).map((p) => p.name).join(' ');
      const hay = `${item.name} ${item.description} ${item.tags.join(' ')} ${presetNames}`.toLowerCase();
      return hay.includes(q);
    });
  }, [category, customComponents, favorites, favoritesOnly, search, viewMode]);

  return (
    <div className="lib-col">
      <div className="lib-head">
        <h2>Components</h2>
        <div className="search-box">
          <Icon name="search" />
          <input type="text" placeholder="Search components..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="mode-toggle-wrap">
          <span className="mode-toggle-label">View</span>
          <div className="mode-toggle">
            <button type="button" className={viewMode === 'all' ? 'active' : ''} onClick={() => setViewMode('all')}>
              All
            </button>
            <button type="button" className={viewMode === 'components' ? 'active' : ''} onClick={() => setViewMode('components')}>
              Components
            </button>
          </div>
        </div>
      </div>
      <div className="cat-row">
        {CATEGORIES.map((c) => (
          <span key={c} className={`cat-chip ${c === category ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </span>
        ))}
      </div>
      <div className="favorites-row">
        <span className={`pill ${favoritesOnly ? 'active' : ''}`} onClick={() => setFavoritesOnly((v) => !v)}>
          <Icon name="star" className={favoritesOnly ? 'active' : ''} /> Favorites only
        </span>
      </div>
      <div className="lib-list">
        {visible.length === 0 ? (
          <div className="lib-empty">
            찾는 컴포넌트가 없나요?
            <br />
            <span className="add-link" onClick={onRequestAddComponent}>
              + 컴포넌트 추가하기
            </span>
          </div>
        ) : (
          visible.map((item) => (
            <ComponentCard
              key={item.id}
              entry={item}
              expanded={expandedId === item.id}
              favorite={favorites.has(item.id)}
              onToggleExpand={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onUse={onUse}
              onRemove={item.id.startsWith('custom-') ? () => onRemoveCustomComponent(item.id) : undefined}
              onSubmitPr={item.id.startsWith('custom-') ? () => onSubmitPr(item) : undefined}
            />
          ))
        )}
      </div>
      <div className="lib-footer">
        <span className="add-link" onClick={onRequestAddComponent}>
          + 컴포넌트 추가하기
        </span>
      </div>
    </div>
  );
}
