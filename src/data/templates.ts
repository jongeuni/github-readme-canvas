import type { Template } from '../types/document';

/**
 * Whole-document starting points for the Templates picker (see
 * TemplatesMenu.tsx). Each `blocks` array is hand-authored in exactly the
 * shape serializeCanvas() would produce — see SerializedBlock in
 * types/document.ts — so it can be handed straight to editor.loadFromBlocks.
 * Widget blocks reuse real library entries (see the badge/techIcon/stats/
 * social/divider presets.ts files) so libId/type/settings/meta match what
 * placing that same component from the Library would actually produce.
 *
 * To add a new template: add one entry here — nothing else needs to change,
 * same convention as adding a new badge/preset elsewhere in the app.
 */
export const TEMPLATES: Template[] = [
  {
    id: 'tpl-minimal-dev',
    name: 'Minimal Developer',
    description: 'A clean, no-frills intro — bio, tech badges, GitHub stats, and social links.',
    blocks: [
      { kind: 'text', className: 'md-h1', html: "Hi there, I'm Jordan 👋" },
      { kind: 'text', className: 'md-text', html: 'Software engineer who enjoys building clean, useful things.' },
      { kind: 'widget', libId: 'lang-ts', type: 'badge', name: 'TypeScript', settings: { label: 'TypeScript', link: 'https://typescriptlang.org', style: 'flat', color: 'blue' } },
      { kind: 'widget', libId: 'lang-python', type: 'badge', name: 'Python', settings: { label: 'Python', link: 'https://python.org', style: 'flat', color: 'green' } },
      { kind: 'widget', libId: 'tool-git', type: 'badge', name: 'Git', settings: { label: 'Git', link: 'https://git-scm.com', style: 'flat', color: 'gray' } },
      { kind: 'widget', libId: 'tool-docker', type: 'badge', name: 'Docker', settings: { label: 'Docker', link: 'https://docker.com', style: 'flat', color: 'blue' } },
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
        type: 'stats',
        name: 'GitHub Stats',
        settings: { username: 'yourusername', theme: 'default', hideIssues: false, hidePRs: false, hideContrib: false },
      },
      { kind: 'text', className: 'md-h2', html: 'Connect with me' },
      { kind: 'widget', libId: 'social-github', type: 'social', name: 'GitHub', settings: { username: 'yourusername', label: 'GitHub', icon: 'github' } },
      { kind: 'widget', libId: 'social-linkedin', type: 'social', name: 'LinkedIn', settings: { username: 'yourusername', label: 'LinkedIn', icon: 'linkedin' } },
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
      { kind: 'widget', libId: 'lang-cpp', type: 'badge', name: 'C++', settings: { label: 'C++', link: 'https://isocpp.org', style: 'flat', color: 'blue' } },
      { kind: 'widget', libId: 'lang-java', type: 'badge', name: 'Java', settings: { label: 'Java', link: 'https://java.com', style: 'flat', color: 'orange' } },
      { kind: 'widget', libId: 'lang-go', type: 'badge', name: 'Go', settings: { label: 'Go', link: 'https://go.dev', style: 'flat', color: 'blue' } },
      { kind: 'widget', libId: 'lang-rust', type: 'badge', name: 'Rust', settings: { label: 'Rust', link: 'https://rust-lang.org', style: 'flat', color: 'orange' } },
      { kind: 'widget', libId: 'db-postgres', type: 'badge', name: 'PostgreSQL', settings: { label: 'PostgreSQL', link: 'https://postgresql.org', style: 'flat', color: 'blue' } },
      { kind: 'widget', libId: 'db-mongo', type: 'badge', name: 'MongoDB', settings: { label: 'MongoDB', link: 'https://mongodb.com', style: 'flat', color: 'green' } },
      { kind: 'widget', libId: 'fw-react', type: 'tech-icon', name: 'React', settings: { size: 40, link: 'https://react.dev', align: 'left' }, meta: { glyph: '⚛', tileColor: '#20232a', slug: 'react' } },
      { kind: 'widget', libId: 'fw-node', type: 'tech-icon', name: 'Node.js', settings: { size: 40, link: 'https://nodejs.org', align: 'left' }, meta: { glyph: '⬡', tileColor: '#333333', slug: 'nodejs' } },
      { kind: 'widget', libId: 'fw-spring', type: 'tech-icon', name: 'Spring', settings: { size: 40, link: 'https://spring.io', align: 'left' }, meta: { glyph: '🍃', tileColor: '#6DB33F', slug: 'spring' } },
      { kind: 'text', className: 'md-h2', html: '📊 GitHub Stats' },
      {
        kind: 'widget',
        libId: 'stats-github',
        type: 'stats',
        name: 'GitHub Stats',
        settings: { username: 'yourusername', theme: 'default', hideIssues: false, hidePRs: false, hideContrib: false },
      },
      { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },
      { kind: 'text', className: 'md-h2', html: '📫 Connect with me' },
      { kind: 'widget', libId: 'social-github', type: 'social', name: 'GitHub', settings: { username: 'yourusername', label: 'GitHub', icon: 'github' } },
      { kind: 'widget', libId: 'social-linkedin', type: 'social', name: 'LinkedIn', settings: { username: 'yourusername', label: 'LinkedIn', icon: 'linkedin' } },
      { kind: 'widget', libId: 'social-twitter', type: 'social', name: 'X', settings: { username: 'yourusername', label: 'X', icon: 'twitter' } },
    ],
  },
];
