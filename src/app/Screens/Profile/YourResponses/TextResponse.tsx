import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TextResponse = ({ response }) => {
    return (
        <View style={styles.responseContainer}>
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                <Text style={styles.text}>
                    {response}
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    responseContainer: {
        height: 180,
        width: 150,
        backgroundColor: '#000', // Black background
        borderBottomWidth: 0.6,
        borderBottomColor: '#333',
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    text: {
        color: '#CCC',
        fontSize: 14,
        lineHeight: 18,
        textAlign: 'left',
    },
});

export default TextResponse;
