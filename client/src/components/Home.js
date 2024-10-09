import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {Modal, Button, Form} from 'react-bootstrap';
import './style/Home.css';

const Home = ({isAuthenticated}) => {
    const { t } = useTranslation();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formName, setFormName] = useState('');
    const navigate = useNavigate();

    const templates = [
        {id: 1, title: t('EventRegistration'), description: t('Formforeventregistration')},
        {id: 2, title: t('CustomerFeedback'), description: t('Formforcollectingcustomerfeedback')},
        {id: 3, title: t('ContactInformation'), description: t('Formforcollectingcontactinfo')},
    ];

    const handleCreateNewForm = () => {
        setSelectedTemplate({title: 'Create New Form', description: 'Start from scratch.'});
        setShowModal(true);
    };

    const handleTemplateClick = (template) => {
        setSelectedTemplate(template);
        setShowModal(true);
    };

    const handleCopyTemplate = () => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            // Logic to copy the template or create a new form
            console.log('Template copied or new form created:', formName || selectedTemplate.title);
            setShowModal(false);
            // Redirect to form editor
            navigate('/create-form');
        }
    };

    return (
        <div className="home-page">
            <h2>{t('SelectaSurveyTemplateorCreateaNewOne')}</h2>

            <div className="template-list">
                <div className="template-card" onClick={handleCreateNewForm}>
                    <h3>{t('CreateNewForm')}</h3>
                </div>

                {templates.map((template) => (
                    <div key={template.id} className="template-card" onClick={() => handleTemplateClick(template)}>
                        <h3>{template.title}</h3>
                        <p>{template.description}</p>
                    </div>
                ))}
            </div>

            {/* Modal for displaying selected template or new form creation */}
            {selectedTemplate && (
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedTemplate.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedTemplate.title === 'Create New Form' ? (
                            <>
                                <p>{selectedTemplate.description}</p>
                                <Form.Group controlId="formName">
                                    <Form.Label>{t('FormName')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter a name for your form"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                    />
                                </Form.Group>
                            </>
                        ) : (
                            <>
                                <p>{selectedTemplate.description}</p>
                                {/* Add additional details about the template here */}
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            {t('Close')}
                        </Button>
                        <Button variant="primary" onClick={handleCopyTemplate}>
                            {isAuthenticated ? t('Proceed') : t('LogintoUse')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default Home;
