import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from 'expo-modules-core';
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";

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

    const notificationListener = useRef<EventSubscription | null>(null);
    const responseListener = useRef<EventSubscription | null>(null);

    useEffect(() => {
        const setupNotifications = async () => {
            try {
                const token = await registerForPushNotificationsAsync();
                setExpoPushToken(token ?? null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                console.error("Failed to register for push notifications:", err);
            }

            // Set up notification listeners
            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                console.log("Notification received:", notification);
                setNotification(notification);
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log("Notification Response:", response);
                console.log("Notification Data:", response.notification.request.content.data);
            });
        };

        setupNotifications();

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

    return (
        <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
            {children}
        </NotificationContext.Provider>
    );
}