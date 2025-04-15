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
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
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