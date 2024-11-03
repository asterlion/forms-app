import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './style/TicketModal.css';

const TicketModal = ({ onClose }) => {
    const { t } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.classList.contains('ticket-modal-overlay')) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="ticket-modal-overlay">
            <div className="ticket-modal-content">
                <button className="close-btn" onClick={onClose}>
                    &times;
                </button>
                <h2>{t('Create_Support_Ticket')}</h2>
                <form className="ticket-form">
                    <div className="form-group">
                        <label htmlFor="summary">{t('Summary')}:</label>
                        <input type="text" name="summary" className="form-control" required placeholder={t('Enter_summary')} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="priority">{t('Priority')}:</label>
                        <select name="priority" className="form-control">
                            <option value="High">{t('High')}</option>
                            <option value="Average">{t('Average')}</option>
                            <option value="Low">{t('Low')}</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary mt-3">{t('Submit')}</button>
                </form>
            </div>
        </div>
    );
};

export default TicketModal;
