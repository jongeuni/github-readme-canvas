import type { UrlComponentMeta } from '../../types/urlComponent';
import type { SerializedTextBlock } from '../../types/document';

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

/** Same meta as the Library's "GitHub Repository Badge" card — one metric
 *  preset (stars/issues/license/...) per real urlTemplate, always keyed on
 *  {owner, repo} with the repo link computed automatically. */
function githubRepoMeta(urlTemplate: string): UrlComponentMeta {
  return {
    urlTemplate,
    linkTemplate: 'https://github.com/{owner}/{repo}',
    linkable: false,
    fields: [
      { key: 'owner', label: 'Repository Owner', type: 'text' },
      { key: 'repo', label: 'Repository Name', type: 'text' },
    ],
  };
}

export const GITHUB_STARS_META = githubRepoMeta('https://img.shields.io/github/stars/{owner}/{repo}?style=social');
export const GITHUB_ISSUES_META = githubRepoMeta('https://img.shields.io/github/issues/{owner}/{repo}?style=flat');
export const GITHUB_LICENSE_META = githubRepoMeta('https://img.shields.io/github/license/{owner}/{repo}?style=flat');

/** Same meta as the Library's "Custom Badge" card — label/message/color/
 *  logo, freely combined, for a one-off badge no other component covers. */
export const GENERIC_BADGE_META: UrlComponentMeta = {
  urlTemplate: 'https://img.shields.io/badge/{label}{-message}-{color}?style={style}&logo={logo}&logoColor={logoColor}',
  linkable: true,
  fields: [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'message', label: 'Message', type: 'text' },
    {
      key: 'color',
      label: 'Color',
      type: 'combo',
      options: [
        { value: 'blue', label: 'blue' },
        { value: 'green', label: 'green' },
        { value: 'red', label: 'red' },
        { value: 'orange', label: 'orange' },
        { value: 'purple', label: 'purple' },
        { value: 'black', label: 'black' },
        { value: 'gray', label: 'gray' },
      ],
    },
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
    { key: 'logo', label: 'Logo', type: 'combo', options: [{ value: 'gmail', label: 'gmail' }, { value: 'github', label: 'github' }] },
    { key: 'logoColor', label: 'Logo Color', type: 'text' },
  ],
};

/** Same meta as the Library's "Capsule Render Banner" card (header section —
 *  the only variant that's a real, addable component; there is no separate
 *  footer preset, so templates that want a closing banner reuse this one). */
export const CAPSULE_RENDER_META: UrlComponentMeta = {
  urlTemplate: 'https://capsule-render.vercel.app/api?type={type}&color={color}&height={height}&section=header&text={text}&fontSize={fontSize}',
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
    { key: 'height', label: 'Height', type: 'number', min: 100, max: 400, step: 10 },
    { key: 'fontSize', label: 'Font Size', type: 'number', min: 20, max: 120, step: 5 },
  ],
};

/** A small "made with" attribution line, same idea as most site/README
 *  builders' own default footer — just a plain text line like anything
 *  else on the canvas, so it's exactly as removable as any other line
 *  (click it, "Remove line"). Appended last in every template and the
 *  initial seed content. */
export const MADE_WITH_FOOTER: SerializedTextBlock = {
  kind: 'text',
  className: 'md-text',
  html: 'Made with <a href="https://readme-canvas.com">Readme Canvas</a>',
  align: 'center',
};
