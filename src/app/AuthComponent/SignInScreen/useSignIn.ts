import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';

export const useSignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const signInWithEmail = async () => {
        if (!email || !password) {
            return Alert.alert('Missing fields', 'Please fill in all required fields');
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) Alert.alert('Error signing in', error.message);
        setLoading(false);
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        signInWithEmail
    };
};