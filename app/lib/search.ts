import {foldArabic} from './text';

// Matching that forgives what readers don't type: diacritics, tatweel, hamza
// forms, taa marbuta, alif maqsura, Arabic-Indic digits and case. Every folded
// character remembers where it came from, so a match can be marked in the
// original text.

const DROP = /[ً-ٰٟۖ-ۭـ]/;

export interface Folded {
  text: string;
  /** For each folded character, its index in the original string. */
  map: number[];
}

export const foldWithMap = (original: string): Folded => {
  let text = '';
  const map: number[] = [];
  for (let i = 0; i < original.length; i++) {
    const ch = original[i];
    if (DROP.test(ch)) {
      continue;
    }
    const f = foldArabic(ch);
    for (let k = 0; k < f.length; k++) {
      text += f[k];
      map.push(i);
    }
  }
  return {text, map};
};

export const foldQuery = (q: string) => foldArabic(q).replace(/[ً-ٰٟـ]/g, '').replace(/\s+/g, ' ').trim();

/**
 * Original-string ranges of every match of the folded query. A word typed
 * with taa marbuta also finds its construct form (عصبية → عصبيتهم), where
 * the ة is written as ت.
 */
export const findMatches = (original: string, query: string): [number, number][] => {
  if (!query) {
    return [];
  }
  const {text, map} = foldWithMap(original);
  const alt = query.length > 2 && query.endsWith('ه') ? query.slice(0, -1) + 'ت' : null;
  const out: [number, number][] = [];
  let from = 0;
  while (from <= text.length - query.length) {
    const a1 = text.indexOf(query, from);
    const a2 = alt ? text.indexOf(alt, from) : -1;
    const at = a1 < 0 ? a2 : a2 < 0 ? a1 : Math.min(a1, a2);
    if (at < 0) {
      break;
    }
    const start = map[at];
    // Extend over any marks that followed the last matched letter.
    let end = map[at + query.length - 1] + 1;
    while (end < original.length && DROP.test(original[end])) {
      end++;
    }
    out.push([start, end]);
    from = at + query.length;
  }
  return out;
};

/**
 * A window of text around the first match, so a long note shows the part
 * that matched: "…قبلها بقليل المطابقة وما بعدها…".
 */
export const excerptAround = (original: string, ranges: [number, number][], before = 42): {text: string; ranges: [number, number][]} => {
  if (!ranges.length || ranges[0][0] <= before) {
    return {text: original, ranges};
  }
  let cut = ranges[0][0] - before;
  // Start at a word boundary.
  const space = original.indexOf(' ', cut);
  if (space > -1 && space < ranges[0][0]) {
    cut = space + 1;
  }
  return {text: '…' + original.slice(cut), ranges: ranges.map(([s, e]) => [s - cut + 1, e - cut + 1] as [number, number])};
};
