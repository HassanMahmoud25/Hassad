import {Lang} from './locale';
import {pluralForm} from './plural';
import {formatNumber, NumeralStyle} from './text';

const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Whole calendar days between a date and today (0 = today). */
export const daysAgo = (iso: string, now = new Date()): number =>
  Math.max(0, Math.round((startOfDay(now) - startOfDay(new Date(iso))) / DAY));

// Hermes has no Intl.RelativeTimeFormat, so relative dates are written out,
// with Arabic's dual and plural forms.
const AR: Record<'day' | 'week' | 'month' | 'year', Record<string, string>> = {
  day: {two: 'يومين', few: 'أيام', many: 'يوماً', other: 'يوم'},
  week: {two: 'أسبوعين', few: 'أسابيع', many: 'أسبوعاً', other: 'أسبوع'},
  month: {two: 'شهرين', few: 'أشهر', many: 'شهراً', other: 'شهر'},
  year: {two: 'سنتين', few: 'سنوات', many: 'سنة', other: 'سنة'},
};
const AR_ONE = {day: 'يوم', week: 'أسبوع', month: 'شهر', year: 'سنة'};

/** «اليوم», «أمس», «قبل يومين», «قبل 3 أسابيع» / "today", "2 days ago". */
export const relativeDay = (iso: string, lang: Lang, numerals: NumeralStyle): string => {
  const d = daysAgo(iso);
  if (d === 0) {
    return lang === 'ar' ? 'اليوم' : 'today';
  }
  if (d === 1) {
    return lang === 'ar' ? 'أمس' : 'yesterday';
  }
  const [n, unit] =
    d < 14 ? [d, 'day' as const] : d < 60 ? [Math.round(d / 7), 'week' as const] : d < 365 ? [Math.round(d / 30), 'month' as const] : [Math.round(d / 365), 'year' as const];
  if (lang === 'en') {
    return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
  }
  const form = pluralForm(n, 'ar');
  if (form === 'one') {
    return `قبل ${AR_ONE[unit]}`;
  }
  if (form === 'two') {
    return `قبل ${AR[unit].two}`;
  }
  return `قبل ${formatNumber(n, numerals)} ${AR[unit][form] ?? AR[unit].other}`;
};

/** Greeting by the hour on this device. */
export const greeting = (lang: Lang, now = new Date()): string => {
  const h = now.getHours();
  if (lang === 'ar') {
    return h >= 4 && h < 12 ? 'صباح الخير' : 'مساء الخير';
  }
  return h >= 4 && h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

/** Weekday, day and month in the UI language, with the reader's numerals. */
export const longDate = (lang: Lang, numerals: NumeralStyle, now = new Date()): string => {
  const locale = lang === 'ar' ? `ar-u-nu-${numerals === 'arab' ? 'arab' : 'latn'}` : 'en-GB';
  return now.toLocaleDateString(locale, {weekday: 'long', day: 'numeric', month: 'long'});
};

/**
 * The Hijri date, or null when this device's Intl can't format the
 * Umm al-Qura calendar (some Hermes builds silently fall back to Gregorian,
 * which would print a wrong "Hijri" date).
 */
export const hijriDate = (lang: Lang, numerals: NumeralStyle, now = new Date()): string | null => {
  try {
    const nu = numerals === 'arab' ? 'arab' : 'latn';
    const fmt = new Intl.DateTimeFormat(`${lang === 'ar' ? 'ar' : 'en'}-u-ca-islamic-umalqura-nu-${nu}`, {day: 'numeric', month: 'long', year: 'numeric'});
    if (!fmt.resolvedOptions().calendar?.startsWith('islamic')) {
      return null;
    }
    // Strip the era marker («هـ» / "AH") for a quieter line.
    return fmt.format(now).replace(/\s*(هـ|AH)$/u, '');
  } catch {
    return null;
  }
};
