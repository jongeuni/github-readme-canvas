import type { Template } from '../../types/document';
import { BADGE_META, CAPSULE_FOOTER_META } from './meta';

/** An ad-hoc, non-editable-field badge — same shape parseMarkdownToBlocks
 *  reconstructs for a plain pasted badge: a fixed literal URL in
 *  urlTemplate (fillUrlTemplate is a no-op with no `{}` tokens), no fields.
 *  Used here for GitHub-computed badges (status/license/stars/issues) that
 *  don't need the label/color/style form BADGE_META offers. */
function staticBadge(alt: string, url: string, link?: string): { urlTemplate: string; altTemplate: string; linkable: boolean; fields: never[]; linkTemplate?: string } {
  return { urlTemplate: url, altTemplate: alt, linkable: !!link, fields: [], ...(link ? { linkTemplate: link } : {}) };
}

/**
 * A general-purpose open-source project README — centered hero, About,
 * Features, Preview, Tech Stack by layer, Architecture, Project Structure,
 * Getting Started, Development conventions, Stats, Contributors, Roadmap,
 * and Contact. Long by design — it's meant to be trimmed down, not filled
 * in top to bottom.
 */
export const projectReadmeTemplate: Template = {
  id: 'tpl-project-readme',
  name: 'Project README',
  description: 'A general-purpose open-source project README — features, architecture, setup, and more.',
  blocks: [
    { kind: 'text', className: 'md-h1', html: '✨ PROJECT NAME', align: 'center' },
    { kind: 'text', className: 'md-h3', html: 'One-line description of your project.', align: 'center' },
    {
      kind: 'widget',
      libId: 'status-badge',
      type: 'url-component',
      name: 'Status',
      settings: {},
      meta: staticBadge('Status', 'https://img.shields.io/badge/Status-In%20Progress-8B5CF6?style=flat-square'),
      align: 'center',
    },
    {
      kind: 'widget',
      libId: 'license-badge',
      type: 'url-component',
      name: 'License',
      settings: {},
      meta: staticBadge('License', 'https://img.shields.io/github/license/YOUR_USERNAME/YOUR_REPOSITORY?style=flat-square'),
      align: 'center',
    },
    {
      kind: 'widget',
      libId: 'stars-badge',
      type: 'url-component',
      name: 'Stars',
      settings: {},
      meta: staticBadge('Stars', 'https://img.shields.io/github/stars/YOUR_USERNAME/YOUR_REPOSITORY?style=flat-square'),
      align: 'center',
    },
    {
      kind: 'widget',
      libId: 'issues-badge',
      type: 'url-component',
      name: 'Issues',
      settings: {},
      meta: staticBadge('Issues', 'https://img.shields.io/github/issues/YOUR_USERNAME/YOUR_REPOSITORY?style=flat-square'),
      align: 'center',
    },
    { kind: 'widget', libId: 'image', type: 'image', name: 'Project Preview', settings: { url: 'https://placehold.co/900x500/png?text=Project+Preview', width: '90%', alt: 'Project preview' }, align: 'center' },
    {
      kind: 'text',
      className: 'md-text',
      html: '<a href="#-about">About</a> · <a href="#-features">Features</a> · <a href="#-tech-stack">Tech Stack</a> · <a href="#-architecture">Architecture</a> · <a href="#-getting-started">Getting Started</a>',
      align: 'center',
    },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '🌷 About' },
    { kind: 'text', className: 'md-quote', html: 'What problem does <strong>PROJECT NAME</strong> solve?' },
    {
      kind: 'text',
      className: 'md-text',
      html: "Describe your project here. Who it's for, what problem it solves, and why you built it — short and clear is best.",
    },
    {
      kind: 'widget',
      libId: 'dec-codeblock',
      type: 'code-block',
      name: 'Code Block',
      settings: { lang: 'text', code: '💭 Problem\n    │\n    ▼\n🧩 Solution\n    │\n    ▼\n✨ Experience' },
      align: 'center',
    },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '🐣 Features' },
    {
      kind: 'widget',
      libId: 'dec-table',
      type: 'table',
      name: 'Table',
      settings: {
        source:
          '| 🎀 Feature 01 | 🧸 Feature 02 | 🍓 Feature 03 |\n| :---: | :---: | :---: |\n| A short description of the feature | A short description of the feature | A short description of the feature |',
      },
    },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '🖼️ Preview' },
    { kind: 'text', className: 'md-h3', html: '🏠 Main' },
    { kind: 'widget', libId: 'image', type: 'image', name: 'Main Screen', settings: { url: 'https://placehold.co/1000x600/png?text=Main+Screen', width: '100%', alt: 'Main screen' } },
    { kind: 'text', className: 'md-h3', html: '✨ Feature' },
    { kind: 'widget', libId: 'image', type: 'image', name: 'Feature Screen', settings: { url: 'https://placehold.co/1000x600/png?text=Feature+Screen', width: '100%', alt: 'Feature screen' } },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '🛠️ Tech Stack' },
    { kind: 'text', className: 'md-h3', html: 'Frontend', align: 'center' },
    { kind: 'widget', libId: 'fw-react', type: 'tech-icon', name: 'React', settings: { size: 40, link: 'https://react.dev', align: 'left' }, meta: { glyph: '⚛', tileColor: '#20232a', slug: 'react' }, align: 'center' },
    { kind: 'widget', libId: 'lang-ts', type: 'url-component', name: 'TypeScript', settings: { label: 'TypeScript', link: 'https://typescriptlang.org', style: 'flat', color: 'blue' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'lang-nextjs', type: 'url-component', name: 'Next.js', settings: { label: 'Next.js', link: 'https://nextjs.org', style: 'flat', color: 'black' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'tool-tailwind', type: 'url-component', name: 'Tailwind CSS', settings: { label: 'Tailwind CSS', link: 'https://tailwindcss.com', style: 'flat', color: 'blue' }, meta: BADGE_META, align: 'center' },
    { kind: 'text', className: 'md-h3', html: 'Backend', align: 'center' },
    { kind: 'widget', libId: 'lang-java', type: 'url-component', name: 'Java', settings: { label: 'Java', link: 'https://java.com', style: 'flat', color: 'orange' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'fw-spring', type: 'tech-icon', name: 'Spring', settings: { size: 40, link: 'https://spring.io', align: 'left' }, meta: { glyph: '🍃', tileColor: '#6DB33F', slug: 'spring' }, align: 'center' },
    { kind: 'widget', libId: 'fw-node', type: 'tech-icon', name: 'Node.js', settings: { size: 40, link: 'https://nodejs.org', align: 'left' }, meta: { glyph: '⬡', tileColor: '#333333', slug: 'nodejs' }, align: 'center' },
    { kind: 'widget', libId: 'fw-nestjs', type: 'url-component', name: 'NestJS', settings: { label: 'NestJS', link: 'https://nestjs.com', style: 'flat', color: 'red' }, meta: BADGE_META, align: 'center' },
    { kind: 'text', className: 'md-h3', html: 'Database', align: 'center' },
    { kind: 'widget', libId: 'db-postgres', type: 'url-component', name: 'PostgreSQL', settings: { label: 'PostgreSQL', link: 'https://postgresql.org', style: 'flat', color: 'blue' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'db-mysql', type: 'url-component', name: 'MySQL', settings: { label: 'MySQL', link: 'https://mysql.com', style: 'flat', color: 'orange' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'db-mongo', type: 'url-component', name: 'MongoDB', settings: { label: 'MongoDB', link: 'https://mongodb.com', style: 'flat', color: 'green' }, meta: BADGE_META, align: 'center' },
    { kind: 'text', className: 'md-h3', html: 'Infrastructure', align: 'center' },
    { kind: 'widget', libId: 'tool-docker', type: 'url-component', name: 'Docker', settings: { label: 'Docker', link: 'https://docker.com', style: 'flat', color: 'blue' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'tool-gh-actions', type: 'url-component', name: 'GitHub Actions', settings: { label: 'GitHub Actions', link: 'https://github.com/features/actions', style: 'flat', color: 'black' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'tool-aws', type: 'url-component', name: 'AWS', settings: { label: 'AWS', link: 'https://aws.amazon.com', style: 'flat', color: 'orange' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '🧩 Architecture' },
    {
      kind: 'widget',
      libId: 'dec-codeblock',
      type: 'code-block',
      name: 'Code Block',
      settings: {
        lang: 'text',
        code:
          '                     ┌──────────────┐\n' +
          '                     │    Client    │\n' +
          '                     └──────┬───────┘\n' +
          '                            │\n' +
          '                            ▼\n' +
          '                   ┌────────────────┐\n' +
          '                   │    Frontend    │\n' +
          '                   └───────┬────────┘\n' +
          '                           │\n' +
          '                           ▼\n' +
          '                   ┌────────────────┐\n' +
          '                   │       API      │\n' +
          '                   └───────┬────────┘\n' +
          '                           │\n' +
          '                ┌──────────┴──────────┐\n' +
          '                ▼                     ▼\n' +
          '         ┌─────────────┐      ┌──────────────┐\n' +
          '         │    Server   │      │  External API │\n' +
          '         └──────┬──────┘      └──────────────┘\n' +
          '                │\n' +
          '                ▼\n' +
          '         ┌─────────────┐\n' +
          '         │   Database  │\n' +
          '         └─────────────┘',
      },
    },
    { kind: 'text', className: 'md-quote', html: "Replace this with your project's actual architecture diagram or image." },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '🌱 Project Structure' },
    {
      kind: 'widget',
      libId: 'dec-codeblock',
      type: 'code-block',
      name: 'Code Block',
      settings: {
        lang: 'text',
        code: '📦 project\n ┣ 📂 src\n ┃ ┣ 📂 components\n ┃ ┣ 📂 pages\n ┃ ┣ 📂 hooks\n ┃ ┣ 📂 services\n ┃ ┗ 📂 utils\n ┣ 📂 public\n ┣ 📜 package.json\n ┗ 📜 README.md',
      },
    },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '🚀 Getting Started' },
    { kind: 'text', className: 'md-h3', html: '1. Clone' },
    { kind: 'widget', libId: 'dec-codeblock', type: 'code-block', name: 'Code Block', settings: { lang: 'bash', code: 'git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git\ncd YOUR_REPOSITORY' } },
    { kind: 'text', className: 'md-h3', html: '2. Install' },
    { kind: 'widget', libId: 'dec-codeblock', type: 'code-block', name: 'Code Block', settings: { lang: 'bash', code: 'npm install' } },
    { kind: 'text', className: 'md-h3', html: '3. Environment' },
    { kind: 'text', className: 'md-text', html: 'Create a <code>.env</code> file and set the environment variables you need.' },
    { kind: 'widget', libId: 'dec-codeblock', type: 'code-block', name: 'Code Block', settings: { lang: 'env', code: 'API_URL=\nDATABASE_URL=' } },
    { kind: 'text', className: 'md-h3', html: '4. Run' },
    { kind: 'widget', libId: 'dec-codeblock', type: 'code-block', name: 'Code Block', settings: { lang: 'bash', code: 'npm run dev' } },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '💡 Development' },
    { kind: 'text', className: 'md-h3', html: 'Branch' },
    {
      kind: 'widget',
      libId: 'dec-codeblock',
      type: 'code-block',
      name: 'Code Block',
      settings: { lang: 'text', code: 'main\n │\n ├── develop\n │    │\n │    ├── feature/xxx\n │    ├── feature/xxx\n │    └── fix/xxx\n │\n └── release' },
    },
    { kind: 'text', className: 'md-h3', html: 'Commit Convention' },
    {
      kind: 'widget',
      libId: 'dec-table',
      type: 'table',
      name: 'Table',
      settings: {
        source:
          '| Prefix | Description |\n| :---: | --- |\n| feat | New feature |\n| fix | Bug fix |\n| refactor | Code restructuring |\n| docs | Documentation changes |\n| style | Style-only changes |\n| chore | Miscellaneous |',
      },
    },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '🧸 Contributors' },
    { kind: 'text', className: 'md-text', html: '<strong>YOUR NAME</strong> — 🌱 Developer', align: 'center' },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '🗺️ Roadmap' },
    { kind: 'text', className: 'md-task', html: '<input type="checkbox" contenteditable="false" checked="">Project planning' },
    { kind: 'text', className: 'md-task', html: '<input type="checkbox" contenteditable="false" checked="">Core features implemented' },
    { kind: 'text', className: 'md-task', html: '<input type="checkbox" contenteditable="false">Write tests' },
    { kind: 'text', className: 'md-task', html: '<input type="checkbox" contenteditable="false">Performance improvements' },
    { kind: 'text', className: 'md-task', html: '<input type="checkbox" contenteditable="false">Deployment' },
    { kind: 'text', className: 'md-task', html: '<input type="checkbox" contenteditable="false">Add new features' },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '📮 Contact' },
    {
      kind: 'widget',
      libId: 'contact-email',
      type: 'url-component',
      name: 'Email',
      settings: {},
      meta: staticBadge('Email', 'https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white', 'mailto:YOUR_EMAIL'),
      align: 'center',
    },
    {
      kind: 'widget',
      libId: 'contact-github',
      type: 'url-component',
      name: 'GitHub',
      settings: {},
      meta: staticBadge('GitHub', 'https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white', 'https://github.com/YOUR_USERNAME'),
      align: 'center',
    },
    { kind: 'text', className: 'md-h3', html: '🌷 Thanks for visiting!', align: 'center' },
    { kind: 'text', className: 'md-text', html: 'If this project was helpful, please consider giving it a ⭐', align: 'center' },
    {
      kind: 'widget',
      libId: 'footer-capsule',
      type: 'url-component',
      name: 'Capsule Render Banner',
      settings: { text: '', type: 'waving', color: 'auto', height: '120', fontSize: '40' },
      meta: CAPSULE_FOOTER_META,
      align: 'center',
    },
  ],
};
