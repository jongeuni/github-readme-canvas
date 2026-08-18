import { useMemo, useState } from 'react';
import { CATEGORIES, LIBRARY } from '../../registry';
import { PER_LANGUAGE_BADGE_IDS } from '../widgets/badge/presets';
import { useFavorites } from '../../hooks/useFavorites';
import { Icon } from '../Icon';
import { ComponentCard } from './ComponentCard';
import type { LibraryEntry } from '../../types/library';

type BadgeMode = 'per-language' | 'unified';

/**
 * Left-hand library column: search, category chips, the per-language vs.
 * unified badge experiment (kept from the original design spec — both modes
 * stay live), a favorites-only filter, and the scrollable card list.
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
  const [badgeMode, setBadgeMode] = useState<BadgeMode>('per-language');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { favorites, toggleFavorite } = useFavorites();

  const visible = useMemo(() => {
    const combined = [...LIBRARY, ...customComponents];
    const byMode = combined.filter((item) =>
      badgeMode === 'unified' ? !PER_LANGUAGE_BADGE_IDS.includes(item.id) : item.id !== 'lang-badge-unified',
    );
    const q = search.trim().toLowerCase();
    return byMode.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (favoritesOnly && !favorites.has(item.id)) return false;
      if (!q) return true;
      const hay = `${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [badgeMode, category, customComponents, favorites, favoritesOnly, search]);

  return (
    <div className="lib-col">
      <div className="lib-head">
        <h2>Components</h2>
        <div className="search-box">
          <Icon name="search" />
          <input type="text" placeholder="Search components..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="mode-toggle-wrap">
          <span className="mode-toggle-label">Language badges</span>
          <div className="mode-toggle">
            <button type="button" className={badgeMode === 'per-language' ? 'active' : ''} onClick={() => setBadgeMode('per-language')}>
              Separate cards
            </button>
            <button type="button" className={badgeMode === 'unified' ? 'active' : ''} onClick={() => setBadgeMode('unified')}>
              Unified + picker
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
              onUse={() => onUse(item.id)}
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
