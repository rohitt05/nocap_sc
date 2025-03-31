// context/NotificationContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [hasUnread, setHasUnread] = useState(false);

    // Function to update unread status
    const updateUnreadStatus = (status) => {
        setHasUnread(status);
    };

    return (
        <NotificationContext.Provider value={{ hasUnread, updateUnreadStatus }
        }>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);