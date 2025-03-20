import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../../utils/Fonts/fonts'; // Make sure this path is correct

const PromptCard = ({ promptText, promptDate, promptTime }) => {
    // Format the date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <View style={styles.container}>
            <View style={styles.promptTextContainer}>
                <Text style={styles.promptLabel}>Today's Prompt *</Text>
                <Text style={styles.promptText}>{promptText}</Text>
            </View>

            <View style={styles.dateTimeContainer}>
                <Text style={styles.promptDateTime}>
                    {formatDate(promptDate)} • {promptTime}
                </Text>
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
        marginBottom: 10,
    },
    promptLabel: {
        fontSize: 14,
        color: '#888888',
        marginBottom: 8,
        textAlign: 'left', // Changed to left alignment
        fontFamily: fonts.italic,
    },
    promptText: {
        fontSize: 28,
        fontFamily: fonts.bold,
        color: '#fff',
        textAlign: 'center', // Keeping the main prompt text centered
        lineHeight: 36,
    },
    dateTimeContainer: {
        width: '100%',
        alignItems: 'center',
    },
    promptDateTime: {
        color: '#777777',
        fontSize: 14,
        fontFamily: fonts.semiBold,
    },
});

export default PromptCard;