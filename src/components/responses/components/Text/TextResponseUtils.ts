// TextResponseUtils.js
import { Platform } from 'react-native';

/**
 * Formats a timestamp into the format: "17 Mar · 3:24 PM"
 * @param {string|number} timestamp - The timestamp to format
 * @returns {string} The formatted timestamp
 */
export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${day} ${month} · ${formattedHours}:${formattedMinutes} ${ampm}`;
};

/**
 * Estimates if text content needs an expansion button based on its length
 * @param {string} content - The text content to analyze
 * @returns {boolean} Whether the content likely needs expansion
 */
export const estimateNeedsExpansion = (content) => {
    if (!content) return false;

    // Adjusted based on font size and container width
    const charsPerLine = 40;

    // Count actual lines by looking for newlines
    const newlineCount = (content.match(/\n/g) || []).length;

    // Calculate approximate lines from text length
    const textLength = content.length;
    const estimatedLines = Math.ceil(textLength / charsPerLine);

    // Use the greater of the two counts
    const totalLines = Math.max(newlineCount + 1, estimatedLines);

    // Only need expansion if more than 3 lines
    return totalLines > 3;
};

/**
 * Validates if a user ID is valid
 * @param {string} userId - The user ID to validate
 * @returns {boolean} Whether the user ID is valid
 */
export const isValidUserId = (userId) => {
    return !!userId && typeof userId === 'string' && userId.length > 0;
};

/**
 * Measures text element height (platform-specific implementation)
 * @param {React.RefObject} textRef - Reference to the text component
 * @param {Function} callback - Callback function with measurement results
 */
export const measureTextLines = (textRef, callback) => {
    if (!textRef.current) return;

    // This is a placeholder for actual platform-specific measurement logic
    if (Platform.OS === 'ios') {
        // iOS-specific measurement logic would go here
        // In a real implementation, this would use native methods
    } else if (Platform.OS === 'android') {
        // Android-specific measurement logic would go here
    }

    // Simulate measurement with a timeout
    setTimeout(() => {
        if (callback) callback();
    }, 100);
};