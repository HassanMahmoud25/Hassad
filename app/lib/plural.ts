// CLDR plural categories for the two UI languages. Hermes has no
// Intl.PluralRules, so i18next's own plural handling is unreliable here;
// screens call `plural()` and look up `<key>_<form>` themselves.

export type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export const pluralForm = (n: number, lang: 'ar' | 'en'): PluralForm => {
  if (lang === 'en') {
    return n === 1 ? 'one' : 'other';
  }
  if (n === 0) {
    return 'zero';
  }
  if (n === 1) {
    return 'one';
  }
  if (n === 2) {
    return 'two';
  }
  const mod = n % 100;
  if (mod >= 3 && mod <= 10) {
    return 'few';
  }
  if (mod >= 11 && mod <= 99) {
    return 'many';
  }
  return 'other';
};
