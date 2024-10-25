import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../config';
import './style/EditForm.css';
import { useTranslation } from "react-i18next";

const EditForm = () => {
    const { t } = useTranslation();
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchFormData = useCallback(async () => {
        console.log('Form ID:', formId);

        if (!token) {
            console.error('Токен отсутствует, перенаправляем на страницу логина');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/edit-form/${formId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error('Не удалось загрузить данные формы');
            }

            const data = await response.json();
            if (!data) {
                throw new Error('Форма не найдена');
            }

            setForm(data);
            setTitle(data.name);
            setDescription(data.description);
            setQuestions(data.questions || []);
        } catch (error) {
            console.error('Ошибка загрузки формы:', error.message);
            setErrorMessage(error.message);
        }
    }, [formId, navigate, token]);

    useEffect(() => {
        fetchFormData();
    }, [fetchFormData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/edit-form/${formId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: title,
                    description: description,
                    questions: questions,
                }),
            });

            if (!response.ok) {
                throw new Error('Не удалось обновить форму');
            }

            navigate('/profile');
        } catch (error) {
            console.error('Ошибка редактирования формы:', error.message);
            setErrorMessage(error.message);
        }
    };

    const handleQuestionChange = (index, event) => {
        const newQuestions = [...questions];
        newQuestions[index].text = event.target.value;
        setQuestions(newQuestions);
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    if (!form) {
        return <div>{t('Loading')}</div>;
    }

    return (
        <div className="edit-form-container">
            <h2>{t('Edit_Form')}</h2>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="formTitle">{t('Name')}:</label>
                    <input
                        type="text"
                        id="formTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="formDescription">{t('Description')}:</label>
                    <textarea
                        id="formDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <label htmlFor="formQuestions">{t('Questions')}:</label>
                {questions.map((question, index) => (
                    <div key={question.id} className="form-group">
                        <input
                            type="text"
                            value={question.text}
                            onChange={(e) => handleQuestionChange(index, e)}
                            required
                        />
                        <button type="button" onClick={() => handleRemoveQuestion(index)}>{t('Delete')}</button>
                    </div>
                ))}
                <button type="submit" className="btn btn-primary">{t('Save_Edit')}</button>
            </form>
        </div>
    );
};

export default EditForm;
