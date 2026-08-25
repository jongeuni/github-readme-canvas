import { describe, expect, it } from 'vitest';
import { buildTocLines, slugify } from './generateToc';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('About Me')).toBe('about-me');
  });

  it('strips punctuation and emoji but keeps unicode letters', () => {
    expect(slugify('GitHub Stats 📊!')).toBe('github-stats');
    expect(slugify('설정 방법')).toBe('설정-방법');
  });
});

describe('buildTocLines', () => {
  it('returns an empty string when there are no headings', () => {
    expect(buildTocLines([])).toBe('');
  });

  it('indents relative to the shallowest heading present, not a fixed H1 baseline', () => {
    const source = buildTocLines([
      { level: 2, text: 'About Me' },
      { level: 3, text: 'Skills' },
    ]);
    expect(source).toBe('- [About Me](#about-me)\n  - [Skills](#skills)');
  });

  it('suffixes duplicate headings the way GitHub does', () => {
    const source = buildTocLines([
      { level: 1, text: 'Setup' },
      { level: 1, text: 'Setup' },
    ]);
    expect(source).toBe('- [Setup](#setup)\n- [Setup](#setup-1)');
  });

  it('skips headings with no text', () => {
    const source = buildTocLines([
      { level: 1, text: 'Intro' },
      { level: 1, text: '   ' },
      { level: 1, text: 'Outro' },
    ]);
    expect(source).toBe('- [Intro](#intro)\n- [Outro](#outro)');
  });
});
