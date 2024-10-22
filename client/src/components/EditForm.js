import React, { useEffect, useState } from 'react';
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
    const [questions, setQuestions] = useState([]); // Состояние для вопросов
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const fetchFormData = async () => {
        console.log('Form ID:', formId); // Логируем ID формы

        const token = localStorage.getItem('token'); // Получаем токен

        if (!token) {
            console.error('Токен отсутствует, перенаправляем на страницу логина');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/edit-form/${formId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Добавляем токен в заголовок
                },
            });

            console.log('Response status:', response.status); // Логируем статус ответа

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
            setQuestions(data.questions || []); // Устанавливаем вопросы, если они есть
        } catch (error) {
            console.error('Ошибка загрузки формы:', error.message);
            setErrorMessage(error.message);
        }
    };

    useEffect(() => {
        fetchFormData();
    }, [formId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/edit-form/${formId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: title,
                    description: description,
                    questions: questions, // Отправляем вопросы на сервер
                }),
            });

            if (!response.ok) {
                throw new Error('Не удалось обновить форму');
            }

            navigate('/profile'); // Перенаправляем на страницу профиля после успешного редактирования
        } catch (error) {
            console.error('Ошибка редактирования формы:', error.message);
            setErrorMessage(error.message);
        }
    };

    const handleQuestionChange = (index, event) => {
        const newQuestions = [...questions];
        newQuestions[index].text = event.target.value; // Изменяем текст вопроса
        setQuestions(newQuestions);
    };

    const handleAddQuestion = () => {
        const newQuestion = { id: Date.now(), text: '' }; // Создаем новый вопрос
        setQuestions([...questions, newQuestion]);
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index); // Удаляем вопрос по индексу
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

                <h3>{t('Questions')}</h3>
                {questions.map((question, index) => (
                    <div key={question.id} className="form-group">
                        <input
                            type="text"
                            value={question.text}
                            onChange={(e) => handleQuestionChange(index, e)}
                            required
                        />
                        <button type="button" onClick={() => handleRemoveQuestion(index)}>Удалить</button>
                    </div>
                ))}
                <button type="button" onClick={handleAddQuestion}>Добавить вопрос</button>

                <button type="submit" className="btn btn-primary">{t('Save_Edit')}</button>
            </form>
        </div>
    );
};

export default EditForm;
