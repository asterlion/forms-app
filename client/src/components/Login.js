import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './style/Auth.css'; // Подключаем стили

const Login = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Логика обработки входа
        console.log(formData);
    };

    return (
        <div className="auth-container">
            <h2>{t('login')}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t('email')}</label>
                    <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>{t('password')}</label>
                    <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    {t('login')}
                </button>
                {/* Бледная кнопка для перехода на страницу регистрации */}
                <Link to="/register" className="btn btn-outline-secondary">
                    {t('register')}
                </Link>
            </form>
        </div>
    );
};

export default Login;
