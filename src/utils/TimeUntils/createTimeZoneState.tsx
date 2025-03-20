// Create a file named timeZoneState.js in a shared location (e.g., in src/utils/)

import { useState, useEffect } from 'react';

// Use a simple module pattern to create a shared state
const createTimeZoneState = () => {
    let listeners = [];
    let currentTimeZone = 'South Asia'; // Default value

    // Function to get current timezone
    const getTimeZone = () => currentTimeZone;

    // Function to set timezone
    const setTimeZone = (newTimeZone) => {
        currentTimeZone = newTimeZone;
        // Notify all listeners
        listeners.forEach(listener => listener(currentTimeZone));
    };

    // Hook to use the timezone state in components
    const useTimeZone = () => {
        const [timeZone, setLocalTimeZone] = useState(currentTimeZone);

        useEffect(() => {
            // Add listener
            const listenerId = listeners.length;
            listeners.push(setLocalTimeZone);

            // Remove listener on cleanup
            return () => {
                listeners = listeners.filter((_, id) => id !== listenerId);
            };
        }, []);

        return [timeZone, setTimeZone];
    };

    return {
        getTimeZone,
        setTimeZone,
        useTimeZone
    };
};

// Create and export a singleton instance
export default createTimeZoneState();