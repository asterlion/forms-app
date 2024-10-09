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
                    CreateNewForm: '+ Создать новую форму',
                    FormName: 'Название формы',
                    Close: 'Закрыть',
                    SelectaSurveyTemplateorCreateaNewOne: 'Выберите шаблон опроса или создайте новый',
                    Proceed: 'Продолжить',
                    LogintoUse: 'Зарегестрируйтесь, чтобы продолжить',
                    EventRegistration: 'Регистрация на мероприятие',
                    Formforeventregistration: 'Форма для регистрации на мероприятие.',
                    CustomerFeedback: 'Отзыв клиента',
                    Formforcollectingcustomerfeedback: 'Форма для сбора отзывов клиентов.',
                    ContactInformation: 'Контактная информация',
                    Formforcollectingcontactinfo: 'Форма для сбора контактной информации.',
                    error_generic: 'Пользователь не найден или пароль неверный.',
                    error_title: 'Ошибка',
                    try_again: 'Попробуйте снова',
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
                    CreateNewForm: '+ Create New Form',
                    FormName: 'Form Name',
                    Close: 'Close',
                    SelectaSurveyTemplateorCreateaNewOne: 'Select a Survey Template or Create a New One',
                    Proceed: 'Proceed',
                    LogintoUse: 'Login to Use',
                    EventRegistration: 'EventRegistration',
                    Formforeventregistration: 'Form for event registration.',
                    CustomerFeedback: 'Customer Feedback',
                    Formforcollectingcustomerfeedback: 'Form for collecting customer feedback.',
                    ContactInformation: 'Contact Information',
                    Formforcollectingcontactinfo: 'Form for collecting contact info.',
                    error_generic: 'User not found or password is incorrect.',
                    error_title: 'Error',
                    try_again: 'Try again',
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
