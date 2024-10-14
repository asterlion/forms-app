import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import './style/CreateForm.css';
import {useTranslation} from "react-i18next";

const MultipleChoiceQuestion = ({ question, onUpdate }) => {
    const { t } = useTranslation();
    const [options, setOptions] = useState(question.options || []);
    const [text, setText] = useState(question.text || '');

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
        onUpdate(question.id, { ...question, options: updatedOptions });
    };

    const handleQuestionChange = (e) => {
        setText(e.target.value);
        onUpdate(question.id, { ...question, text: e.target.value });
    };

    return (
        <div className="multiple-choice-question">
            <Form.Group>
                <Form.Label>{t('Question_Text')}</Form.Label>
                <Form.Control
                    type="text"
                    value={text}
                    onChange={handleQuestionChange}
                />
            </Form.Group>
            {options.map((option, index) => (
                <Form.Group key={index}>
                    <Form.Check
                        type="checkbox"
                        label={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                </Form.Group>
            ))}
            <Button onClick={handleAddOption}>{t('Add_Option')}</Button>
        </div>
    );
};

export default MultipleChoiceQuestion;
