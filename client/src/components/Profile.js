import React, {useEffect, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import API_URL from '../config';
import './style/Profile.css';
import {Modal, Button} from 'react-bootstrap';

const Profile = ({username}) => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const token = localStorage.getItem('token');

    const fetchForms = useCallback(async () => {
        const response = await fetch(`${API_URL}/api/forms`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch forms:', response.statusText);
            return;
        }

        const data = await response.json();
        setForms(data);
    }, [token]);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            navigate('/login');
        } else {
            fetchForms().catch(error => {
                console.error("Error fetching forms:", error);
            });
        }
    }, [navigate, fetchForms]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const handleFormClick = (form) => {
        setSelectedForm(form);
        setShowModal(true);
    };

    const handleEditForm = (formId) => {
        navigate(`/edit-form/${formId}`);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedForm(null);
    };

    return (
        <div className="profile-page">
            <h2>{t('profile')}</h2>
            <h3>{t('hello')}, {username}!</h3>
            <button onClick={handleLogout} className="btn btn-danger">
                {t('Logout')}
            </button>

            <h4>{t('Your_Forms')}:</h4>

            <div className="template-list">
                {forms.map((form) => (
                    <div key={form.id} className="template-card" onClick={() => handleFormClick(form)}>
                        <h3>{form.name}</h3>
                        <p>{form.description}</p>
                    </div>
                ))}
            </div>

            {selectedForm && (
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedForm.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{selectedForm.description}</p>
                        {selectedForm.questions && selectedForm.questions.length > 0 && (
                            <div>
                                <h4>{t('Questions')}</h4>
                                <ul>
                                    {selectedForm.questions.map((question) => (
                                        <li key={question.id}>{question.text}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={() => handleEditForm(selectedForm.id)}
                                className="btn btn-primary">
                            {t('Edit')}
                        </button>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            {t('Close')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default Profile;
