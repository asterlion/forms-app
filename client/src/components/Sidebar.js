import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import './style/Sidebar.css';

const Sidebar = ({ isAuthenticated, username, onLogout }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState('light-theme');
    const sidebarRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') || 'light-theme';
        setTheme(savedTheme);
        document.body.className = savedTheme;

        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

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

    const handleLogoutClick = () => {
        onLogout();
        navigate('/login');
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
                    {!isAuthenticated ? (
                        <>
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
                        </>
                    ) : (
                        <li>
                            <button className="btn btn-outline-danger" onClick={handleLogoutClick}>
                                <i className="fa fa-sign-out"></i> {t('Logout')}
                            </button>
                        </li>
                    )}
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
                    {t('SwitchTo')} {theme === 'light-theme' ? 'dark' : 'light'}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
