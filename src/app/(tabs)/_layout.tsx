import { Tabs } from "expo-router";
import { Entypo, Ionicons, FontAwesome } from "@expo/vector-icons";
import { HomeHeader, StandardHeader } from "../../components/Header/Header";
import React, { useState, useEffect } from "react";
import { Animated, Keyboard, Platform } from "react-native";

export default function TabLayout() {
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // Common tab screen options 
    const getCommonScreenOptions = (title: string) => ({
        headerTitle: () => <StandardHeader title={title} />,
        title: title.toLowerCase(),
        headerTintColor: 'white',
    });

    useEffect(() => {
        // Keyboard listeners
        const keyboardWillShowListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true))
            : Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));

        const keyboardWillHideListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false))
            : Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        // Cleanup
        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: 'black',
                    borderTopWidth: 0,
                    display: keyboardVisible ? 'none' : 'flex', // Hide tab bar when keyboard is visible
                },
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: 'gray',
                tabBarShowLabel: true,
                headerStyle: {
                    backgroundColor: 'black',
                    height: 60,
                },
                headerTintColor: 'white',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerTitle: () => <HomeHeader scrollY={new Animated.Value(0)} />,
                    title: 'home',
                    tabBarIcon: ({ color }) => <Entypo name="home" size={24} color={color} />
                }}
            />

            {/* Rest of your tab screens remain unchanged */}
            <Tabs.Screen
                name="friends"
                options={{
                    headerShown: false,
                    ...getCommonScreenOptions('Friends'),
                    tabBarIcon: ({ color }) => <Ionicons name="people-sharp" size={24} color={color} />
                }}
            />

            <Tabs.Screen
                name="post"
                options={{
                    headerShown: false,
                    ...getCommonScreenOptions('Post'),
                    tabBarIcon: ({ color }) => <Entypo name="plus" size={24} color={color} />
                }}
            />

            <Tabs.Screen
                name="notifications"
                options={{
                    headerShown: false,
                    ...getCommonScreenOptions('notifications'),
                    tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} />
                }}
            />

            <Tabs.Screen
                name="archives"
                options={{
                    headerShown: false,
                    title: 'archives',
                    tabBarIcon: ({ color }) => <Entypo name="archive" size={24} color={color} />
                }}
            />
        </Tabs>
    );
}