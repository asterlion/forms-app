import React, { useState } from 'react';
import SingleChoiceQuestion from './SingleChoiceQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import ShortTextQuestion from './ShortTextQuestion';
import LongTextQuestion from './LongTextQuestion';
import { Button, Form } from 'react-bootstrap';
import './style/CreateForm.css';

const CreateFormPage = () => {
    const [formName, setFormName] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);

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
        fetch('/api/forms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        }).then(() => {
            console.log('Form saved');
        });
    };

    const handleQuestionUpdate = (id, updatedQuestion) => {
        setQuestions(questions.map(q => (q.id === id ? updatedQuestion : q)));
    };

    return (
        <div className="create-form-page">
            <Form.Group>
                <Form.Label>Form Name</Form.Label>
                <Form.Control
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Form.Group>

            <div className="questions-list">
                {questions.map((question, index) => {
                    switch (question.type) {
                        case 'single_choice':
                            return <SingleChoiceQuestion key={question.id} question={question} onUpdate={handleQuestionUpdate} />;
                        case 'multiple_choice':
                            return <MultipleChoiceQuestion key={question.id} question={question} onUpdate={handleQuestionUpdate} />;
                        case 'short_text':
                            return <ShortTextQuestion key={question.id} question={question} onUpdate={handleQuestionUpdate} />;
                        case 'long_text':
                            return <LongTextQuestion key={question.id} question={question} onUpdate={handleQuestionUpdate} />;
                        default:
                            return null;
                    }
                })}
            </div>

            <Button onClick={() => handleAddQuestion('single_choice')}>Add Single Choice Question</Button>
            <Button onClick={() => handleAddQuestion('multiple_choice')}>Add Multiple Choice Question</Button>
            <Button onClick={() => handleAddQuestion('short_text')}>Add Short Text Question</Button>
            <Button onClick={() => handleAddQuestion('long_text')}>Add Long Text Question</Button>

            <Button onClick={handleSaveForm}>Save Form</Button>
        </div>
    );
};

export default CreateFormPage;
