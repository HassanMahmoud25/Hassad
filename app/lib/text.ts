// Script, direction and digit helpers. Hassad is Arabic-first but content is
// mixed: an English book in an Arabic library, an Arabic note in the English
// UI. These helpers decide typeface, direction and alignment from the text
// itself rather than from the UI language alone.

export type Script = 'arabic' | 'latin';

// Arabic, Arabic Supplement, Arabic Extended-A, presentation forms.
const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const LATIN_RE = /[A-Za-zÀ-ɏ]/;

/** The script of the first strong character, or `fallback` when the string
 * has none (digits, punctuation, empty). Mirrors Unicode's first-strong rule,
 * which is also how the platform text engines pick paragraph direction. */
export const detectScript = (text: string | undefined | null, fallback: Script): Script => {
  if (!text) {
    return fallback;
  }
  for (const ch of text) {
    if (ARABIC_RE.test(ch)) {
      return 'arabic';
    }
    if (LATIN_RE.test(ch)) {
      return 'latin';
    }
  }
  return fallback;
};

export const isRTLScript = (script: Script) => script === 'arabic';

/** Flattens React children to a string for script detection; non-string
 * children (icons, nested elements) are ignored. */
export const childrenToText = (children: unknown): string => {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(childrenToText).join('');
  }
  return '';
};

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const EXTENDED_ARABIC_INDIC = '۰۱۲۳۴۵۶۷۸۹';

/** Converts Arabic-Indic and Persian digits to ASCII. The API's `isInt()`
 * validation rejects ٠–٩, so every number a user types goes through this
 * before it is sent. */
export const toWesternDigits = (value: string): string =>
  value.replace(/[٠-٩۰-۹]/g, d => {
    const i = ARABIC_INDIC.indexOf(d);
    return String(i >= 0 ? i : EXTENDED_ARABIC_INDIC.indexOf(d));
  });

export type NumeralStyle = 'latn' | 'arab';

/** Formats a number for display. Western digits are the default (Design Lock
 * v2); Arabic-Indic digits are a user preference. */
export const formatNumber = (n: number, style: NumeralStyle = 'latn'): string => {
  const s = String(n);
  return style === 'arab' ? s.replace(/[0-9]/g, d => ARABIC_INDIC[Number(d)]) : s;
};

/** Applies the numeral preference to digits inside a UI string. */
export const localizeDigits = (text: string, style: NumeralStyle): string =>
  style === 'arab' ? text.replace(/[0-9]/g, d => ARABIC_INDIC[Number(d)]) : toWesternDigits(text);

/** Folds Arabic spelling variants so search matches the way people type:
 * hamza forms of alef, ta marbuta / ha, alef maqsura / ya, tatweel and harakat. */
export const foldArabic = (text: string): string =>
  toWesternDigits(text)
    .replace(/[ً-ٰٟۖ-ۭ]/g, '') // harakat, Quranic marks
    .replace(/ـ/g, '') // tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLowerCase();

/**
 * Keeps a Latin run inside an Arabic title on one line («ملاحظات على كتاب
 * Atomic Habits» never splits "Atomic / Habits"), like the canvas's
 * `white-space: nowrap` spans. For titles only — paragraphs must still wrap.
 */
export const bindLatinRuns = (text: string): string => {
  if (detectScript(text, 'latin') !== 'arabic') {
    return text;
  }
  return text.replace(/([A-Za-z0-9][\w'’.-]*)[ ]+(?=[A-Za-z0-9])/g, '$1\u00A0');
};

/** Wraps user text placed inside a sentence in a Unicode first-strong
 * isolate, so an Arabic name in an English sentence (or the reverse) can't
 * reorder the quotes and words around it. */
export const isolate = (text: string): string => `\u2068${text}\u2069`;
