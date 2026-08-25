import { useMemo, useState } from 'react';
import { CATEGORIES, LIBRARY, LIBRARY_COMPONENTS } from '../../registry';
import { useFavorites } from '../../hooks/useFavorites';
import { Icon } from '../Icon';
import { ComponentCard, PRESET_SEARCH_THRESHOLD } from './ComponentCard';
import type { LibraryEntry } from '../../types/library';

type ViewMode = 'all' | 'components';

/**
 * Left-hand library column: search, category chips, a favorites-only
 * filter, an All/Components view toggle, and the scrollable card list.
 * "Components" is the grouped view — one card per Component, a `.presets`
 * bundle shows a picker inside its own card (see ComponentCard) instead of
 * one card per preset; single-purpose entries like "PostgreSQL" or "Docker"
 * show up here too, exactly as themselves, since there's nothing to group.
 * "All" is the fully flattened view — every individual preset (every
 * language, every tech icon, ...) gets its own standalone card, for
 * browsing/searching one specific variant directly instead of through a
 * picker. Same underlying catalog either way, just LIBRARY (flattened) vs.
 * LIBRARY_COMPONENTS (grouped) as the source.
 */
export function LibraryPanel({
  onUse,
  customComponents,
  onRequestAddComponent,
  onSubmitPr,
}: {
  onUse: (libId: string) => void;
  customComponents: LibraryEntry[];
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
    // Any Component whose preset list is long enough to need its own search
    // (tech-icon's 135 icons, the badge Components' 20-35 presets each)
    // stays grouped as one card even in "All" view — flattening it would
    // mean one list row per preset, when picking one belongs in the card's
    // own combobox (see ComponentCard), not a wall of near-identical cards.
    // text-art (Kaomoji / Decorative Line) is kept grouped unconditionally
    // for the same reason even though Kaomoji alone sits just under the
    // threshold — the two read as one family, not two.
    const staysGrouped = (item: LibraryEntry) => item.type === 'text-art' || (item.presets?.length ?? 0) > PRESET_SEARCH_THRESHOLD;
    const groupedComponents = LIBRARY_COMPONENTS.filter(staysGrouped);
    // LIBRARY (flattened) has one row per preset with no `.presets` of its
    // own — excluding by id, not by re-checking staysGrouped, is what keeps
    // every one of those rows out of "All" view once its parent Component
    // is grouped.
    const groupedPresetIds = new Set(groupedComponents.flatMap((c) => (c.presets ?? []).map((p) => p.id)));
    const base =
      viewMode === 'all' ? [...LIBRARY.filter((item) => !groupedPresetIds.has(item.id)), ...groupedComponents] : LIBRARY_COMPONENTS;
    const combined = [...base, ...customComponents];
    const q = search.trim().toLowerCase();
    return combined.filter((item) => {
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
            Can't find what you're looking for?
            <br />
            <span className="add-link" onClick={onRequestAddComponent}>
              + Add Component
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
              onSubmitPr={item.id.startsWith('custom-') ? () => onSubmitPr(item) : undefined}
            />
          ))
        )}
      </div>
      <div className="lib-footer">
        <span className="add-link" onClick={onRequestAddComponent}>
          + Add Component
        </span>
      </div>
    </div>
  );
}
