// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const language = localStorage.getItem('language') || 'en';

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
                    UserSuccessfullyRegistered: 'Пользователь успешно создан!',
                    Success: 'Успешно!',
                    hello: 'Добро пожаловать',
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
                    UserSuccessfullyRegistered: 'User successfully registered !',
                    Success: 'Success!',
                    hello: 'Hello',
                },
            },
        },
        lng: language, // язык по умолчанию
        fallbackLng: 'en', // язык по умолчанию, если перевода нет
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
