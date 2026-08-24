export type Align = 'left' | 'center' | 'right';

export interface TechIconSettings {
  size: number;
  link: string;
  align: Align;
}

export interface TechIconMeta {
  glyph: string;
  tileColor: string;
  slug: string;
  [key: string]: unknown;
}
