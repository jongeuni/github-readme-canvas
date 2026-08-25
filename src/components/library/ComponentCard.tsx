import { createElement, useEffect, useMemo, useState } from 'react';
import { getComponentType } from '../../registry';
import type { LibraryEntry, PresetDefinition } from '../../types/library';
import { Icon } from '../Icon';
import { SearchableSelectField } from '../settings/fields';

/** "6 languages · C++ · Python · TypeScript + 3 more" — never lists every
 *  preset, just enough to signal "there's a picker in here". */
function presetSummary(entry: LibraryEntry): string {
  const presets = entry.presets ?? [];
  const noun = entry.presetsLabel ?? 'presets';
  const names = presets.map((p) => p.name);
  const shown = names.slice(0, 3).join(' · ');
  return names.length > 3 ? `${names.length} ${noun} · ${shown} + ${names.length - 3} more` : `${names.length} ${noun} · ${shown}`;
}

/** Only render a filter box once a preset list is long enough to need one —
 *  keeps small groups (today: 6 languages, 3 icons) exactly as simple as a
 *  preset-less card. */
export const PRESET_SEARCH_THRESHOLD = 8;

/** "languages" -> "a language", "icons" -> "an icon" — good enough for the
 *  simple English plurals presetsLabel actually uses. */
function presetPickerLabel(presetsLabel?: string): string {
  const noun = (presetsLabel ?? 'presets').replace(/s$/, '');
  const article = /^[aeiou]/i.test(noun) ? 'an' : 'a';
  return `Choose ${article} ${noun}`;
}

/**
 * One catalog card in the left-hand library. Rendering the preview via the
 * component type's own <Preview/> (rather than a hand-rolled switch) means a
 * brand-new widget folder shows up correctly here with zero changes to this
 * file — the whole point of the registry.
 *
 * A Component with `.presets` still gets exactly one card, same as any
 * other — it just grows a preset picker in its expanded state. See
 * PresetDefinition's doc comment (types/library.ts) for what belongs here
 * vs. what should be its own Component instead.
 */
export function ComponentCard({
  entry,
  expanded,
  favorite,
  onToggleExpand,
  onToggleFavorite,
  onUse,
  onSubmitPr,
}: {
  entry: LibraryEntry;
  expanded: boolean;
  favorite: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onUse: (id: string) => void;
  /** Present only for locally-added custom components — proposes it to the project via PR. */
  onSubmitPr?: () => void;
}) {
  const def = getComponentType(entry.type);
  const hasPresets = !!entry.presets?.length;

  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(entry.presets?.[0]?.id);
  // Every time the card is (re-)expanded, start from the first preset again
  // — simplest behavior, no "remember my last pick" state to carry around.
  useEffect(() => {
    if (expanded) setSelectedPresetId(entry.presets?.[0]?.id);
  }, [expanded, entry.presets]);

  const selectedPreset = entry.presets?.find((p) => p.id === selectedPresetId);
  const resolvedSettings = selectedPreset ? { ...entry.defaultSettings, ...selectedPreset.settings } : entry.defaultSettings;
  const resolvedMeta = selectedPreset?.meta ? { ...entry.meta, ...selectedPreset.meta } : entry.meta;
  const resolvedDescription = selectedPreset?.description ?? entry.description;

  const usage = useMemo(() => def.toMarkdown(resolvedSettings, resolvedMeta), [def, resolvedSettings, resolvedMeta]);

  const handleUse = () => onUse(selectedPreset?.id ?? entry.id);

  return (
    <div className={`comp-card ${expanded ? 'expanded' : ''}`}>
      <div className="comp-card-head" onClick={onToggleExpand}>
        <div className="comp-card-preview">{createElement(def.Preview, { settings: resolvedSettings, meta: resolvedMeta })}</div>
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
        {hasPresets ? (
          <div className="comp-card-desc preset-summary">{presetSummary(entry)}</div>
        ) : (
          <div className="comp-card-desc">{entry.description}</div>
        )}
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
          <div className="comp-detail-preview">{createElement(def.Preview, { settings: resolvedSettings, meta: resolvedMeta })}</div>
          <div className="comp-detail-desc">{resolvedDescription}</div>
          {hasPresets && (
            <>
              <div className="comp-detail-label">{presetPickerLabel(entry.presetsLabel)}</div>
              {entry.type === 'text-art' ? (
                // Picking a look, not reading a label — the option text IS
                // the kaomoji/decorative line itself, not its name. A plain
                // <select> renders arbitrary unicode fine natively, no rich
                // custom dropdown needed.
                <select
                  className="text-art-preset-select"
                  value={selectedPresetId}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSelectedPresetId(e.target.value)}
                >
                  {(entry.presets ?? []).map((p: PresetDefinition) => (
                    <option key={p.id} value={p.id}>
                      {p.settings?.text as string}
                    </option>
                  ))}
                </select>
              ) : (entry.presets?.length ?? 0) > PRESET_SEARCH_THRESHOLD ? (
                // A long preset list (135 tech icons, 40+ languages, ...) as
                // always-expanded chips would be a wall of buttons — a
                // closed-until-clicked combobox with search stays exactly as
                // compact as a plain <select> until the user actually wants
                // to browse/search it.
                <SearchableSelectField
                  value={selectedPresetId ?? ''}
                  displayLabel={selectedPreset?.name}
                  options={(entry.presets ?? []).map((p: PresetDefinition) => ({ value: p.id, label: p.name }))}
                  onChange={(id) => setSelectedPresetId(id)}
                  placeholder={`Search ${entry.presetsLabel ?? 'presets'}...`}
                />
              ) : (
                <div className="preset-list">
                  {(entry.presets ?? []).map((p: PresetDefinition) => (
                    <span
                      key={p.id}
                      className={`preset-row ${p.id === selectedPresetId ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPresetId(p.id);
                      }}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
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
              handleUse();
            }}
          >
            Use Component
          </button>
          {onSubmitPr && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', marginTop: 6 }}
              onClick={(e) => {
                e.stopPropagation();
                onSubmitPr();
              }}
            >
              <Icon name="github" />
              Submit PR to GitHub
            </button>
          )}
        </div>
      )}
    </div>
  );
}
