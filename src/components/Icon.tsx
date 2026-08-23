/**
 * A single inline SVG sprite sheet (rendered once, hidden) plus a small
 * <Icon name="..."/> helper that references a symbol via <use>. Mirrors the
 * icon set from the original design spec.
 */
export function IconSprite() {
  return (
    <svg style={{ display: 'none' }}>
      <symbol id="i-search" viewBox="0 0 20 20">
        <circle cx="9" cy="9" r="6" />
        <line x1="17" y1="17" x2="13.4" y2="13.4" />
      </symbol>
      <symbol id="i-close" viewBox="0 0 20 20">
        <line x1="5" y1="5" x2="15" y2="15" />
        <line x1="15" y1="5" x2="5" y2="15" />
      </symbol>
      <symbol id="i-copy" viewBox="0 0 20 20">
        <rect x="7" y="7" width="9" height="9" rx="1.5" />
        <path d="M4 13V5.5A1.5 1.5 0 0 1 5.5 4H13" />
      </symbol>
      <symbol id="i-trash" viewBox="0 0 20 20">
        <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6M6 6l.6 9a1.5 1.5 0 0 0 1.5 1.4h3.8a1.5 1.5 0 0 0 1.5-1.4L14 6" />
      </symbol>
      <symbol id="i-code" viewBox="0 0 20 20">
        <polyline points="7,5 2,10 7,15" />
        <polyline points="13,5 18,10 13,15" />
      </symbol>
      <symbol id="i-cursor" viewBox="0 0 20 20">
        <path d="M5 3l10 8-4.3.8L13 16l-2 1-2.3-4.6L5 15z" />
      </symbol>
      <symbol id="i-github" viewBox="0 0 20 20">
        <path d="M10 2a8 8 0 0 0-2.5 15.6c.4.1.55-.2.55-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-1-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.5.8 1.3.8 2.1 0 3-1.8 3.6-3.6 3.9.3.3.6.8.6 1.6v2.4c0 .2.1.5.6.4A8 8 0 0 0 10 2z" />
      </symbol>
      <symbol id="i-linkedin" viewBox="0 0 20 20">
        <rect x="2" y="2" width="16" height="16" rx="2" />
        <line x1="6" y1="8.5" x2="6" y2="14" />
        <circle cx="6" cy="5.5" r="0.2" />
        <path d="M9.5 14V8.5M9.5 10.5c0-1.1.9-2 2-2s2 .9 2 2V14" />
      </symbol>
      <symbol id="i-twitter" viewBox="0 0 20 20">
        <path d="M4 4l12 12M16 4L4 16" />
      </symbol>
      <symbol id="i-star" viewBox="0 0 20 20">
        <path d="M10 2.5l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.6 5-.7z" strokeLinejoin="round" />
      </symbol>
      <symbol id="i-plus" viewBox="0 0 20 20">
        <line x1="10" y1="4" x2="10" y2="16" />
        <line x1="4" y1="10" x2="16" y2="10" />
      </symbol>
      <symbol id="i-edit" viewBox="0 0 20 20">
        <path d="M13.4 3.6l3 3L6.8 16.2l-4 1 1-4z" strokeLinejoin="round" />
      </symbol>
      <symbol id="i-chevron-down" viewBox="0 0 20 20">
        <polyline points="5,8 10,13 15,8" />
      </symbol>
      <symbol id="i-layout" viewBox="0 0 20 20">
        <rect x="3" y="3" width="14" height="14" rx="1.5" />
        <line x1="3" y1="7.5" x2="17" y2="7.5" />
        <line x1="8" y1="7.5" x2="8" y2="17" />
      </symbol>
    </svg>
  );
}

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={`icon ${className ?? ''}`}>
      <use href={`#i-${name}`} />
    </svg>
  );
}
