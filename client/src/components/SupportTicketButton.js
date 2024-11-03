import React from 'react';
import './style/SupportTicketButton.css';

const SupportTicketButton = ({ setIsTicketModalOpen }) => {
    return (
        <button
            className="support-ticket-button"
            onClick={() => {
                console.log('Opening ticket modal');
                setIsTicketModalOpen(true);
            }}
        >
            ?
        </button>
    );
};

export default SupportTicketButton;
