import React, {useState, useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import './style/Sidebar.css';

const Sidebar = () => {
    const {t} = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState('light-theme');
    const sidebarRef = useRef(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') || 'light-theme';
        setTheme(savedTheme);
        document.body.className = savedTheme;

        // Функция для закрытия сайдбара при клике вне него
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
                setIsOpen(false);
            }
        };

        // Добавляем слушатель событий
        document.addEventListener('mousedown', handleClickOutside);

        // Убираем слушатель при размонтировании
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Функция для переключения темы
    const toggleTheme = () => {
        const newTheme = theme === 'light-theme' ? 'dark-theme' : 'light-theme';
        setTheme(newTheme);
        document.body.className = newTheme;
        localStorage.setItem('app-theme', newTheme);
        setIsOpen(false);
    };

    const toggleSidebar = () => {
        setIsOpen(prevState => !prevState);
    };


    const handleMenuClick = () => {
        setIsOpen(false);
    };

    return (
        <div>
            {/* Бургер-меню для мобильных устройств */}
            <button
                className="burger-menu d-md-none"
                onClick={toggleSidebar}
            >
                <span className="navbar-toggler-icon">&#9776;</span>
            </button>

            {/* Боковая панель */}
            <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''} ${theme}`}>
                <h2>Forms App</h2>
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <Link to="/" className="nav-link" onClick={handleMenuClick}>
                            <i className="fa fa-home"></i>
                            {t('home')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/profile" className="nav-link" onClick={handleMenuClick}>
                            <i className="fa fa-user"></i>
                            {t('profile')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/register" className="nav-link" onClick={handleMenuClick}>
                            <i className="fa fa-user-plus"></i>
                            {t('register')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/login" className="nav-link" onClick={handleMenuClick}>
                            <i className="fa fa-sign-in"></i>
                            {t('login')}
                        </Link>
                    </li>
                </ul>

                <button
                    onClick={() => {
                        const newLang = i18n.language === 'ru' ? 'en' : 'ru';
                        i18n.changeLanguage(newLang);
                        localStorage.setItem('language', newLang);
                        setIsOpen(false);
                    }}
                    className="btn btn-secondary mt-3"
                >
                    {t('switchLanguage')}
                </button>

                <button onClick={toggleTheme} className="btn btn-secondary mt-3">
                    {t('SwitchTo')} {theme === 'light-theme' ? '' : ''}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
