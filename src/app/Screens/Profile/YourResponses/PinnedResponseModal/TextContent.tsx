import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface TextContentProps {
    textContent?: string;
}

const TextContent = ({ textContent }: TextContentProps) => {
    return (
        <View style={styles.textContainer}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.textContent}>{textContent}</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    textContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    scrollContent: {
        flexGrow: 1,
    },
    textContent: {
        fontSize: 16,
        lineHeight: 24,
        color: '#fff',
        bottom: 20,
    },
});

export default TextContent;