import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../../utils/Fonts/fonts'; // Make sure this path is correct

const PromptCard = ({ promptText, promptDate, promptTime, expiresAt }) => {
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isLate, setIsLate] = useState(false);

    // Format the date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    useEffect(() => {
        // Calculate initial time state
        const calculateTime = () => {
            const now = new Date();

            // The 15 minute window from when the prompt was selected
            const responseWindow = new Date(promptDate);
            responseWindow.setMinutes(responseWindow.getMinutes() + 15);

            const diffMs = responseWindow.getTime() - now.getTime();

            if (diffMs <= 0) {
                // User is late - show how late they are
                setIsLate(true);
                const lateMs = Math.abs(diffMs);
                const lateSeconds = Math.floor(lateMs / 1000);
                const hours = Math.floor(lateSeconds / 3600);
                const minutes = Math.floor((lateSeconds % 3600) / 60);
                const seconds = lateSeconds % 60;

                setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes
                    .toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                // Within the 15-minute window - show countdown
                setIsLate(false);
                const remainingSeconds = Math.floor(diffMs / 1000);
                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = remainingSeconds % 60;

                setTimeRemaining(`${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60)
                    .toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        };

        // Calculate time immediately and then set up interval
        calculateTime();
        const intervalId = setInterval(calculateTime, 1000);

        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, [promptDate]);

    return (
        <View style={styles.container}>
            <View style={styles.promptTextContainer}>
                <Text style={styles.promptText}>{promptText}</Text>
            </View>

            <View style={styles.dateTimeContainer}>
                <Text style={[
                    styles.promptDateTime,
                    isLate ? styles.lateTime : styles.onTimeText
                ]}>
                    {isLate ? `Oops... you are ${timeRemaining} late` : `Yay! you're just on time, today.`}
                </Text>

                {!isLate && (
                    <Text style={styles.timeRemainingText}>
                        {timeRemaining} remaining
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        bottom: 10,
        paddingHorizontal: 16,
        width: '100%',
    },
    promptTextContainer: {
        marginBottom: 0,
    },
    promptLabel: {
        fontSize: 14,
        color: '#888888',
        marginBottom: 8,
        textAlign: 'left',
        fontFamily: fonts.italic,
    },
    promptText: {
        fontSize: 20,
        fontFamily: fonts.medium,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 30,
    },
    dateTimeContainer: {
        width: '100%',
        alignItems: 'center',
        margin: 5,
    },
    promptDateTime: {
        fontSize: 14,
        fontFamily: fonts.semiBold,
    },
    timeRemainingText: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: '#fff',
        marginTop: 2,
    },
    onTimeText: {
        color: '#4CAF50', // Green for on time
    },
    lateTime: {
        color: '#FF9800', // Orange for late
    }
});

export default PromptCard;