import { View, Text, Image, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, router } from 'expo-router';
import YourResponses from '../Profile/YourResponses'; // Adjust path as needed
import { styles } from '../Profile/styles'; // Adjust path as needed
import { useFetchFriends } from '../../../../API/fetchFriends'; // Adjust path as needed
import { useFriendRequests } from '../../../../API/useFriendRequests'; // Import the hook
import { useUserProfile } from './hook/useUserProfile'; // Import the user profile hook
import { useFriendshipStatus } from './hook/useFriendshipStatus'; // Import the friendship hook

const LoadingView = () => (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ffffff" />
    </View>
);

const ErrorView = () => (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>User not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: '#3498db' }}>Go Back</Text>
        </TouchableOpacity>
    </View>
);

export default function UserProfile() {
    const { id } = useLocalSearchParams();
    const { userData, loading: userLoading, isOwner } = useUserProfile(id as string);
    const { friends, loading: friendsLoading } = useFetchFriends();
    const { friendRequests, refreshFriendRequests } = useFriendRequests();
    const {
        isFriend,
        requestPending,
        receivedRequest,
        sendFriendRequest,
        acceptFriendRequest
    } = useFriendshipStatus(userData?.id || null, friends);

    // Handle navigation back
    const handleGoBack = useCallback(() => {
        router.back();
    }, []);

    // Handle message navigation
    const navigateToMessages = useCallback(() => {
        if (userData?.id) {
            router.push(`/messages/${userData.id}`);
        }
    }, [userData?.id]);

    // Memoize friend button props to avoid unnecessary re-renders
    const friendButtonProps = useMemo(() => {
        const buttonStyle = {
            backgroundColor: receivedRequest ? '#fff' : (requestPending ? '#cccccc' : '#fff'),
            padding: 15,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 20,
            marginHorizontal: 16,
            width: '90%',
            alignSelf: 'center',
            flexDirection: 'row',
        };

        const textStyle = {
            color: receivedRequest ? 'black' : (requestPending ? '#666666' : 'black'),
            fontWeight: 'bold',
            fontSize: 16
        };

        const buttonText = receivedRequest
            ? 'Accept Request'
            : (requestPending ? 'Pending' : 'Add Friend');

        const onPressAction = receivedRequest
            ? acceptFriendRequest
            : (requestPending ? undefined : sendFriendRequest);

        const isDisabled = requestPending && !receivedRequest;

        return { buttonStyle, textStyle, buttonText, onPressAction, isDisabled };
    }, [receivedRequest, requestPending, acceptFriendRequest, sendFriendRequest]);

    // Show loading indicator while data is being fetched
    if (userLoading || friendsLoading) {
        return <LoadingView />;
    }

    // Handle case where user data couldn't be loaded
    if (!userData) {
        return <ErrorView />;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <Text style={styles.navbarTitle} numberOfLines={1} ellipsizeMode="tail">
                    {userData.username}
                </Text>

                {isOwner ? (
                    <Link href="/settings" style={{ zIndex: 10 }} asChild>
                        <TouchableOpacity
                            style={styles.menuButton}
                            accessibilityLabel="Settings menu"
                            accessibilityRole="button"
                        >
                            <View style={styles.menuButtonContainer}>
                                <Ionicons name="ellipsis-vertical" size={24} color="white" />
                            </View>
                        </TouchableOpacity>
                    </Link>
                ) : (
                    // Empty view to maintain layout
                    <View style={{ width: 24 }} />
                )}
            </View>

            {/* ScrollView for main content */}
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* Profile Image Container */}
                <View style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: userData.avatar_url || 'https://via.placeholder.com/150' }}
                        style={styles.profileImage}
                        resizeMode="cover"
                        accessible={true}
                        accessibilityLabel={`${userData.username}'s profile picture`}
                        // Add default image if loading fails
                        defaultSource={require('../../../../assets/hattori.webp')}
                    />

                    {/* Username container with gradient overlay at the bottom */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={styles.usernameContainer}>
                        <View style={styles.userInfoContainer}>
                            <View style={styles.userTextContainer}>
                                <Text
                                    style={styles.username}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {userData.full_name || userData.username}
                                </Text>
                                <Text
                                    style={styles.userBio}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {userData.bio || ""}
                                </Text>
                            </View>

                            {isOwner && (
                                <Link href="/edit-profile" asChild>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        accessibilityLabel="Edit profile"
                                        accessibilityRole="button"
                                    >
                                        <View style={styles.editButtonContainer}>
                                            <Feather name="edit-3" size={24} color="white" />
                                        </View>
                                    </TouchableOpacity>
                                </Link>
                            )}
                        </View>
                    </LinearGradient>
                </View>

                {/* Message Button - only display if not the profile owner AND is a friend */}
                {!isOwner && isFriend && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#fff',
                            padding: 15,
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginVertical: 20,
                            marginHorizontal: 16,
                            width: '90%',
                            alignSelf: 'center',
                        }}
                        onPress={navigateToMessages}
                        accessibilityLabel="Message this user"
                        accessibilityRole="button"
                    >
                        <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
                            Message
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Add/Accept Friend or Pending Button - only display if not the profile owner AND not a friend */}
                {!isOwner && !isFriend && (
                    <TouchableOpacity
                        style={friendButtonProps.buttonStyle}
                        onPress={friendButtonProps.onPressAction}
                        disabled={friendButtonProps.isDisabled}
                        accessibilityLabel={friendButtonProps.buttonText}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: friendButtonProps.isDisabled }}
                    >
                        <Text style={friendButtonProps.textStyle}>
                            {friendButtonProps.buttonText}
                        </Text>

                        {receivedRequest && (
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={20}
                                color="black"
                                style={{ marginLeft: 10 }}
                            />
                        )}

                        {!requestPending && !receivedRequest && (
                            <Ionicons
                                name="person-add-outline"
                                size={20}
                                color="black"
                                style={{ marginLeft: 10 }}
                            />
                        )}
                    </TouchableOpacity>
                )}

                {/* User's Responses Component - only visible to profile owner or friends */}
                {(isOwner || isFriend) && (
                    <View style={{ marginTop: -10 }}>
                        <YourResponses userId={userData.id} />
                    </View>

                )}
            </ScrollView>
        </View>
    );
}