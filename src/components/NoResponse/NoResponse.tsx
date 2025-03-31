import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NoResponse = () => {
    return (
        <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
                Don’t be shy, share your vibe to see theirs! 😏
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
    },
    messageText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default NoResponse;