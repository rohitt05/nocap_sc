import { Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';

export interface SignupStep {
    field: string;
    value: string;
    setter: (value: string) => void;
    placeholder: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    validation: () => boolean;
    iconType?: 'AntDesign' | 'Entypo' | 'Feather' | 'MaterialIcons';
    iconName?: string;
}

export const createSignupSteps = (
    fullName: string,
    setFullName: (value: string) => void,
    username: string,
    setUsername: (value: string) => void,
    email: string,
    setEmail: (value: string) => void,
    password: string,
    setPassword: (value: string) => void
): SignupStep[] => {
    return [
        {
            field: 'Full Name',
            value: fullName,
            setter: setFullName,
            placeholder: 'Enter your full name',
            autoCapitalize: 'words',
            validation: () => fullName.trim().length > 0,
            iconType: 'AntDesign',
            iconName: 'user'
        },
        {
            field: 'Username',
            value: username,
            setter: setUsername,
            placeholder: 'Choose a username',
            autoCapitalize: 'none',
            validation: () => username.trim().length > 0,
            iconType: 'Feather',
            iconName: 'feather'
        },
        {
            field: 'Email',
            value: email,
            setter: setEmail,
            placeholder: 'Enter your email',
            autoCapitalize: 'none',
            keyboardType: 'email-address',
            validation: () => /\S+@\S+\.\S+/.test(email),
            iconType: 'Entypo',
            iconName: 'email'
        },
        {
            field: 'Password',
            value: password,
            setter: setPassword,
            placeholder: 'Create a password',
            secureTextEntry: true, // Explicitly set to true
            autoCapitalize: 'none',
            validation: () => password.length >= 6,
            iconType: 'MaterialIcons',
            iconName: 'lock'
        }
    ];
};

export const validateCurrentStep = (currentStep: SignupStep): boolean => {
    const isValid = currentStep.validation();
    if (!isValid) {
        Alert.alert('Invalid Input', `Please enter a valid ${currentStep.field}`);
    }
    return isValid;
};

export const signUpWithEmail = async (
    email: string,
    password: string,
    username: string,
    fullName: string
) => {
    try {
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    full_name: fullName,
                }
            }
        });

        if (error) {
            Alert.alert('Error signing up', error.message);
            return false;
        }
        return true;
    } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred');
        return false;
    }
};