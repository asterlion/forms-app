import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_URL from "../config";
import './style/SupportTickets.css';

const SupportTickets = () => {
    const { t } = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'key', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const ticketsPerPage = 5;

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token is missing');
                }

                const response = await axios.get(`${API_URL}/api/jira/tickets`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setTickets(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке запросов:', error);
                setError(error.message);
            }
        };

        fetchTickets();
    }, []);

    const sortedTickets = [...tickets].sort((a, b) => {
        const aKeyNum = parseInt(a.key.split('-')[1], 10); // Extract numeric part
        const bKeyNum = parseInt(b.key.split('-')[1], 10); // Extract numeric part

        if (sortConfig.key === 'key') {
            return sortConfig.direction === 'ascending' ? aKeyNum - bKeyNum : bKeyNum - aKeyNum;
        }

        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    // Pagination Logic
    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = sortedTickets.slice(indexOfFirstTicket, indexOfLastTicket);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="support-tickets-page container mt-4">
            <h2 className="mb-4">{t('Your_Support_Tickets')}</h2>
            {error ? (
                <p className="text-danger">{t(error)}</p>
            ) : (
                <>
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th onClick={() => requestSort('key')} style={{ cursor: 'pointer' }}>
                                {t('Ticket_ID')} {getSortIcon('key')}
                            </th>
                            <th onClick={() => requestSort('summary')} style={{ cursor: 'pointer' }}>
                                {t('Summary')} {getSortIcon('summary')}
                            </th>
                            <th onClick={() => requestSort('priority')} style={{ cursor: 'pointer' }}>
                                {t('Priority')} {getSortIcon('priority')}
                            </th>
                            <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                                {t('Status')} {getSortIcon('status')}
                            </th>
                            <th>{t('Link')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentTickets.length > 0 ? (
                            currentTickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td>{ticket.key}</td>
                                    <td>{ticket.summary}</td>
                                    <td>{ticket.priority}</td>
                                    <td>{ticket.status}</td>
                                    <td>
                                        <a href={ticket.customQueueUrl} target="_blank" rel="noopener noreferrer">
                                            {t('View_Ticket')}
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">{t('No_tickets_found')}</td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <nav>
                        <ul className="pagination">
                            {Array.from({ length: Math.ceil(tickets.length / ticketsPerPage) }, (_, index) => (
                                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                    <button onClick={() => paginate(index + 1)} className="page-link">
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </>
            )}
        </div>
    );
};

export default SupportTickets;
