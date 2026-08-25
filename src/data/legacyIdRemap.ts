/**
 * Old library/preset id -> current id, for every rename that ever shipped.
 * Read by useFavorites (favorited ids) and useSavedDocuments (a placed
 * widget's `libId`) so pre-existing localStorage data keeps resolving to
 * the right catalog entry instead of silently losing its favorite star or
 * its Settings-panel category label after a rename.
 *
 * Append to this table, never remove/rewrite an entry once shipped — old
 * localStorage data can be arbitrarily old.
 */
export const LEGACY_ID_REMAP: Record<string, string> = {
  // Component/Preset migration (tech badges, tech icons)
  'lang-cpp': 'tech-lang-badge',
  'lang-python': 'tech-lang-badge',
  'lang-ts': 'tech-lang-badge',
  'lang-java': 'tech-lang-badge',
  'fw-react': 'tech-icon-picker',
  'fw-node': 'tech-icon-picker',
  'fw-spring': 'tech-icon-picker',
  // {tag}-{username}-projectname.json filename convention (2026-08)
  'kyechan99-decoration-capsule-render': 'decoration-kyechan99-capsule-render',
  'naereen-emotion-ask-me-anything': 'emotion-naereen-ask-me-anything',
  'readme-svg-decoration-animated-line': 'decoration-readme-svg-animated-line',
  'zhravan-emotion-github-readme-quotes': 'emotion-zhravan-github-readme-quotes',
  'decoration-markdown-box': 'decoration-jongeuni-markdown-box',
  'decoration-typing-svg': 'decoration-denvercoder1-typing-svg',
  'status-github-snake': 'status-platane-github-snake',
  'status-github-stats': 'status-anuraghazra-github-stats',
  'status-github-streak': 'status-denvercoder1-github-streak',
  'status-profile-views': 'status-antonkomarev-profile-views',
};
