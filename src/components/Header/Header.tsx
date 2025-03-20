import React from 'react';
import { View, Image, StyleSheet, Text, Animated, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import promptsData from "../../../assets/prompt/prompt.json";
import userData from '../../../assets/userProfile/userData.json';


export const HomeHeader = ({
    scrollY = new Animated.Value(0),
    scrollThreshold = 200 // Default value, will be updated dynamically
}) => {
    // Calculate opacity based on scroll position with dynamically determined threshold
    const headerOpacity = scrollY.interpolate({
        inputRange: [scrollThreshold - 50, scrollThreshold],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const promptHeaderOpacity = scrollY.interpolate({
        inputRange: [scrollThreshold - 50, scrollThreshold],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // Check if user has a profile picture
    const hasProfilePicture = userData && userData.profilePicture && userData.profilePicture.trim() !== '';

    return (
        <View style={styles.headerContainer}>
            {/* Original header that fades out on scroll */}
            <Animated.View style={[styles.headerRow, { opacity: headerOpacity }]}>
                <Image
                    source={require("../../../assets/logo.png")}
                    style={styles.logo}
                />
                {/* Using zIndex to ensure touchability */}
                <Link href="/Screens/Profile/profile" style={[styles.profileIcon, { zIndex: 10 }]}>
                    {hasProfilePicture ? (
                        <Image
                            source={{ uri: userData.profilePicture }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <FontAwesome name="user-circle" size={24} color="white" />
                    )}
                </Link>
            </Animated.View>

            {/* Prompt text that fades in on scroll */}
            <Animated.View
                style={[
                    styles.promptHeaderContainer,
                    { opacity: promptHeaderOpacity }
                ]}
                pointerEvents="none" // This ensures it doesn't block touch events
            >
                <Text style={styles.promptHeaderText} numberOfLines={1} ellipsizeMode="tail">
                    {promptsData.text}
                </Text>
            </Animated.View>
        </View>
    );
};

interface StandardHeaderProps {
    title?: string;
}

export const StandardHeader = ({ title }: StandardHeaderProps) => (
    <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
        </View>
    </View>
);

const styles = StyleSheet.create({
    headerContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: 'transparent',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        zIndex: 5,
    },
    logo: {
        width: 60,
        height: 60,
        resizeMode: 'cover',
    },
    profileIcon: {
        marginRight: 5,
        padding: 10, // Add padding to increase touch target
    },
    profileImage: {
        width: 40,
        height: 50,
        borderRadius: 25,
        resizeMode: 'cover',
        borderWidth: 1,
        borderColor: 'white',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    promptHeaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1, // Lower zIndex so it doesn't block touch events
        flex: 1,
        backgroundColor: 'transparent'
    },
    promptHeaderText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingHorizontal: 10,
    }
});