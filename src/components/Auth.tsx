import React, { useState } from 'react'
import { Alert, StyleSheet, View, Text, Button, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [forgotPassword, setForgotPassword] = useState(false)

    async function signInWithEmail() {
        if (!email || !password) {
            return Alert.alert('Missing fields', 'Please fill in all required fields')
        }

        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert('Error signing in', error.message)
        setLoading(false)
    }

    async function signUpWithEmail() {
        if (!email || !password || !username || !fullName) {
            return Alert.alert('Missing fields', 'Please fill in all required fields')
        }

        setLoading(true)
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    full_name: fullName,
                }
            }
        })

        if (error) Alert.alert('Error signing up', error.message)
        if (!session) Alert.alert('Verification needed', 'Please check your inbox for email verification!')
        setLoading(false)
    }

    async function resetPassword() {
        if (!email) {
            return Alert.alert('Email required', 'Please enter your email address')
        }

        setLoading(true)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'yourapp://reset-password',
        })

        if (error) {
            Alert.alert('Error', error.message)
        } else {
            Alert.alert('Password reset email sent', 'Check your email for the password reset link')
            setForgotPassword(false)
        }
        setLoading(false)
    }

    if (forgotPassword) {
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
                        onPress={() => resetPassword()}
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
                    onPress={() => setForgotPassword(false)}
                >
                    <Text style={styles.textLinkContent}>Back to login</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>

            {isSignUp && (
                <>
                    <View style={[styles.verticallySpaced, styles.mt20]}>
                        <TextInput
                            style={styles.input}
                            onChangeText={(text) => setFullName(text)}
                            value={fullName}
                            placeholder="Full Name"
                            autoCapitalize={'words'}
                        />
                    </View>
                    <View style={styles.verticallySpaced}>
                        <TextInput
                            style={styles.input}
                            onChangeText={(text) => setUsername(text)}
                            value={username}
                            placeholder="Username"
                            autoCapitalize={'none'}
                        />
                    </View>
                </>
            )}

            <View style={[styles.verticallySpaced, isSignUp ? null : styles.mt20]}>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="Email address"
                    autoCapitalize={'none'}
                    keyboardType="email-address"
                />
            </View>

            <View style={styles.verticallySpaced}>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize={'none'}
                />
            </View>

            {!isSignUp && (
                <TouchableOpacity
                    style={styles.textLink}
                    onPress={() => setForgotPassword(true)}
                >
                    <Text style={styles.textLinkContent}>Forgot your password?</Text>
                </TouchableOpacity>
            )}

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <TouchableOpacity
                    style={styles.button}
                    disabled={loading}
                    onPress={() => isSignUp ? signUpWithEmail() : signInWithEmail()}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.verticallySpaced}>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                    <Text style={styles.switchText}>
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 40,
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
    switchText: {
        color: '#0055ff',
        textAlign: 'center',
        marginTop: 10,
    },
    textLink: {
        alignSelf: 'flex-end',
        marginVertical: 8,
    },
    textLinkContent: {
        color: '#0055ff',
        fontSize: 14,
    },
})