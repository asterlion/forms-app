import React, { useState } from 'react';
import API_URL from '../config';
import SingleChoiceQuestion from './SingleChoiceQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import ShortTextQuestion from './ShortTextQuestion';
import LongTextQuestion from './LongTextQuestion';
import { Button, Form, Modal } from 'react-bootstrap';
import './style/CreateForm.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CreateFormPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formName, setFormName] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false); // Состояние для управления модальным окном

    const handleDeleteQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleAddQuestion = (type) => {
        const newQuestion = {
            id: Date.now(),
            type,
            text: '',
            options: [],
            answer: null,
        };
        setQuestions([...questions, newQuestion]);
    };

    const handleSaveForm = () => {
        const formData = {
            name: formName,
            description,
            questions
        };
        const token = localStorage.getItem('token');
        console.log('Form data to be saved:', formData);

        fetch(`${API_URL}/api/forms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save form, status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Form saved successfully:', data);
                setShowModal(true); // Показать модальное окно
            })
            .catch(error => {
                console.error('Error saving form:', error.message || error);
            });
    };

    const handleQuestionUpdate = (id, updatedQuestion) => {
        setQuestions(questions.map(q => (q.id === id ? updatedQuestion : q)));
    };

    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/'); // Перенаправить на главную страницу после закрытия модального окна
    };

    return (
        <div className="create-form-page">
            <Form.Group>
                <Form.Label>{t('form_title')}</Form.Label>
                <Form.Control
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>{t('form_description')}</Form.Label>
                <Form.Control
                    as="textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Form.Group>

            <div className="questions-list">
                {questions.map((question, index) => {
                    return (
                        <div key={question.id} className="question-item">
                            {(() => {
                                switch (question.type) {
                                    case 'single_choice':
                                        return <SingleChoiceQuestion question={question} onUpdate={handleQuestionUpdate} />;
                                    case 'multiple_choice':
                                        return <MultipleChoiceQuestion question={question} onUpdate={handleQuestionUpdate} />;
                                    case 'short_text':
                                        return <ShortTextQuestion question={question} onUpdate={handleQuestionUpdate} />;
                                    case 'long_text':
                                        return <LongTextQuestion question={question} onUpdate={handleQuestionUpdate} />;
                                    default:
                                        return null;
                                }
                            })()}
                            <Button variant="danger" onClick={() => handleDeleteQuestion(question.id)} className="delete-question">
                                &times;
                            </Button>
                        </div>
                    );
                })}
            </div>
            <p>{t('add_question')}</p>

            <Button onClick={() => handleAddQuestion('single_choice')}>{t('single_choice')}</Button>
            <Button onClick={() => handleAddQuestion('multiple_choice')}>{t('multiple_choice')}</Button>
            <Button onClick={() => handleAddQuestion('short_text')}>{t('short_answer')}</Button>
            <Button onClick={() => handleAddQuestion('long_text')}>{t('long_answer')}</Button>

            <Button onClick={handleSaveForm}>{t('save_form')}</Button>

            {/* Модальное окно */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('success')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{t('form_created_successfully')}</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseModal}>
                        {t('close')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CreateFormPage;
