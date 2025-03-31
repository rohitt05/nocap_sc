import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../../../lib/supabase';

export default function ForgotPassword({ onBackToSignIn }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function resetPassword() {
        if (!email) {
            return Alert.alert('Email required', 'Please enter your email address');
        }

        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'yourapp://reset-password',
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Password reset email sent', 'Check your email for the password reset link');
        }
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="Email address"
                    autoCapitalize={'none'}
                    keyboardType="email-address"
                />
            </View>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <TouchableOpacity
                    style={styles.button}
                    disabled={loading}
                    onPress={resetPassword}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Send Reset Instructions</Text>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.textLink}
                onPress={onBackToSignIn}
            >
                <Text style={styles.textLinkContent}>Back to login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginVertical: 5,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#0055ff',
        borderRadius: 5,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    textLink: {
        alignSelf: 'center',
        marginTop: 15,
    },
    textLinkContent: {
        color: '#0055ff',
        fontSize: 14,
    },
});