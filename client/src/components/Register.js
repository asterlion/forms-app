import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API_URL from '../config';
import SuccessModal from './SuccessModal';
import './style/Auth.css';
import { useNavigate } from "react-router-dom";

const Register = ({ onLogin }) => {
    const { t } = useTranslation();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage(t('passwords_must_match'));
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Ответ от сервера:", data);

            if (response.ok && data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                setShowSuccessModal(true);
                setTimeout(() => {
                    onLogin(data.username);
                    navigate('/profile');
                }, 2000);
            } else {
                setErrorMessage(data.error || t('error_generic'));
            }
        } catch (error) {
            setErrorMessage(t('error_generic'));
            console.error('An error occurred:', error.message);
        }
    };

    const handleCloseSuccessModal = () => setShowSuccessModal(false);

    return (
        <div className="auth-container">
            <h2>{t('register')}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t('username')}</label>
                    <input
                        type="text"
                        name="username"
                        className="form-control"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
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
                <div className="form-group">
                    <label>{t('confirmPassword')}</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                <button type="submit" className="btn btn-primary">
                    {t('register')}
                </button>
            </form>
            <SuccessModal show={showSuccessModal} handleClose={handleCloseSuccessModal} />
        </div>
    );
};

export default Register;
