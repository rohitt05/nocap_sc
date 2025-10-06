// import 'react-native-url-polyfill/auto'
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from 'expo-modules-core';
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";
import { supabase } from "../../../lib/supabase";
import { Session } from "@supabase/supabase-js";

interface NotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [userSession, setUserSession] = useState<Session | null>(null);

    const notificationListener = useRef<EventSubscription | null>(null);
    const responseListener = useRef<EventSubscription | null>(null);

    // Handle push token registration
    useEffect(() => {
        const registerForNotifications = async () => {
            try {
                const token = await registerForPushNotificationsAsync();
                setExpoPushToken(token ?? null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                console.error("Failed to register for push notifications:", err);
            }
        };

        registerForNotifications();
    }, []);

    // Set up notification listeners
    useEffect(() => {
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log("Notification received:", notification);
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("Notification Response:", response);
            console.log("Notification Data:", response.notification.request.content.data);
        });

        // Cleanup function
        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    // Listen for auth state changes
    useEffect(() => {
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUserSession(session);

            // If user signs out, we should clear any stored tokens
            if (event === 'SIGNED_OUT') {
                setExpoPushToken(null);
                console.log('User signed out, cleared push token state');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Save expo push token to Supabase when both token and user are available
    useEffect(() => {
        // In NotificationProvider.jsx, update the saveTokenToSupabase function:
        const saveTokenToSupabase = async () => {
            // Very explicitly check for valid session before attempting any operations
            if (!expoPushToken || !userSession || !userSession.user || !userSession.user.id) {
                console.log('Skipping token save - no valid session or token');
                return;
            }

            // Verify session is valid before proceeding
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error || !data.user) {
                    console.log('Session appears invalid, not saving token');
                    return;
                }

                // Rest of your token saving logic...
            } catch (err) {
                console.error('Error checking session before token save:', err);
            }
        };

        saveTokenToSupabase();
    }, [expoPushToken, userSession]);

    return (
        <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
            {children}
        </NotificationContext.Provider>
    );
};