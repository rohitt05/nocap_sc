import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    BackHandler,
    Platform
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, router, useFocusEffect } from 'expo-router';

// Import hooks and components
import YourResponses from '../Profile/YourResponses';
import { styles } from '../Profile/styles';
import { useFetchFriends } from '../../../../API/fetchFriends';
import { useFriendRequests } from '../../../../API/useFriendRequests';
import { useUserProfile } from './hook/useUserProfile';
import { useFriendshipStatus } from './hook/useFriendshipStatus';
import CurseButton from '../../../components/CurseButton';
import UserActionsModal from './UserActionsModal';
import { UserInfo, useUserInfo } from './hook/useUserInfo';
import NavigationHandler from './NavigationHandler'; // Import the NavigationHandler

// Import blockedUsers functions
import { getBlockedUsers, unblockUser } from '../../../../API/blockedUsers';

export default function UserProfile() {
    const { id } = useLocalSearchParams();
    const {
        userData,
        loading: userLoading,
        isOwner
    } = useUserProfile(id as string);

    // Add this - Get user info including the join date
    const { userInfo, joinDate, loading: userInfoLoading } = useUserInfo(id as string);

    const {
        friends,
        loading: friendsLoading,
        removeFriend
    } = useFetchFriends();

    const {
        friendRequests,
        refreshFriendRequests
    } = useFriendRequests();

    const {
        isFriend,
        requestPending,
        receivedRequest,
        sendFriendRequest,
        acceptFriendRequest
    } = useFriendshipStatus(userData?.id || null, friends);

    const [isActionsModalVisible, setIsActionsModalVisible] = useState(false);
    const [isUserBlocked, setIsUserBlocked] = useState(false);
    const [loadingBlockStatus, setLoadingBlockStatus] = useState(true);

    // Fetch blocked users and check if current profile user is blocked
    useEffect(() => {
        async function checkIfUserIsBlocked() {
            if (!userData?.id) return;

            try {
                setLoadingBlockStatus(true);
                const blockedUsers = await getBlockedUsers();
                const isBlocked = blockedUsers.some(user => user.blocked_id === userData.id);
                setIsUserBlocked(isBlocked);
            } catch (error) {
                console.error('Error checking blocked status:', error);
            } finally {
                setLoadingBlockStatus(false);
            }
        }

        checkIfUserIsBlocked();
    }, [userData?.id]);

    // Handle unblocking a user
    const handleUnblockUser = useCallback(async () => {
        if (!userData?.id) return;

        try {
            await unblockUser(userData.id);
            setIsUserBlocked(false);
            Alert.alert('Success', `${userData.username} has been unblocked`);
        } catch (error) {
            console.error('Failed to unblock user:', error);
            Alert.alert('Error', 'Failed to unblock this user');
        }
    }, [userData]);

    // Memoized unfriend handler
    const handleUnfriend = useCallback(async () => {
        if (userData?.id) {
            try {
                await removeFriend(userData.id);
                refreshFriendRequests();
            } catch (error) {
                console.error('Failed to unfriend:', error);
                Alert.alert('Error', 'Failed to remove friend');
            }
        }
    }, [userData, removeFriend, refreshFriendRequests]);

    // Fixed go back handler that properly returns to the friends tab
    const handleGoBack = useCallback(() => {
        // Navigate directly to the friends tab instead of using router.back()
        router.replace("/(tabs)/friends");
    }, []);

    // Handle hardware back button and gestures
    useFocusEffect(
        useCallback(() => {
            // For Android hardware back button
            const onBackPress = () => {
                router.replace("/(tabs)/friends");
                return true; // Prevents default behavior
            };

            // Add back button listener for Android
            if (Platform.OS === 'android') {
                BackHandler.addEventListener('hardwareBackPress', onBackPress);
            }

            // For iOS, we need to handle the swipe gesture differently
            // This is handled by customizing the screenOptions in the navigator
            // but we're capturing hardware back button here

            return () => {
                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress', onBackPress);
                }
            };
        }, [])
    );

    // Memoize friend button props to avoid unnecessary re-renders
    const friendButtonProps = useMemo(() => {
        // If user is blocked, show unblock button with transparent background and white border
        if (isUserBlocked) {
            return {
                buttonStyle: {
                    backgroundColor: 'transparent',
                    padding: 15,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginVertical: 20,
                    marginHorizontal: 16,
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    borderWidth: 0.5,
                    borderColor: 'white',
                },
                textStyle: {
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 16
                },
                buttonText: 'Unblock this user',
                onPressAction: handleUnblockUser,
                isDisabled: false,
                icon: 'person-remove-outline'
            };
        }

        // Regular friend button logic
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

        const icon = receivedRequest
            ? 'checkmark-circle-outline'
            : (requestPending ? undefined : 'person-add-outline');

        return { buttonStyle, textStyle, buttonText, onPressAction, isDisabled, icon };
    }, [receivedRequest, requestPending, acceptFriendRequest, sendFriendRequest, isUserBlocked, handleUnblockUser]);

    // Show loading indicator while data is being fetched
    if (userLoading || friendsLoading || userInfoLoading || loadingBlockStatus) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    // Handle case where user data couldn't be loaded
    if (!userData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'white' }}>User not found</Text>
                <TouchableOpacity onPress={handleGoBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#3498db' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Add NavigationHandler to handle iOS swipe gestures */}
            <NavigationHandler sourceTab="friends" />
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
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => setIsActionsModalVisible(true)}
                        accessibilityLabel="User actions menu"
                        accessibilityRole="button"
                    >
                        <View style={styles.menuButtonContainer}>
                            <Ionicons name="ellipsis-vertical" size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

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
                        defaultSource={require('../../../../assets/hattori.webp')}
                    />

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

                {/* Conditionally render Message Button ONLY if NOT owner AND IS a friend AND NOT blocked */}
                {!isOwner && isFriend && !isUserBlocked && (
                    <CurseButton
                        receiverId={userData.id}
                        username={userData.username}
                        isFriend={true}
                    />
                )}

                {/* Conditionally render Add/Accept Friend button OR Unblock button */}
                {!isOwner && (!isFriend || isUserBlocked) && (
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

                        {friendButtonProps.icon && (
                            <Ionicons
                                name={friendButtonProps.icon}
                                size={20}
                                color={isUserBlocked ? "white" : "black"}
                                style={{ marginLeft: 10 }}
                            />
                        )}
                    </TouchableOpacity>
                )}

                {/* User's Responses Component - only visible to profile owner or friends and not blocked */}
                {(isOwner || (isFriend && !isUserBlocked)) && (
                    <View style={{ marginTop: -10 }}>
                        <YourResponses userId={userData.id} />
                    </View>
                )}
            </ScrollView>

            {/* User Actions Modal - only render for non-owner users */}
            {!isOwner && userData && (
                <UserActionsModal
                    isVisible={isActionsModalVisible}
                    onClose={() => setIsActionsModalVisible(false)}
                    userId={userData.id}
                    username={userData.username}
                    onUnfriend={handleUnfriend}
                    isFriend={isFriend}
                    joinDate={joinDate}
                    isBlocked={isUserBlocked}
                    onUnblock={handleUnblockUser}
                />
            )}
        </View>
    );
}