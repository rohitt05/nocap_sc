import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const TextResponse = ({ response }) => {
    return (
        <View style={styles.responsePreviewContainer}>
            <Feather name="message-circle" size={24} color="white" style={styles.previewIcon} />
            <ScrollView
                style={styles.textScrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
            >
                <Text style={styles.responsePreviewText}>
                    {response}
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    responsePreviewContainer: {
        height: 180, // Increased height from 150 to 180
        backgroundColor: '#000',
        padding: 12,
        borderBottomWidth: 0.6,
        borderBottomColor: '#333',
    },
    previewIcon: {
        opacity: 0.9,
        marginBottom: 6,
    },
    textScrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: 6,
    },
    responsePreviewText: {
        color: '#CCC',
        fontSize: 15,
        lineHeight: 20,
    },
});

export default TextResponse;