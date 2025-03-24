import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TextContentProps {
    textContent?: string;
}

const TextContent = ({ textContent }: TextContentProps) => {
    return (
        <View style={styles.textContainer}>
            <Text style={styles.textContent}>{textContent}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    textContainer: {
        padding: 16,
        backgroundColor: '#000',
    },
    textContent: {
        fontSize: 16,
        lineHeight: 24,
        color: '#fff',
    },
});

export default TextContent;