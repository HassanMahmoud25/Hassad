import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {I18nManager} from 'react-native';

// Import translation files
import en from '../locales/en.json';
import ar from '../locales/ar.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {translation: en},
    ar: {translation: ar},
  },
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
});

I18nManager.allowRTL(true);
I18nManager.forceRTL(i18n.language === 'ar');

export default i18n;
