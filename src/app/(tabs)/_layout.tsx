import { Tabs } from 'expo-router';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { HomeHeader, StandardHeader } from '../../components/Header/Header';
import React, { useState, useEffect } from 'react';
import { Animated, Keyboard, Platform } from 'react-native';
import { TabBarProvider, useTabBar } from '../context/TabBarContext';

const TabsContent = () => {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const { isTabBarVisible } = useTabBar();

    const getCommonScreenOptions = (title: string) => ({
        headerTitle: () => <StandardHeader title={title} />,
        title: title.toLowerCase(),
        headerTintColor: 'white',
    });

    useEffect(() => {
        const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(show, () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener(hide, () => setKeyboardVisible(false));

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // Debug log to see tab bar state
    console.log('🎯 Tab bar visible:', isTabBarVisible, 'Keyboard visible:', keyboardVisible);

    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: 'black',
                    borderTopWidth: 0,
                    // This is the key fix - use our context state
                    display: (keyboardVisible || !isTabBarVisible) ? 'none' : 'flex',
                    height: 60,
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
                    tabBarIcon: ({ color }) => (
                        <Entypo name="home" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="friends"
                options={{
                    headerShown: false,
                    ...getCommonScreenOptions('Friends'),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="people-sharp" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="post"
                options={{
                    headerShown: false,
                    ...getCommonScreenOptions('Post'),
                    tabBarIcon: ({ color }) => (
                        <Entypo name="plus" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="notifications"
                options={{
                    headerShown: false,
                    ...getCommonScreenOptions('notifications'),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="notifications" size={24} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="archives"
                options={{
                    headerShown: false,
                    title: 'archives',
                    tabBarIcon: ({ color }) => (
                        <Entypo name="archive" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default function TabLayout() {
    return (
        <TabBarProvider>
            <TabsContent />
        </TabBarProvider>
    );
}
