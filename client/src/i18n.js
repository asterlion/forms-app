// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ru: {
                translation: {
                    home: 'Главная',
                    profile: 'Профиль',
                    register: 'Регистрация',
                    login: 'Вход',
                    switchLanguage: 'Переключить на английский',
                    SwitchTo: 'Переключить тему',
                },
            },
            en: {
                translation: {
                    home: 'Home',
                    profile: 'Profile',
                    register: 'Register',
                    login: 'Login',
                    switchLanguage: 'Switch to Russian',
                    SwitchTo: 'Switch theme',
                },
            },
        },
        lng: 'ru', // язык по умолчанию
        fallbackLng: 'ru', // язык по умолчанию, если перевода нет
        interpolation: {
            escapeValue: false, // React уже защищает от XSS
        },
    });

export default i18n;
