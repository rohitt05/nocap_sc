import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { loadFonts } from '../../utils/Fonts/fonts';
import { Link } from 'expo-router';
import { styles } from './styles';
import { fetchPromptOfTheDay } from '../../../API/fetchpromptoftheday';
import { fetchAuthUser } from '../../../API/fetchauthuser'; // Import the new function

const PromptOfTheDay = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [fontError, setFontError] = useState(null);
    const [promptData, setPromptData] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(100); // Start at 100%
    const [loading, setLoading] = useState(true);
    const [expiryTime, setExpiryTime] = useState(null);
    const [userData, setUserData] = useState(null); // New state for user data

    // Load fonts
    useEffect(() => {
        async function setupFonts() {
            const result = await loadFonts();
            setFontsLoaded(true);
            if (!result.success) {
                setFontError(result.error);
            }
        }

        setupFonts();
    }, []);

    // Fetch user data
    useEffect(() => {
        async function getUserData() {
            try {
                const user = await fetchAuthUser();
                setUserData(user);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }

        getUserData();
    }, []);

    // Fetch prompt data
    useEffect(() => {
        async function getPromptData() {
            if (!fontsLoaded) return;

            try {
                const data = await fetchPromptOfTheDay();

                setPromptData({
                    text: data.prompt.text,
                    time: data.timeRemaining
                });

                // Store expiry time for calculations
                setExpiryTime(new Date(data.expiresAt));

                // Calculate initial percentage of time remaining
                updateTimeRemainingPercentage(new Date(data.expiresAt));

            } catch (error) {
                console.error('Error fetching prompt:', error);
                // Fallback to default prompt
                setPromptData({
                    text: "What was your most memorable moment today?",
                    time: "00:00:00"
                });
            } finally {
                setLoading(false);
            }
        }

        getPromptData();
    }, [fontsLoaded]);

    // Calculate and update time remaining percentage
    const updateTimeRemainingPercentage = (expiryTime) => {
        const now = new Date();
        const diffMs = expiryTime.getTime() - now.getTime();
        const diffSecs = Math.floor(diffMs / 1000);

        // 24 hours in seconds
        const totalSeconds = 24 * 60 * 60;
        const percentRemaining = (diffSecs / totalSeconds) * 100;

        setTimeRemaining(Math.max(0, Math.min(percentRemaining, 100)));
    };

    // Update time remaining every minute
    useEffect(() => {
        if (expiryTime) {
            // Initial update
            updateTimeRemainingPercentage(expiryTime);

            // Set up interval for updates
            const timer = setInterval(() => {
                const now = new Date();

                // Update time string
                if (promptData) {
                    const diffMs = expiryTime.getTime() - now.getTime();
                    const diffSecs = Math.floor(diffMs / 1000);
                    const hours = Math.floor(diffSecs / 3600);
                    const minutes = Math.floor((diffSecs % 3600) / 60);
                    const seconds = diffSecs % 60;

                    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                    setPromptData(prev => ({
                        ...prev,
                        time: timeString
                    }));
                }

                // Update progress bar
                updateTimeRemainingPercentage(expiryTime);

            }, 60000); // Update every minute

            return () => clearInterval(timer);
        }
    }, [expiryTime]);

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6441A5" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // Calculate progress bar color based on time remaining
    const getProgressBarColor = () => {
        if (timeRemaining > 66) return '#fff';
        if (timeRemaining > 33) return '#FFC107'; // Yellow
        return '#FF5252'; // Red
    };

    // Get time remaining text
    const getTimeRemainingText = () => {
        if (!promptData) return "00:00:00 remaining";

        const [hours, minutes] = promptData.time.split(':');
        return `${hours}:${minutes} remaining`;
    };

    return (
        <View style={styles.container}>
            {fontError && <Text style={styles.errorText}>Font loading error. Using system fonts.</Text>}

            {/* Greeting and title moved outside the card */}
            <View style={styles.outsideHeader}>
                <Text style={styles.greetingText}>Hi, {userData?.full_name || 'User'}! 👋</Text>
                <Text style={styles.promptTitle}>Prompt of the day</Text>
            </View>

            <Link href="(tabs)/post/" asChild>
                <TouchableOpacity style={styles.promptCard}>
                    <View style={styles.promptContainer}>
                        <View style={styles.promptTextBorder}>
                            <Text style={styles.promptText}>
                                {promptData?.text || "No prompt available"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.tapToAnswerText}>"tap to answer"</Text>
                        <Text style={styles.promptTime}>{promptData?.time || "00:00:00"}</Text>
                    </View>
                </TouchableOpacity>
            </Link>

            {/* Time Remaining Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${timeRemaining}%`,
                                backgroundColor: getProgressBarColor()
                            }
                        ]}
                    />
                </View>
                <Text style={styles.timeRemainingText}>{getTimeRemainingText()}</Text>
            </View>
        </View>
    );
};

export default PromptOfTheDay;