import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SignIn from './SignInScreen';
import SignUp from './SignUpScreen';
import ForgotPassword from './ForgotPasswordScreen';
import OnboardingScreen from './OnboardingScreen';

export default function Auth() {
    const [authMode, setAuthMode] = useState('onboarding');

    const renderAuthComponent = () => {
        switch (authMode) {
            case 'onboarding':
                return <OnboardingScreen onGetStarted={() => setAuthMode('signin')} />;
            case 'signin':
                return <SignIn onForgotPassword={() => setAuthMode('forgotpassword')} onSignUp={() => setAuthMode('signup')} />;
            case 'signup':
                return <SignUp onSignIn={() => setAuthMode('signin')} />;
            case 'forgotpassword':
                return <ForgotPassword onBackToSignIn={() => setAuthMode('signin')} />;
            default:
                return <OnboardingScreen onGetStarted={() => setAuthMode('signin')} />;
        }
    };

    return (
        <View style={styles.container}>
            {renderAuthComponent()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
});