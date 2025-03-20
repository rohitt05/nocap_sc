// app/(tabs)/_layout.js
import { Tabs } from "expo-router";
import { Entypo, Ionicons, FontAwesome } from "@expo/vector-icons";
import { HomeHeader, StandardHeader } from "../../components/Header/Header";
import React from "react";
import { Animated } from "react-native";

export default function TabLayout() {
    // Common tab screen options
    const getCommonScreenOptions = (title: string) => ({
        headerTitle: () => <StandardHeader title={title} />,
        title: title.toLowerCase(),
        headerTintColor: 'white',
    });

    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: 'black',
                    borderTopWidth: 0, // Remove the white border line
                },
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: 'gray',
                tabBarShowLabel: true, // You can set this to false if you don't want text labels
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
                name="chats"
                options={{
                    headerShown: false,
                    ...getCommonScreenOptions('Chats'),
                    tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses" size={24} color={color} />
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