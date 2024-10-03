import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationFR from './locales/fr/translation.json';

const resources = {
    en: {
        translation: translationEN,
    },
    es: {
        translation: translationES,
    },
    fr: {
        translation: translationFR,
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'es', // idioma por defecto
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;