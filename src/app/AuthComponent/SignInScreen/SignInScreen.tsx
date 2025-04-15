import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { AntDesign, Entypo, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSignIn } from './useSignIn';
import SignInCarousel from './ImageCarousel';

export default function SignIn({ onForgotPassword, onSignUp }) {
    const {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        signInWithEmail
    } = useSignIn();

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <KeyboardAvoidingView
            style={styles.safeArea}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView style={styles.container}>
                <SignInCarousel />

                <View style={styles.inputContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <View style={styles.inputWrapper}>
                            <Entypo
                                name="email"
                                size={20}
                                color="#666"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                onChangeText={(text) => setEmail(text)}
                                value={email}
                                placeholder="Enter your email"
                                placeholderTextColor="#666"
                                autoCapitalize={'none'}
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons
                                name="lock-outline"
                                size={20}
                                color="#666"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                onChangeText={(text) => setPassword(text)}
                                value={password}
                                secureTextEntry={!showPassword}
                                placeholder="Enter your password"
                                placeholderTextColor="#666"
                                autoCapitalize={'none'}
                            />
                            <TouchableOpacity
                                onPress={togglePasswordVisibility}
                                style={styles.eyeIconContainer}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={onForgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={onSignUp}>
                        <Text style={styles.switchText}>
                            Don't have an account? Sign up
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        disabled={loading}
                        onPress={signInWithEmail}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View style={styles.buttonContentContainer}>
                                <AntDesign name="right" size={24} color="black" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'black',
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    inputContainer: {
        paddingHorizontal: 20,
        marginTop: 40,

    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: 'white',
        fontSize: 14,
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: 'white',
    },
    eyeIconContainer: {
        marginLeft: 10,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    forgotPasswordText: {
        color: 'white',
        fontSize: 14,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        backgroundColor: 'white',
        borderRadius: 40,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContentContainer: {
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchText: {
        color: 'white',
        fontSize: 14,
    },
});