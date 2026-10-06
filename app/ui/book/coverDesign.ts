import {Binding, BindingId, bindingById, bindings} from '../../theme/tokens';
import {foldArabic} from '../../lib/text';

// A designed cover is derived from the book's title, so it is the same on
// every device, needs no backend field, and the preview while adding a book
// is exactly the cover the book gets. An uploaded photo always replaces it
// (Design Lock v2 §06).

export type Composition = 'framed' | 'band' | 'minimal' | 'block' | 'orb' | 'type';

const COMPOSITIONS: Composition[] = ['framed', 'band', 'minimal', 'block', 'orb', 'type'];

// Foil on a light cloth reads poorly, so framed and band covers use dark cloth.
const DARK_ONLY: ReadonlySet<Composition> = new Set(['framed', 'band']);

/** FNV-1a — small, stable, good enough to spread ids across designs. */
export const hash = (s: string, salt = 0): number => {
  let h = 0x811c9dc5 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

export interface CoverDesign {
  composition: Composition;
  binding: Binding;
}

export const designFor = (seed: string, override?: {composition?: Composition; binding?: BindingId}): CoverDesign => {
  const composition = override?.composition ?? COMPOSITIONS[hash(seed, 7) % COMPOSITIONS.length];
  if (override?.binding) {
    return {composition, binding: bindingById(override.binding)};
  }
  const pool = DARK_ONLY.has(composition) ? bindings.filter(b => !b.light) : bindings;
  return {composition, binding: pool[hash(seed, 31) % pool.length]};
};

// Cover title size as a fraction of cover width, by title length tier
// (≤ 8, 9–18, 19–34, > 34 characters), drawn for Markazi; Thmanyah and
// Newsreader are optically larger, so both run smaller.
const TIERS: Record<Composition, [number, number, number, number]> = {
  framed: [0.2, 0.165, 0.13, 0.105],
  band: [0.155, 0.135, 0.115, 0.1],
  minimal: [0.22, 0.17, 0.135, 0.11],
  block: [0.19, 0.15, 0.12, 0.1],
  orb: [0.22, 0.17, 0.135, 0.11],
  type: [0.26, 0.2, 0.16, 0.12],
};

/** A cover carries the title, not the subtitle: "The Courage to Be Disliked:
 * How to Free Yourself…" is set as "The Courage to Be Disliked". The full
 * title is always shown beside the cover. */
export const coverTitle = (title: string): string => {
  const main = title.split(/\s*[:：]\s+|\s+[—–]\s+/)[0].trim();
  return main.length >= 3 ? main : title.trim();
};

/** The seed a title designs its cover from: diacritics, letter variants and
 * case don't change the cover. */
export const coverSeed = (title: string): string => foldArabic(coverTitle(title)).replace(/\s+/g, ' ').trim() || 'untitled';

export const MAX_LINES: Record<Composition, number> = {framed: 4, band: 3, minimal: 4, block: 3, orb: 4, type: 6};

// Usable text width as a share of cover width, per composition's padding.
const MEASURE: Record<Composition, number> = {framed: 0.72, band: 0.76, minimal: 0.76, block: 0.78, orb: 0.76, type: 0.8};
// Average advance per character, in ems — generous so a word never breaks.
const ADVANCE = {latin: 0.56, arabic: 0.62};

export const titleSize = (composition: Composition, title: string, width: number, latin: boolean): number => {
  const n = [...title.trim()].length;
  const tier = n <= 8 ? 0 : n <= 18 ? 1 : n <= 34 ? 2 : 3;
  const bySize = TIERS[composition][tier] * width * (latin ? 0.9 : 0.8);
  // A single word must fit on one line: Android hard-breaks a word that is
  // wider than the line ("Meditatio/ns").
  const longest = Math.max(...title.trim().split(/\s+/).map(w => [...w].length), 1);
  const byWord = (MEASURE[composition] * width) / (longest * (latin ? ADVANCE.latin : ADVANCE.arabic));
  return Math.round(Math.min(bySize, byWord) * 10) / 10;
};
