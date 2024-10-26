import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_URL from '../config';
import './style/Profile.css';
import { Modal, Button } from 'react-bootstrap';

const Profile = ({ username, onDeleteProfile }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [questions, setQuestions] = useState([]);
    const token = localStorage.getItem('token');

    const fetchForms = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/forms`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(t('fetch_forms_error'));
            }

            const data = await response.json();

            if (data.length === 0) {
                console.log(t('No_forms_available_for_the_user'));
            }

            setForms(data);
        } catch (error) {
            console.error('Error fetching forms:', error.message);
        }
    }, [token, t]);

    const fetchQuestions = useCallback(async (formId) => {
        try {
            const response = await fetch(`${API_URL}/api/questions/${formId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(t('fetch_questions_error'));
            }

            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error.message);
        }
    }, [token, t]);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            navigate('/login');
        } else {
            fetchForms();
        }
    }, [navigate, fetchForms]);

    const handleFormClick = async (form) => {
        setSelectedForm(form);
        await fetchQuestions(form.id);
        setShowModal(true);
    };

    const handleEditForm = (formId) => {
        navigate(`/edit-form/${formId}`);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedForm(null);
        setQuestions([]);
    };

    const handleDeleteProfile = async () => {
        if (window.confirm(t('Are_you_sure_you_want_to_delete_your_profile'))) {
            try {
                const response = await fetch(`${API_URL}/api/delete-profile`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(t('delete_profile_error'));
                }

                onDeleteProfile();
                navigate('/login');
            } catch (error) {
                console.error('Ошибка удаления профиля:', error.message);
            }
        }
    };

    return (
        <div className="profile-page">
            <h2>{t('profile')}</h2>

            <h3>{t('hello')}, {username}!</h3>

            <h4>{t('Your_Forms')}:</h4>

            {forms.length === 0 ? (
                <div className="no-forms-message">
                    <p>{t('No_forms_available_for_the_user')}</p>
                    <a href="/create-form" className="btn btn-primary">{t('Create_your_first_form')}</a>
                </div>
            ) : (
                <div className="template-list">
                    {forms.map((form) => (
                        <div key={form.id} className="template-card" onClick={() => handleFormClick(form)}>
                            <h3>{form.name}</h3>
                            <p>{form.description}</p>
                        </div>
                    ))}
                </div>
            )}

            <button onClick={handleDeleteProfile} className="btn btn-outline-danger">
                {t('Delete_Profile')}
            </button>

            {selectedForm && (
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{t('Name')}: {selectedForm.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{t('Description')}: {selectedForm.description}</p>
                        {questions.length > 0 ? (
                            <div>
                                <h4>{t('Questions')}:</h4>
                                <ul>
                                    {questions.map((question) => (
                                        <li key={question.id}>{question.text}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p>{t('No_questions')}</p>
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
