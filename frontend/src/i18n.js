import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import hi from './translations/hi.json';
import gu from './translations/gu.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
  },
  lng: localStorage.getItem('i18nextLng') || 'en', // Read from localStorage first
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Save to localStorage whenever language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
