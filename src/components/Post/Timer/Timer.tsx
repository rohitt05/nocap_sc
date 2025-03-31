import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../../utils/Fonts/fonts';

const Timer = ({ promptDate, promptTime, expiresAt }) => {
    const [timeDisplay, setTimeDisplay] = useState('');
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        if (!promptDate) return;

        const selectedTime = new Date(promptDate);
        const postingDeadline = new Date(selectedTime.getTime() + (30 * 60 * 1000)); // 30 minutes window

        const updateTime = () => {
            const now = new Date();

            if (now > postingDeadline) {
                // Late period
                setIsLate(true);

                const lateDiffMs = now.getTime() - postingDeadline.getTime();
                const lateHours = Math.floor(lateDiffMs / (60 * 60 * 1000));
                const lateMinutes = Math.floor((lateDiffMs % (60 * 60 * 1000)) / (60 * 1000));
                const lateSeconds = Math.floor((lateDiffMs % (60 * 1000)) / 1000);

                const lateTimeString = `${lateHours.toString().padStart(2, '0')}:${lateMinutes.toString().padStart(2, '0')}:${lateSeconds.toString().padStart(2, '0')}`;
                setTimeDisplay(lateTimeString);
            } else {
                // Within 30-minute posting window
                const remainingMs = postingDeadline.getTime() - now.getTime();
                const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
                const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
                const remainingSeconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

                const remainingTimeString = `${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
                setTimeDisplay(remainingTimeString);
                setIsLate(false);
            }
        };

        // Initial update
        updateTime();

        // Set interval for updates
        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);
    }, [promptDate]);

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                {!isLate ? (
                    <Text style={styles.timeRemainingText}>
                        Time Remaining: {timeDisplay}
                    </Text>
                ) : (
                    <Text style={[styles.timeRemainingText, styles.lateText]}>
                        You are {timeDisplay} late
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 20,
    },
    progressContainer: {
        width: '100%',
    },
    timeRemainingText: {
        color: '#777777',
        fontSize: 12,
        textAlign: 'center',
        fontFamily: fonts.regular,
    },
    lateText: {
        color: '#FF5252', // Red color for late status
    },
});

export default Timer;