import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface ErrorContentProps {
    message?: string;
}

const ErrorContent = ({ message = "Unsupported content type" }: ErrorContentProps) => {
    return <Text style={styles.errorText}>{message}</Text>;
};

const styles = StyleSheet.create({
    errorText: {
        fontSize: 16,
        color: '#ff3b30',
        textAlign: 'center',
    }
});

export default ErrorContent;