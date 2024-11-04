import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import './style/TicketModal.css';
import axios from 'axios';
import API_URL from "../config";

const TicketModal = ({onClose}) => {
    const {t} = useTranslation();
    const [summary, setSummary] = useState('');
    const [priority, setPriority] = useState('Medium');

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/tickets/create`,
                {
                    summary,
                    priority,
                    template: 'Default Template',
                    currentPageUrl: window.location.href,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert(t('Ticket_created_successfully'));
            console.log(response.data);
            onClose();
        } catch (error) {
            console.error(error);
            alert(t('Error_creating_ticket'));
        }
    };

    return (
        <div className="ticket-modal-overlay">
            <div className="ticket-modal-content">
                <button className="close-btn" onClick={onClose}>
                    &times;
                </button>
                <h2>{t('Create_Support_Ticket')}</h2>
                <form className="ticket-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="summary">{t('Summary')}:</label>
                        <input
                            type="text"
                            name="summary"
                            className="form-control"
                            required
                            placeholder={t('Enter_summary')}
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="priority">{t('Priority')}:</label>
                        <select
                            name="priority"
                            className="form-control"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="High">{t('High')}</option>
                            <option value="Medium">{t('Average')}</option>
                            <option value="Low">{t('Low')}</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary mt-3">
                        {t('Submit')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TicketModal;
