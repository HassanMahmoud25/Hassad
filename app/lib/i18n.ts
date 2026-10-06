import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../theme/ThemeProvider';
import {currentLang} from './locale';
import {pluralForm} from './plural';
import {formatNumber, localizeDigits} from './text';

/**
 * `t` for the new UI (keys under `hs.`), plus `count` for pluralised
 * quantities and `num` for numbers in the reader's numeral style.
 */
export const useT = () => {
  const {t} = useTranslation();
  const {prefs} = useTheme();
  const tt = useCallback((key: string, vars?: Record<string, unknown>) => localizeDigits(t(`hs.${key}`, vars), prefs.numerals), [t, prefs.numerals]);
  const count = useCallback(
    /** `booksGen`: the genitive forms Arabic needs after a preposition («من كتابين»). */
    (key: 'books' | 'booksGen' | 'shelves' | 'notes', n: number) => {
      const form = pluralForm(n, currentLang());
      const k = `hs.count.${key}_${form}`;
      const value = t(k, {n: formatNumber(n, prefs.numerals)});
      return value === k ? t(`hs.count.${key}_other`, {n: formatNumber(n, prefs.numerals)}) : value;
    },
    [t, prefs.numerals],
  );
  const num = useCallback((n: number) => formatNumber(n, prefs.numerals), [prefs.numerals]);
  return {t: tt, count, num};
};
