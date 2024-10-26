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
    const [forms, setForms] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
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
            console.log('Template copied or new form created:', selectedTemplate.title);
            setShowModal(false);
            navigate('/create-form');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedForm(null);
        setQuestions([]);
    };

    //еще поработаем над этой функцией
    const handleCopyToCreateForm = async (formId) => {
        try {
            const response = await fetch(`${API_URL}/api/forms/copy/${formId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при копировании формы');
            }
            navigate('/create-form');
        } catch (error) {
            console.error('Ошибка:', error.message);
        }
    };

    const filteredForms = forms.filter((form) =>
        form.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="home-page">
            <h2>{t('SelectaSurveyTemplateorCreateaNewOne')}</h2>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            {/* Поле для поиска */}
            <input
                type="text"
                placeholder={t('Search_by_name')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control search-input"
            />

            <div className="template-list">
                <div className="template-card" onClick={handleCreateNewForm}>
                    <h3 className="main-text">{t('CreateNewForm')}</h3>
                </div>

                {filteredForms.map((form) => (
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
                            <button className="btn btn-primary"
                                    onClick={isAuthenticated ? handleCopyToCreateForm(selectedForm.id) : () => navigate('/login')}>
                                {isAuthenticated ? t('Create_The_Same_Form') : t('Login_to_create')}
                            </button>
                        ) : (
                            <button className="btn btn-primary"
                                    onClick={isAuthenticated ? handleCopyTemplate : () => navigate('/login')}>
                                {isAuthenticated ? t('Create') : t('Login_to_create')}
                            </button>
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
