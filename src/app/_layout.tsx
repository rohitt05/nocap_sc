import React, { useState, useEffect } from "react";
import { Slot, Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase";
import Auth from "./AuthComponent/Auth";
import { Session } from "@supabase/supabase-js";
import { NotificationProvider } from "./context/NotificationContext"; // Adjust the import path as needed
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function RootLayout() {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        // Get initial session with proper error handling
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Error getting initial session:', error);
                // Don't set session if there's an error
                return;
            }
            setSession(session);
        });

        // Listen for auth changes with specific event handling
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);

            // Handle different auth events
            if (event === 'SIGNED_OUT') {
                setSession(null);
                console.log('User signed out, clearing session');
            } else if (event === 'SIGNED_IN') {
                setSession(session);
                console.log('User signed in, updating session');
            } else if (event === 'TOKEN_REFRESHED') {
                setSession(session);
                console.log('Token refreshed, updating session');
            } else if (event === 'USER_UPDATED') {
                setSession(session);
                console.log('User updated, updating session');
            } else {
                // For any other events, just update the session if we have one
                if (session) {
                    setSession(session);
                    console.log('Other auth event, updating session');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NotificationProvider>
                {session ? (
                    <Slot />
                ) : (
                    <View style={styles.authContainer}>
                        <Auth />
                    </View>
                )}
            </NotificationProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    authContainer: {
        flex: 1,
    },
});