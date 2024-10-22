import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {Modal, Button} from 'react-bootstrap';
import API_URL from '../config';
import './style/Home.css';

const Home = ({isAuthenticated}) => {
    const {t} = useTranslation();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedForm, setSelectedForm] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formName] = useState('');
    const [forms, setForms] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const fetchForms = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/forms/all`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(t('fetch_forms_error'));
            }

            const data = await response.json();
            setForms(data);
        } catch (error) {
            console.error('Error fetching forms:', error.message);
            setErrorMessage(error.message);
        }
    }, [t]);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const fetchQuestions = useCallback(async (formId) => {
        try {
            const response = await fetch(`${API_URL}/api/questions/all/${formId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(t('fetch_questions_error'));
            }

            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error.message);
            setErrorMessage(error.message);
        }
    }, [t]);

    const handleCreateNewForm = () => {
        setSelectedTemplate({title: t('Create_New_Form'), description: t('Start_from_scratch')});
        setSelectedForm(null);
        setShowModal(true);
    };

    const handleFormClick = async (form) => {
        setSelectedForm(form);
        await fetchQuestions(form.id);
        setShowModal(true);
    };

    const handleCopyTemplate = () => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            console.log('Template copied or new form created:', formName || selectedTemplate.title);
            setShowModal(false);
            navigate('/create-form');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedForm(null);
        setQuestions([]);
    };

    const handleCopyToCreateForm = (formId) => {
        navigate(`/edit-form/${formId}`);
    };

    return (
        <div className="home-page">
            <h2>{t('SelectaSurveyTemplateorCreateaNewOne')}</h2>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            <div className="template-list">
                <div className="template-card" onClick={handleCreateNewForm}>
                    <h3>{t('CreateNewForm')}</h3>
                </div>

                {forms.map((form) => (
                    <div key={form.id} className="template-card" onClick={() => handleFormClick(form)}>
                        <h3>{form.name}</h3>
                        <p>{form.description}</p>
                    </div>
                ))}
            </div>

            {(selectedForm || selectedTemplate) && (
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {selectedForm ? `${t('Name')}: ${selectedForm.name}` : t('Create_New_Form')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedForm ? (
                            <>
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
                            </>
                        ) : (
                            <>
                                <p>{selectedTemplate.description}</p>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        {selectedForm ? (
                            <button onClick={() => handleCopyToCreateForm(selectedForm.id)} className="btn btn-primary">
                                {t('Create_The_Same_Form')}
                            </button>
                        ) : (
                            <Button variant="primary" onClick={handleCopyTemplate}>
                                {t('Create')}
                            </Button>
                        )}
                        <Button variant="secondary" onClick={handleCloseModal}>
                            {t('Close')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default Home;
