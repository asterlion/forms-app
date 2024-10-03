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
                    email: 'Электронная почта',
                    password: 'Пароль',
                    username: 'Имя пользователя',
                    confirmPassword: 'Подтверждение пароля',
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
                    email: 'e-mail',
                    password: 'Password',
                    username: 'Username',
                    confirmPassword: 'Confirm password',
                },
            },
        },
        lng: 'en', // язык по умолчанию
        fallbackLng: 'en', // язык по умолчанию, если перевода нет
        interpolation: {
            escapeValue: false, // React уже защищает от XSS
        },
    });

export default i18n;
