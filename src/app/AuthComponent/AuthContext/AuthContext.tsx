import React, { createContext, useState, useContext } from 'react';
import { supabase } from '../../../../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    const signInWithEmail = async (email, password) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        } finally {
            setLoading(false);
        }
    };

    const signUpWithEmail = async (email, password, username, fullName) => {
        setLoading(true);
        try {
            const {
                data: { session },
                error
            } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        full_name: fullName,
                    }
                }
            });

            if (error) throw error;

            return {
                success: true,
                needsVerification: !session
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'yourapp://reset-password',
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        } finally {
            setLoading(false);
        }
    };
    const handleSessionRefresh = async () => {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Session refresh error:', error);
            // If refresh fails, sign the user out to prevent repeated failures
            await supabase.auth.signOut();
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                signInWithEmail,
                signUpWithEmail,
                resetPassword,
                handleSessionRefresh,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);