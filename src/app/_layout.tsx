import React, { useState, useEffect } from "react";
import { Slot, Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase";
import Auth from "../components/Auth";

export default function RootLayout() {
    const [session, setSession] = useState(null);

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
            {session ? (
                <Slot />
            ) : (
                <View style={styles.authContainer}>
                    <Auth />
                </View>
            )}
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    authContainer: {
        flex: 1,
    },
});