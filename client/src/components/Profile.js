import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './style/Profile.css';

const Profile = ({ username }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="profile-page">
            <h2>{t('profile')}</h2>
            <h3>{t('hello')}, {username}!</h3>
            <button onClick={handleLogout} className="btn btn-danger">
                Logout
            </button>
        </div>
    );
};

export default Profile;
