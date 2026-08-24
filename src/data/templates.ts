import type { Template } from '../types/document';
import type { UrlComponentMeta } from '../types/urlComponent';

/**
 * Whole-document starting points for the Templates picker (see
 * TemplatesMenu.tsx). Each `blocks` array is hand-authored in exactly the
 * shape serializeCanvas() would produce — see SerializedBlock in
 * types/document.ts — so it can be handed straight to editor.loadFromBlocks.
 * Widget blocks reuse real library entries (see src/data/community-components/
 * for badge/techIcon/stats/social, src/components/widgets/divider for
 * divider) so libId/type/settings/meta match what placing that same
 * component from the Library would actually produce — for a 'url-component'
 * widget (badge/stats/social here) that includes `meta`, copied from that
 * entry's own JSON file, since the generic renderer reads urlTemplate/fields
 * from the placed instance's own meta, not from any shared registry lookup.
 *
 * To add a new template: add one entry here — nothing else needs to change,
 * same convention as adding a new badge/preset elsewhere in the app.
 */

const BADGE_META: UrlComponentMeta = {
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

const STATS_META: UrlComponentMeta = {
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

function socialMeta(logo: string, color: string, base: string): UrlComponentMeta {
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

const SOCIAL_GITHUB_META = socialMeta('github', '18181b', 'https://github.com/');
const SOCIAL_LINKEDIN_META = socialMeta('linkedin', '0a66c2', 'https://linkedin.com/in/');
const SOCIAL_TWITTER_META = socialMeta('twitter', '18181b', 'https://x.com/');

export const TEMPLATES: Template[] = [
  {
    id: 'tpl-minimal-dev',
    name: 'Minimal Developer',
    description: 'A clean, no-frills intro — bio, tech badges, GitHub stats, and social links.',
    blocks: [
      { kind: 'text', className: 'md-h1', html: "Hi there, I'm Jordan 👋" },
      { kind: 'text', className: 'md-text', html: 'Software engineer who enjoys building clean, useful things.' },
      { kind: 'widget', libId: 'lang-ts', type: 'url-component', name: 'TypeScript', settings: { label: 'TypeScript', link: 'https://typescriptlang.org', style: 'flat', color: 'blue' }, meta: BADGE_META },
      { kind: 'widget', libId: 'lang-python', type: 'url-component', name: 'Python', settings: { label: 'Python', link: 'https://python.org', style: 'flat', color: 'green' }, meta: BADGE_META },
      { kind: 'widget', libId: 'tool-git', type: 'url-component', name: 'Git', settings: { label: 'Git', link: 'https://git-scm.com', style: 'flat', color: 'gray' }, meta: BADGE_META },
      { kind: 'widget', libId: 'tool-docker', type: 'url-component', name: 'Docker', settings: { label: 'Docker', link: 'https://docker.com', style: 'flat', color: 'blue' }, meta: BADGE_META },
      { kind: 'text', className: 'md-h2', html: 'About Me' },
      {
        kind: 'text',
        className: 'md-text',
        html: "I'm a backend-leaning full-stack developer with a few years of experience shipping production software. I care about readable code, small PRs, and tests that actually catch bugs.",
      },
      { kind: 'text', className: 'md-quote', html: 'Simple is better than clever.' },
      { kind: 'text', className: 'md-h2', html: 'GitHub Stats' },
      {
        kind: 'widget',
        libId: 'stats-github',
        type: 'url-component',
        name: 'GitHub Stats',
        settings: { username: 'yourusername', theme: 'default', hide: '' },
        meta: STATS_META,
      },
      { kind: 'text', className: 'md-h2', html: 'Connect with me' },
      { kind: 'widget', libId: 'social-github', type: 'url-component', name: 'GitHub', settings: { username: 'yourusername', label: 'GitHub' }, meta: SOCIAL_GITHUB_META },
      { kind: 'widget', libId: 'social-linkedin', type: 'url-component', name: 'LinkedIn', settings: { username: 'yourusername', label: 'LinkedIn' }, meta: SOCIAL_LINKEDIN_META },
    ],
  },
  {
    id: 'tpl-full-portfolio',
    name: 'Full Portfolio',
    description: 'A fuller profile — tagline, currently-working-on checklist, tech stack, and stats.',
    blocks: [
      { kind: 'text', className: 'md-h1', html: "Hey, I'm Jordan 🚀" },
      { kind: 'text', className: 'md-quote', html: 'Turning coffee into code, one commit at a time.' },
      { kind: 'text', className: 'md-h2', html: '🧑‍💻 About Me' },
      { kind: 'text', className: 'md-text', html: "I'm a full-stack developer who loves open source, clean architecture, and the occasional all-nighter chasing a bug." },
      { kind: 'text', className: 'md-ul-item', html: '🔭 Currently working on <strong>an AI-powered dev tool</strong>' },
      { kind: 'text', className: 'md-ul-item', html: '🌱 Currently learning <strong>Rust</strong> and distributed systems' },
      { kind: 'text', className: 'md-task', html: '<input type="checkbox" contenteditable="false" checked="">Actively contributing to open source' },
      { kind: 'text', className: 'md-task', html: '<input type="checkbox" contenteditable="false">Open to new opportunities' },
      { kind: 'text', className: 'md-h2', html: '🛠️ Tech Stack' },
      { kind: 'widget', libId: 'lang-cpp', type: 'url-component', name: 'C++', settings: { label: 'C++', link: 'https://isocpp.org', style: 'flat', color: 'blue' }, meta: BADGE_META },
      { kind: 'widget', libId: 'lang-java', type: 'url-component', name: 'Java', settings: { label: 'Java', link: 'https://java.com', style: 'flat', color: 'orange' }, meta: BADGE_META },
      { kind: 'widget', libId: 'lang-go', type: 'url-component', name: 'Go', settings: { label: 'Go', link: 'https://go.dev', style: 'flat', color: 'blue' }, meta: BADGE_META },
      { kind: 'widget', libId: 'lang-rust', type: 'url-component', name: 'Rust', settings: { label: 'Rust', link: 'https://rust-lang.org', style: 'flat', color: 'orange' }, meta: BADGE_META },
      { kind: 'widget', libId: 'db-postgres', type: 'url-component', name: 'PostgreSQL', settings: { label: 'PostgreSQL', link: 'https://postgresql.org', style: 'flat', color: 'blue' }, meta: BADGE_META },
      { kind: 'widget', libId: 'db-mongo', type: 'url-component', name: 'MongoDB', settings: { label: 'MongoDB', link: 'https://mongodb.com', style: 'flat', color: 'green' }, meta: BADGE_META },
      { kind: 'widget', libId: 'fw-react', type: 'tech-icon', name: 'React', settings: { size: 40, link: 'https://react.dev', align: 'left' }, meta: { glyph: '⚛', tileColor: '#20232a', slug: 'react' } },
      { kind: 'widget', libId: 'fw-node', type: 'tech-icon', name: 'Node.js', settings: { size: 40, link: 'https://nodejs.org', align: 'left' }, meta: { glyph: '⬡', tileColor: '#333333', slug: 'nodejs' } },
      { kind: 'widget', libId: 'fw-spring', type: 'tech-icon', name: 'Spring', settings: { size: 40, link: 'https://spring.io', align: 'left' }, meta: { glyph: '🍃', tileColor: '#6DB33F', slug: 'spring' } },
      { kind: 'text', className: 'md-h2', html: '📊 GitHub Stats' },
      {
        kind: 'widget',
        libId: 'stats-github',
        type: 'url-component',
        name: 'GitHub Stats',
        settings: { username: 'yourusername', theme: 'default', hide: '' },
        meta: STATS_META,
      },
      { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },
      { kind: 'text', className: 'md-h2', html: '📫 Connect with me' },
      { kind: 'widget', libId: 'social-github', type: 'url-component', name: 'GitHub', settings: { username: 'yourusername', label: 'GitHub' }, meta: SOCIAL_GITHUB_META },
      { kind: 'widget', libId: 'social-linkedin', type: 'url-component', name: 'LinkedIn', settings: { username: 'yourusername', label: 'LinkedIn' }, meta: SOCIAL_LINKEDIN_META },
      { kind: 'widget', libId: 'social-twitter', type: 'url-component', name: 'X', settings: { username: 'yourusername', label: 'X' }, meta: SOCIAL_TWITTER_META },
    ],
  },
];
