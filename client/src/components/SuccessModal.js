import React, { useEffect} from 'react';
import {Modal} from 'react-bootstrap';
import {useTranslation} from 'react-i18next';

const SuccessModal = ({show, handleClose}) => {
    console.log("Показать модальное окно:", show);
    const {t} = useTranslation();

    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                handleClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, handleClose]);

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{t('Success')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{t('UserSuccessfullyRegistered')}</p>
            </Modal.Body>
        </Modal>
    );
};

export default SuccessModal;
