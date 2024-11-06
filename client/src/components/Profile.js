import React, {useEffect, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {createSalesforceAccount, updateSalesforceAccountPhoneNumber} from './salesforceIntegration';
import API_URL from '../config';
import {Modal, Button} from 'react-bootstrap';
import './style/Profile.css';

const Profile = ({username, onDeleteProfile}) => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showFormModal, setShowFormModal] = useState(false);
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [integrationMessage, setIntegrationMessage] = useState('');
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

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/api/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Ошибка при получении данных пользователя");
        }

        const userData = await response.json();
        console.log("Данные пользователя:", userData);
        return userData;
    };

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

    const handleSalesforceIntegration = async () => {
        try {
            const userData = await fetchUserData();
            const {username, email} = userData;

            if (!username || !email) {
                alert(t("integrationMissingUserData"));
                return;
            }

            const response = await createSalesforceAccount(username, email);

            if (response.success) {
                setIntegrationMessage(t("integrationAccountCreated"));
            } else if (response.errors && response.errors.length > 0) {
                if (response.errors[0].statusCode === 'DUPLICATES_DETECTED') {
                    setIntegrationMessage(t("integrationDuplicateAccount"));
                    setShowIntegrationModal(true);
                } else {
                    setIntegrationMessage(t("integrationCreationError", {message: response.errors[0].message}));
                }
            } else {
                setIntegrationMessage(t("integrationUnknownError"));
            }
            setShowIntegrationModal(true);
        } catch (error) {
            console.error("Ошибка интеграции с Salesforce:", error);
            setIntegrationMessage(t("integrationDuplicateAccount"));
            setShowIntegrationModal(true);
        }
    };

    const handleSubmitPhoneNumber = async () => {
        if (!phoneNumber) {
            setErrorMessage(t("phoneNumberRequired"));
            return;
        }

        try {
            // Здесь делаем запрос в Salesforce API для обновления данных
            const response = await updateSalesforceAccountPhoneNumber(phoneNumber);

            if (response.success) {
                setSuccessMessage(t("phoneNumberUpdated"));
            } else {
                setErrorMessage(t("phoneNumberUpdateFailed"));
            }
        } catch (error) {
            console.error("Ошибка при отправке номера телефона в Salesforce:", error);
            setErrorMessage(t("phoneNumberUpdateError"));
        }
    };

    const handleFormClick = async (form) => {
        setSelectedForm(form);
        await fetchQuestions(form.id);
        setShowFormModal(true);
    };

    const handleEditForm = (formId) => {
        navigate(`/edit-form/${formId}`);
    };

    const handleCloseModal = () => {
        setShowFormModal(false);
        setSelectedForm(null);
        setQuestions([]);
    };

    const handleSupportTickets = () => {
        navigate('/support-tickets');
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

            <button onClick={handleSalesforceIntegration} className="btn btn-outline-primary">
                {t('Integrate_with_Salesforce')}
            </button>

            <button onClick={handleSupportTickets} className="btn btn-outline-primary">
                {t('Support_tickets')}
            </button>

            <button onClick={handleDeleteProfile} className="btn btn-outline-danger">
                {t('Delete_Profile')}
            </button>

            {selectedForm && (
                <Modal show={showFormModal} onHide={handleCloseModal}>
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

            <Modal show={showIntegrationModal} onHide={() => setShowIntegrationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('Salesforce_Integration')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {integrationMessage && <p>{integrationMessage}</p>}

                    {(integrationMessage === t("integrationAccountCreated") || integrationMessage === t("integrationDuplicateAccount")) && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="phoneNumber">{t('Phone_Number')}</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    className="form-control"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>

                            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                            {successMessage && <div className="alert alert-success">{successMessage}</div>}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={handleSubmitPhoneNumber}
                        disabled={!phoneNumber}
                    >
                        {t('Submit')}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowIntegrationModal(false)}>
                        {t('Close')}
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default Profile;
