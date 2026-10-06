import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

// Import translation files
import en from '../locales/en.json';
import ar from '../locales/ar.json';

// Boots in Arabic; app/lib/locale.ts then applies the saved language and the
// matching layout direction before the first screen renders.
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

export default i18n;
