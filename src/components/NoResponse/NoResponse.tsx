import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../utils/Fonts/fonts';

const NoResponse = ({ hasResponseData = false }) => {
    return (
        <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
                {hasResponseData
                    ? "No responses yet. Be the first to respond to today's prompt!"
                    : "Don't be shy, Drop your reponse first to peek into your friends day"
                }
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
        color: '#aaa',
        textAlign: 'center',
        fontFamily: fonts.regular,
        padding: 40,
    },
});

export default NoResponse;