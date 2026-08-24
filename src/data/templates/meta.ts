import type { UrlComponentMeta } from '../../types/urlComponent';

/**
 * Shared `url-component` meta shapes reused across template files — kept in
 * one place so every badge/stats/social/banner block a template embeds
 * matches exactly what placing that same Library entry would produce (see
 * templates/index.ts for the full convention note).
 */

export const BADGE_META: UrlComponentMeta = {
  urlTemplate: 'https://img.shields.io/badge/{label}-{color}?style={style}',
  altTemplate: '{label}',
  linkable: true,
  fields: [
    { key: 'label', label: 'Label', type: 'text' },
    {
      key: 'style',
      label: 'Style',
      type: 'select',
      options: [
        { value: 'flat', label: 'Flat' },
        { value: 'flat-square', label: 'Flat Square' },
        { value: 'for-the-badge', label: 'For The Badge' },
        { value: 'plastic', label: 'Plastic' },
      ],
    },
    {
      key: 'color',
      label: 'Color',
      type: 'color',
      options: [
        { value: 'blue', label: 'blue', swatch: '#2563eb' },
        { value: 'green', label: 'green', swatch: '#16a34a' },
        { value: 'red', label: 'red', swatch: '#dc2626' },
        { value: 'orange', label: 'orange', swatch: '#ea580c' },
        { value: 'purple', label: 'purple', swatch: '#9333ea' },
        { value: 'black', label: 'black', swatch: '#18181b' },
        { value: 'gray', label: 'gray', swatch: '#6b7280' },
      ],
    },
  ],
};

export const STATS_META: UrlComponentMeta = {
  urlTemplate: 'https://github-readme-stats.vercel.app/api?username={username}&show_icons=true&theme={theme}&hide={hide}',
  altTemplate: "{username}'s GitHub stats",
  linkable: false,
  fields: [
    { key: 'username', label: 'Username', type: 'text' },
    {
      key: 'theme',
      label: 'Theme',
      type: 'select',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'dark', label: 'Dark' },
        { value: 'radical', label: 'Radical' },
        { value: 'merko', label: 'Merko' },
      ],
    },
    {
      key: 'hide',
      label: 'Hide',
      type: 'checkbox-group',
      options: [
        { value: 'issues', label: 'Issues' },
        { value: 'prs', label: 'Pull Requests' },
        { value: 'contrib', label: 'Contributions' },
      ],
    },
  ],
};

export function socialMeta(logo: string, color: string, base: string): UrlComponentMeta {
  return {
    urlTemplate: `https://img.shields.io/badge/{label}-${color}?logo=${logo}&logoColor=white`,
    linkTemplate: `${base}{username}`,
    linkable: false,
    fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'username', label: 'Username', type: 'text' },
    ],
  };
}

export const SOCIAL_GITHUB_META = socialMeta('github', '18181b', 'https://github.com/');
export const SOCIAL_LINKEDIN_META = socialMeta('linkedin', '0a66c2', 'https://linkedin.com/in/');
export const SOCIAL_TWITTER_META = socialMeta('twitter', '18181b', 'https://x.com/');

/** capsule-render as a *footer* banner — same generator as the Library's
 *  "Capsule Render Banner" card, just with `section=footer` baked into the
 *  URL template instead of that preset's `section=header`. */
export const CAPSULE_FOOTER_META: UrlComponentMeta = {
  urlTemplate: 'https://capsule-render.vercel.app/api?type={type}&color={color}&height={height}&section=footer&text={text}&fontSize={fontSize}',
  altTemplate: '{text}',
  linkable: false,
  fields: [
    { key: 'text', label: 'Text', type: 'text' },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'waving', label: 'Waving' },
        { value: 'wave', label: 'Wave' },
        { value: 'rect', label: 'Rectangle' },
        { value: 'soft', label: 'Soft' },
        { value: 'rounded', label: 'Rounded' },
        { value: 'egg', label: 'Egg' },
        { value: 'shark', label: 'Shark' },
        { value: 'cylinder', label: 'Cylinder' },
        { value: 'transparent', label: 'Transparent' },
      ],
    },
    {
      key: 'color',
      label: 'Color',
      type: 'select',
      options: [
        { value: 'gradient', label: 'Gradient' },
        { value: 'auto', label: 'Auto' },
        { value: 'random', label: 'Random' },
        { value: '0099ff', label: 'Blue' },
        { value: '6a0dad', label: 'Purple' },
        { value: 'ff6666', label: 'Pink' },
      ],
    },
    { key: 'height', label: 'Height', type: 'number', min: 60, max: 300, step: 10 },
    { key: 'fontSize', label: 'Font Size', type: 'number', min: 12, max: 80, step: 2 },
  ],
};
