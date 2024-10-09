import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import API_URL from '../config';
import './style/Auth.css';

const Login = ({ onLogin }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Server response:", data);

            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                onLogin(data.username);
                navigate('/profile');
            } else {
                setErrorMessage(data.error || t('error_generic'));
                setShowModal(true);
            }
        } catch (error) {
            console.error('An error occurred:', error.message);
            setErrorMessage(t('error_generic'));
            setShowModal(true);
        }
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
                <Link to="/register" className="btn btn-outline-secondary">
                    {t('register')}
                </Link>
            </form>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('error_title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        {t('try_again')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Login;
