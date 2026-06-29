import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import viTranslations from '../locales/vi.json';

// Get initial language from localStorage directly to avoid flicker
let initialLanguage = 'en';
if (typeof window !== 'undefined') {
  const storedData = localStorage.getItem('app-language');
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      if (parsed?.state?.language) {
        initialLanguage = parsed.state.language;
      }
    } catch (e) {
      // Ignore
    }
  }
}

const resources = {
  en: {
    translation: enTranslations,
  },
  vi: {
    translation: viTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
