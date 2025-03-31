import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import SignUpCarousel from './ImageCarousel';
import {
    createSignupSteps,
    validateCurrentStep,
    signUpWithEmail,
    SignupStep
} from './signUpUtils';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const CAROUSEL_HEIGHT = screenHeight * 0.7;

export default function SignUp({ onSignIn }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const steps = createSignupSteps(
        fullName, setFullName,
        username, setUsername,
        email, setEmail,
        password, setPassword
    );

    const handleNext = () => {
        const currentStepData = steps[currentStep];

        if (!validateCurrentStep(currentStepData)) {
            return;
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSignUp();
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        try {
            const success = await signUpWithEmail(email, password, username, fullName);
            if (success) {
                // Handle successful signup (e.g., navigate to next screen)
            }
        } catch (error) {
            // Handle signup error (show error message, etc.)
            console.error('Signup failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderIcon = (step) => {
        const iconProps = {
            size: 20,
            color: '#888',
            style: styles.inputIcon
        };

        switch (step.iconType) {
            case 'AntDesign':
                return <AntDesign name={step.iconName} {...iconProps} />;
            case 'Entypo':
                return <Entypo name={step.iconName} {...iconProps} />;
            case 'Feather':
                return <Feather name={step.iconName} {...iconProps} />;
            case 'MaterialIcons':
                return <MaterialIcons name={step.iconName} {...iconProps} />;
            default:
                return null;
        }
    };

    const currentStepData = steps[currentStep];

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.carouselContainer, { height: CAROUSEL_HEIGHT }]}>
                    <SignUpCarousel />
                </View>

                <View style={styles.overlay}>
                    <View style={styles.formContainer}>
                        <View style={styles.subtitleContainer}>
                            <Text style={styles.subtitle}>{currentStepData.field}</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            {renderIcon(currentStepData)}
                            <TextInput
                                style={styles.input}
                                onChangeText={(text) => currentStepData.setter(text)}
                                value={currentStepData.value}
                                placeholder={currentStepData.placeholder}
                                placeholderTextColor="#888"
                                autoCapitalize={currentStepData.autoCapitalize || 'none'}
                                secureTextEntry={
                                    currentStepData.field === 'Password'
                                        ? !showPassword
                                        : currentStepData.secureTextEntry
                                }
                                keyboardType={currentStepData.keyboardType}
                                autoCorrect={false}
                                underlineColorAndroid="transparent"
                            />
                            {currentStepData.field === 'Password' && (
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.passwordVisibilityToggle}
                                >
                                    <MaterialIcons
                                        name={showPassword ? 'visibility-off' : 'visibility'}
                                        size={20}
                                        color="#888"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>


                        <View style={styles.navigationContainer}>
                            {currentStep > 0 && (
                                <TouchableOpacity
                                    onPress={handleBack}
                                    style={styles.backButton}
                                    accessibilityLabel="Previous step"
                                >
                                    <AntDesign name="left" size={24} color="white" />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={handleNext}
                                style={styles.nextButton}
                                disabled={loading}
                                accessibilityLabel="Next step"
                            >
                                {loading ? (
                                    <ActivityIndicator color="black" />
                                ) : (
                                    <AntDesign name="right" size={24} color="black" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={onSignIn}
                            style={styles.switchContainer}
                            accessibilityLabel="Switch to Sign In"
                        >
                            <Text style={styles.switchText}>
                                Already have an account? Sign in
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    carouselContainer: {
        backgroundColor: 'black',
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    formContainer: {
        width: '100%',
        backgroundColor: 'black',
        padding: 20,
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    subtitleContainer: {
        width: '100%',
        alignItems: 'flex-start',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 15,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'left',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
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
    passwordVisibilityToggle: {
        padding: 5,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButton: {
        backgroundColor: 'white',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
    },
    switchContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        color: 'white',
    },
});