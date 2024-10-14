import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const SingleChoiceQuestion = ({ question, onUpdate }) => {
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
        <div className="single-choice-question">
            <Form.Group>
                <Form.Label>Question Text</Form.Label>
                <Form.Control
                    type="text"
                    value={text}
                    onChange={handleQuestionChange}
                />
            </Form.Group>
            {options.map((option, index) => (
                <Form.Group key={index}>
                    <Form.Label>Option {index + 1}</Form.Label>
                    <Form.Control
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                </Form.Group>
            ))}
            <Button onClick={handleAddOption}>Add Option</Button>
        </div>
    );
};

export default SingleChoiceQuestion;
