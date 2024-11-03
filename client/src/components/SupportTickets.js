import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const SupportTickets = () => {
    const { t } = useTranslation();
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                // Замените этот URL на ваш API для получения запросов
                const response = await fetch('/api/support-tickets');
                const data = await response.json();
                setTickets(data);
            } catch (error) {
                console.error('Ошибка при загрузке запросов:', error);
            }
        };

        fetchTickets();
    }, []);

    return (
        <div className="support-tickets-page">
            <h2>{t('Your_Support_Tickets')}</h2>
            <ul className="ticket-list">
                {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <li key={ticket.id} className="ticket-item">
                            <h3>{ticket.summary}</h3>
                            <p>{t('Priority')}: {ticket.priority}</p>
                        </li>
                    ))
                ) : (
                    <p>{t('No_tickets_found.')}</p>
                )}
            </ul>
        </div>
    );
};

export default SupportTickets;
