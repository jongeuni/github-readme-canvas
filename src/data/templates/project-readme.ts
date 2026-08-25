import type { Template } from '../../types/document';
import {
  BADGE_META,
  CAPSULE_RENDER_META,
  GENERIC_BADGE_META,
  GITHUB_ISSUES_META,
  GITHUB_LICENSE_META,
  GITHUB_STARS_META,
  MADE_WITH_FOOTER,
  SOCIAL_GITHUB_META,
} from './meta';

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
      libId: 'generic-badge',
      type: 'url-component',
      name: 'Custom Badge',
      settings: { label: 'Status', message: 'In Progress', color: '8B5CF6', style: 'flat-square', logo: '', logoColor: '', link: '' },
      meta: GENERIC_BADGE_META,
      align: 'center',
    },
    {
      kind: 'widget',
      libId: 'status-github-license',
      type: 'url-component',
      name: 'License',
      settings: { owner: 'YOUR_USERNAME', repo: 'YOUR_REPOSITORY' },
      meta: GITHUB_LICENSE_META,
      align: 'center',
    },
    { kind: 'text', className: 'md-text', html: '', align: 'center' },
    {
      kind: 'widget',
      libId: 'status-github-stars',
      type: 'url-component',
      name: 'Stars',
      settings: { owner: 'YOUR_USERNAME', repo: 'YOUR_REPOSITORY' },
      meta: GITHUB_STARS_META,
      align: 'center',
    },
    {
      kind: 'widget',
      libId: 'status-github-issues',
      type: 'url-component',
      name: 'Open Issues',
      settings: { owner: 'YOUR_USERNAME', repo: 'YOUR_REPOSITORY' },
      meta: GITHUB_ISSUES_META,
      align: 'center',
    },
    { kind: 'widget', libId: 'image', type: 'image', name: 'Project Preview', settings: { url: 'https://placehold.co/900x500/png?text=Project+Preview', width: '50%', alt: 'Project preview' }, align: 'center' },
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
    { kind: 'widget', libId: 'image', type: 'image', name: 'Main Screen', settings: { url: 'https://placehold.co/1000x600/png?text=Main+Screen', width: '50%', alt: 'Main screen' }, align: 'center' },
    { kind: 'text', className: 'md-h3', html: '✨ Feature' },
    { kind: 'widget', libId: 'image', type: 'image', name: 'Feature Screen', settings: { url: 'https://placehold.co/1000x600/png?text=Feature+Screen', width: '50%', alt: 'Feature screen' }, align: 'center' },
    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },

    { kind: 'text', className: 'md-h2', html: '🛠️ Tech Stack' },
    { kind: 'text', className: 'md-h3', html: 'Frontend', align: 'center' },
    { kind: 'widget', libId: 'fw-react', type: 'tech-icon', name: 'React', settings: { size: 40, link: 'https://react.dev', align: 'left', slug: 'react' }, align: 'center' },
    { kind: 'widget', libId: 'lang-ts', type: 'url-component', name: 'TypeScript', settings: { label: 'TypeScript', link: 'https://typescriptlang.org', style: 'flat', color: 'blue' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'fw-nextjs', type: 'tech-icon', name: 'Next.js', settings: { size: 40, link: 'https://nextjs.org', align: 'left', slug: 'nextjs' }, align: 'center' },
    { kind: 'widget', libId: 'fw-tailwind', type: 'tech-icon', name: 'Tailwind CSS', settings: { size: 40, link: 'https://tailwindcss.com', align: 'left', slug: 'tailwind' }, align: 'center' },
    { kind: 'text', className: 'md-h3', html: 'Backend', align: 'center' },
    { kind: 'widget', libId: 'lang-java', type: 'url-component', name: 'Java', settings: { label: 'Java', link: 'https://java.com', style: 'flat', color: 'orange' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'fw-spring', type: 'tech-icon', name: 'Spring Boot', settings: { size: 40, link: 'https://spring.io', align: 'left', slug: 'spring' }, align: 'center' },
    { kind: 'widget', libId: 'fw-nodejs', type: 'tech-icon', name: 'Node.js', settings: { size: 40, link: 'https://nodejs.org', align: 'left', slug: 'nodejs' }, align: 'center' },
    { kind: 'widget', libId: 'fw-nestjs', type: 'tech-icon', name: 'NestJS', settings: { size: 40, link: 'https://nestjs.com', align: 'left', slug: 'nestjs' }, align: 'center' },
    { kind: 'text', className: 'md-h3', html: 'Database', align: 'center' },
    { kind: 'widget', libId: 'db-postgres', type: 'url-component', name: 'PostgreSQL', settings: { label: 'PostgreSQL', link: 'https://postgresql.org', style: 'flat', color: 'blue' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'db-mysql', type: 'url-component', name: 'MySQL', settings: { label: 'MySQL', link: 'https://mysql.com', style: 'flat', color: 'orange' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'db-mongo', type: 'url-component', name: 'MongoDB', settings: { label: 'MongoDB', link: 'https://mongodb.com', style: 'flat', color: 'green' }, meta: BADGE_META, align: 'center' },
    { kind: 'text', className: 'md-h3', html: 'Infrastructure', align: 'center' },
    { kind: 'widget', libId: 'tool-docker', type: 'url-component', name: 'Docker', settings: { label: 'Docker', link: 'https://docker.com', style: 'flat', color: 'blue' }, meta: BADGE_META, align: 'center' },
    { kind: 'widget', libId: 'tool-githubactions', type: 'url-component', name: 'GitHub Actions', settings: { label: 'GitHub Actions', link: 'https://github.com/features/actions', style: 'flat', color: 'black' }, meta: BADGE_META, align: 'center' },
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
      libId: 'generic-badge',
      type: 'url-component',
      name: 'Custom Badge',
      settings: { label: 'Email', message: '', color: 'EA4335', style: 'flat-square', logo: 'gmail', logoColor: 'white', link: 'mailto:YOUR_EMAIL' },
      meta: GENERIC_BADGE_META,
      align: 'center',
    },
    {
      kind: 'widget',
      libId: 'social-github',
      type: 'url-component',
      name: 'GitHub',
      settings: { label: 'GitHub', username: 'YOUR_USERNAME' },
      meta: SOCIAL_GITHUB_META,
      align: 'center',
    },
    { kind: 'text', className: 'md-h3', html: '🌷 Thanks for visiting!', align: 'center' },
    { kind: 'text', className: 'md-text', html: 'If this project was helpful, please consider giving it a ⭐', align: 'center' },
    {
      kind: 'widget',
      libId: 'decoration-kyechan99-capsule-render',
      type: 'url-component',
      name: 'Capsule Render Banner',
      settings: { text: 'Thanks for stopping by! 🌱', type: 'waving', color: 'auto', height: '120', fontSize: '40' },
      meta: CAPSULE_RENDER_META,
      align: 'center',
    },

    // Freely removable — see MADE_WITH_FOOTER's own doc comment.
    MADE_WITH_FOOTER,
  ],
};
