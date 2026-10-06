import {I18nManager} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';
import i18n from '../configs/i18n';
import {Script} from './text';

// Language and layout direction.
//
// The old flow forced RTL from whatever language i18n booted with ('ar') and
// never saved the user's choice, so switching to English was lost on the
// restart it triggered. Now the choice is persisted, applied before the first
// render, and the app restarts only when the native layout direction actually
// has to change (I18nManager direction applies on the next launch).

export type Lang = 'ar' | 'en';
const LANG_KEY = 'hassad.lang';
export const DEFAULT_LANG: Lang = 'ar';

export const isRTLLang = (lang: Lang) => lang === 'ar';

export const currentLang = (): Lang => (i18n.language === 'en' ? 'en' : 'ar');

export const uiScript = (): Script => (currentLang() === 'ar' ? 'arabic' : 'latin');

/** Applies the saved language. Resolves `false` when a restart was triggered
 * to bring the native layout direction in line — the caller renders nothing. */
export const bootstrapLanguage = async (): Promise<boolean> => {
  let lang: Lang = DEFAULT_LANG;
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored === 'ar' || stored === 'en') {
      lang = stored;
    }
  } catch {
    // Storage unavailable: fall back to the default language.
  }
  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }
  I18nManager.allowRTL(true);
  I18nManager.swapLeftAndRightInRTL(true);
  if (I18nManager.isRTL !== isRTLLang(lang)) {
    I18nManager.forceRTL(isRTLLang(lang));
    RNRestart.Restart();
    return false;
  }
  return true;
};

const RESUME_KEY = 'hassad.resume';

/** Saves the language and restarts if the layout direction changes.
 * `resume` names a screen to reopen after the restart. */
export const setLanguage = async (lang: Lang, resume?: 'me') => {
  await AsyncStorage.setItem(LANG_KEY, lang);
  if (resume) {
    await AsyncStorage.setItem(RESUME_KEY, resume);
  }
  await i18n.changeLanguage(lang);
  if (I18nManager.isRTL !== isRTLLang(lang)) {
    I18nManager.forceRTL(isRTLLang(lang));
    RNRestart.Restart();
  }
};

/** The screen to reopen after a language restart, read once. */
export const takeResume = async (): Promise<'me' | null> => {
  try {
    const v = await AsyncStorage.getItem(RESUME_KEY);
    if (v) {
      await AsyncStorage.removeItem(RESUME_KEY);
    }
    return v === 'me' ? 'me' : null;
  } catch {
    return null;
  }
};
