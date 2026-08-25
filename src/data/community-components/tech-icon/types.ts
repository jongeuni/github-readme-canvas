export type Align = 'left' | 'center' | 'right';

export interface TechIconSettings {
  size: number;
  link: string;
  align: Align;
  /** A skillicons.dev icon slug (https://skillicons.dev/icons?i=<slug>) —
   *  e.g. "react", "postgresql". Free-typed in the Settings form's search
   *  field, not restricted to the curated preset list, so any icon
   *  skillicons.dev supports still works even without a named preset. */
  slug: string;
}
