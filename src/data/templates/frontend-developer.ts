import type { Template } from '../../types/document';
import { BADGE_META, MADE_WITH_FOOTER } from './meta';

/**
 * A frontend-developer profile README — bio, a "design → experience" flow
 * diagram, tech stack by category, a development-philosophy table, two
 * featured-project write-ups, and a closing "things I care about" list.
 */
export const frontendDeveloperTemplate: Template = {
  id: 'tpl-frontend-developer',
  name: 'Frontend Developer',
  description: 'A UI-focused profile — dev philosophy, tech stack, and featured projects.',
  blocks: [
    { kind: 'text', className: 'md-h1', html: '🎨 Frontend Developer · UI Lover · Experience Maker' },
    { kind: 'text', className: 'md-quote', html: 'I care about every single interaction, down to the smallest detail.' },

    { kind: 'text', className: 'md-h2', html: '🐰 About Me' },
    { kind: 'text', className: 'md-text', html: "Hello! I'm a frontend developer who builds the very first screen users see, and designs the experience that flows through it." },
    { kind: 'text', className: 'md-text', html: "It doesn't stop at making a screen look good —" },
    { kind: 'widget', libId: 'dec-codeblock', type: 'code-block', name: 'Code Block', settings: { lang: 'text', code: '🎨 Design\n   ↓\n🧩 Component\n   ↓\n⚡ Interaction\n   ↓\n📱 Responsive\n   ↓\n💖 User Experience' } },
    { kind: 'text', className: 'md-text', html: 'I care about making sure this whole process connects naturally, end to end.' },

    { kind: 'text', className: 'md-h2', html: '🎨 Tech Stack' },
    { kind: 'text', className: 'md-text', html: '<strong>Frontend</strong>' },
    { kind: 'widget', libId: 'fw-react', type: 'tech-icon', name: 'React', settings: { size: 40, link: 'https://react.dev', align: 'left' }, meta: { glyph: '⚛', tileColor: '#20232a', slug: 'react' } },
    { kind: 'widget', libId: 'lang-ts', type: 'url-component', name: 'TypeScript', settings: { label: 'TypeScript', link: 'https://typescriptlang.org', style: 'flat', color: 'blue' }, meta: BADGE_META },
    { kind: 'widget', libId: 'lang-nextjs', type: 'url-component', name: 'Next.js', settings: { label: 'Next.js', link: 'https://nextjs.org', style: 'flat', color: 'black' }, meta: BADGE_META },
    { kind: 'text', className: 'md-text', html: '<strong>Styling</strong>' },
    { kind: 'widget', libId: 'tool-tailwind', type: 'url-component', name: 'Tailwind CSS', settings: { label: 'Tailwind CSS', link: 'https://tailwindcss.com', style: 'flat', color: 'blue' }, meta: BADGE_META },
    { kind: 'widget', libId: 'tool-sass', type: 'url-component', name: 'Sass', settings: { label: 'Sass', link: 'https://sass-lang.com', style: 'flat', color: 'red' }, meta: BADGE_META },
    { kind: 'text', className: 'md-text', html: '<strong>Tools</strong>' },
    { kind: 'widget', libId: 'tool-git', type: 'url-component', name: 'Git', settings: { label: 'Git', link: 'https://git-scm.com', style: 'flat', color: 'gray' }, meta: BADGE_META },
    { kind: 'widget', libId: 'tool-figma', type: 'url-component', name: 'Figma', settings: { label: 'Figma', link: 'https://figma.com', style: 'flat', color: 'purple' }, meta: BADGE_META },

    { kind: 'text', className: 'md-h2', html: '🧁 My Development Philosophy' },
    {
      kind: 'widget',
      libId: 'dec-table',
      type: 'table',
      name: 'Table',
      settings: {
        source:
          '| 🎀 UI | 🧩 Component | ⚡ UX | 🌱 Code |\n| --- | --- | --- | --- |\n| The screen users actually want to look at | A small, reusable unit done right | A natural, fast experience | Readable, growable structure |',
      },
    },

    { kind: 'text', className: 'md-h2', html: '🌷 Featured Projects' },
    { kind: 'text', className: 'md-h3', html: '🪄 Project A' },
    { kind: 'text', className: 'md-text', html: 'Describe your service in one sentence.' },
    { kind: 'text', className: 'md-text', html: '<code>React</code> <code>TypeScript</code> <code>API</code>' },
    { kind: 'text', className: 'md-text', html: '<a href="https://example.com">✨ View Project</a>' },
    { kind: 'text', className: 'md-h3', html: '🍓 Project B' },
    { kind: 'text', className: 'md-text', html: 'Describe your service in one sentence.' },
    { kind: 'text', className: 'md-text', html: '<code>Next.js</code> <code>TypeScript</code> <code>Tailwind</code>' },
    { kind: 'text', className: 'md-text', html: '<a href="https://example.com">✨ View Project</a>' },

    { kind: 'text', className: 'md-h2', html: '🐾 Little Things I Care About' },
    { kind: 'text', className: 'md-text', html: '<strong>Visual details</strong>' },
    { kind: 'text', className: 'md-ul-item', html: 'Spacing & alignment' },
    { kind: 'text', className: 'md-ul-item', html: 'A consistent design system' },
    { kind: 'text', className: 'md-ul-item', html: 'Small, thoughtful interactions' },
    { kind: 'text', className: 'md-ul-item', html: 'Mobile-first layouts' },
    { kind: 'text', className: 'md-text', html: '<strong>Component design</strong>' },
    { kind: 'text', className: 'md-ul-item', html: 'Reusable, composable components' },
    { kind: 'text', className: 'md-ul-item', html: 'Clear, single responsibilities' },
    { kind: 'text', className: 'md-ul-item', html: 'Thoughtful prop design' },
    { kind: 'text', className: 'md-ul-item', html: 'Structure that stays maintainable' },
    { kind: 'text', className: 'md-text', html: '<strong>User experience</strong>' },
    { kind: 'text', className: 'md-ul-item', html: 'Can users predict what happens next?' },
    { kind: 'text', className: 'md-ul-item', html: 'Do loading states feel natural?' },
    { kind: 'text', className: 'md-ul-item', html: "Do users stay oriented, even when something goes wrong?" },

    { kind: 'widget', libId: 'dec-divider', type: 'divider', name: 'Divider', settings: { style: 'line' } },
    { kind: 'text', className: 'md-text', html: "🌼 Let's build something delightful.", align: 'center' },

    // Freely removable — see MADE_WITH_FOOTER's own doc comment.
    MADE_WITH_FOOTER,
  ],
};
