import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../../utils/Fonts/fonts'; // Update this path as needed

const Timer = ({ promptDate, promptTime, expiresAt }) => {
    const [timeRemaining, setTimeRemaining] = useState(promptTime);
    const [percentRemaining, setPercentRemaining] = useState(100);

    // Calculate and update time remaining
    useEffect(() => {
        if (!expiresAt) return;

        const expiryTime = new Date(expiresAt);

        const updateTime = () => {
            const now = new Date();
            const diffMs = expiryTime.getTime() - now.getTime();

            if (diffMs <= 0) {
                setTimeRemaining("00:00:00");
                setPercentRemaining(0);
                return;
            }

            // Calculate time remaining
            const diffSecs = Math.floor(diffMs / 1000);
            const hours = Math.floor(diffSecs / 3600);
            const minutes = Math.floor((diffSecs % 3600) / 60);
            const seconds = diffSecs % 60;

            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            setTimeRemaining(timeString);

            // Calculate percentage for the progress bar
            const totalSeconds = 24 * 60 * 60; // 24 hours in seconds
            const percentRemaining = (diffSecs / totalSeconds) * 100;
            setPercentRemaining(Math.max(0, Math.min(percentRemaining, 100)));
        };

        // Initial update
        updateTime();

        // Set interval for updates
        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);
    }, [expiresAt]);

    // Calculate progress bar color based on time remaining
    const getProgressBarColor = () => {
        if (percentRemaining > 66) return '#fff';
        if (percentRemaining > 33) return '#FFC107'; // Yellow
        return '#FF5252'; // Red
    };

    return (
        <View style={styles.container}>
            {/* Time Remaining Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${percentRemaining}%`,
                                backgroundColor: getProgressBarColor()
                            }
                        ]}
                    />
                </View>
                <Text style={styles.timeRemainingText}>{timeRemaining} remaining</Text>
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
    progressBarBackground: {
        height: 3,
        backgroundColor: '#333',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 5,
    },
    progressBarFill: {
        height: '100%',
    },
    timeRemainingText: {
        color: '#777777',
        fontSize: 12,
        textAlign: 'center',
        fontFamily: fonts.regular,
    },
});

export default Timer;