import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import './style/CreateForm.css';


const ShortTextQuestion = ({ question, onUpdate }) => {
    const [text, setText] = useState(question.text || '');

    const handleQuestionChange = (e) => {
        setText(e.target.value);
        onUpdate(question.id, { ...question, text: e.target.value });
    };

    return (
        <div className="short-text-question">
            <Form.Group>
                <Form.Label>Question Text</Form.Label>
                <Form.Control
                    type="text"
                    value={text}
                    onChange={handleQuestionChange}
                />
            </Form.Group>
        </div>
    );
};

export default ShortTextQuestion;
