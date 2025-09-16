import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
    Platform,
    Animated
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import hooks and components
import YourResponses from '../Profile/YourResponses';
import ProfileActivityMap from '../Profile/ProfileActivityMap';
import { styles } from './styles';
import { useFetchFriends } from '../../../../API/fetchFriends';
import { useFriendRequests } from '../../../../API/useFriendRequests';
import { useUserProfile } from './hook/useUserProfile';
import { useFriendshipStatus } from './hook/useFriendshipStatus';
import CurseButton from '../../../components/CurseButton';
import UserActionsModal from './UserActionsModal';
import { UserInfo, useUserInfo } from './hook/useUserInfo';
import NavigationHandler from './NavigationHandler';
import { supabase } from '../../../../lib/supabase';

// Import blockedUsers functions
import { getBlockedUsers, unblockUser } from '../../../../API/blockedUsers';

export default function UserProfile() {
    const { id } = useLocalSearchParams();
    const {
        userData,
        loading: userLoading,
        isOwner
    } = useUserProfile(id as string);

    // Add animated scroll tracking for navbar
    const scrollY = useRef(new Animated.Value(0)).current;

    // Get safe area insets for navbar positioning
    const insets = useSafeAreaInsets();

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

    // NEW: Add state to track pinned responses count
    const [pinCount, setPinCount] = useState<number | null>(null);
    const [loadingPinCount, setLoadingPinCount] = useState(true);

    // Create animated background color for navbar
    const animatedBackgroundColor = scrollY.interpolate({
        inputRange: [0, 400, 500],
        outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)'],
        extrapolate: 'clamp',
    });

    // Animate navbar title opacity
    const navbarTitleOpacity = scrollY.interpolate({
        inputRange: [0, 450, 500],
        outputRange: [0.8, 0.9, 1],
        extrapolate: 'clamp',
    });

    // NEW: Fetch pinned responses count
    useEffect(() => {
        async function getPinCount() {
            if (!userData?.id) {
                setPinCount(0);
                setLoadingPinCount(false);
                return;
            }

            try {
                setLoadingPinCount(true);
                const { count, error } = await supabase
                    .from('pinned_responses')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userData.id);

                if (error) {
                    console.error('Error fetching pin count:', error);
                    setPinCount(0);
                } else {
                    setPinCount(count || 0);
                }
            } catch (err) {
                console.error('Error in pin count fetch:', err);
                setPinCount(0);
            } finally {
                setLoadingPinCount(false);
            }
        }

        getPinCount();
    }, [userData?.id]);

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
        router.replace("/(tabs)/friends");
    }, []);

    // Handle hardware back button and gestures
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                router.replace("/(tabs)/friends");
                return true;
            };

            if (Platform.OS === 'android') {
                BackHandler.addEventListener('hardwareBackPress', onBackPress);
            }

            return () => {
                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress', onBackPress);
                }
            };
        }, [])
    );

    // Memoize friend button props to avoid unnecessary re-renders
    const friendButtonProps = useMemo(() => {
        if (isUserBlocked) {
            return {
                buttonStyle: styles.unblockButton,
                textStyle: styles.unblockButtonText,
                buttonText: 'Unblock this user',
                onPressAction: handleUnblockUser,
                isDisabled: false,
                icon: 'person-remove-outline',
                iconColor: 'white'
            };
        }

        const buttonStyle = receivedRequest
            ? styles.friendButtonAccept
            : (requestPending ? styles.friendButtonPending : styles.friendButtonContainer);

        const textStyle = receivedRequest
            ? styles.friendButtonTextAccept
            : (requestPending ? styles.friendButtonTextPending : styles.friendButtonText);

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

        const iconColor = 'black';

        return { buttonStyle, textStyle, buttonText, onPressAction, isDisabled, icon, iconColor };
    }, [receivedRequest, requestPending, acceptFriendRequest, sendFriendRequest, isUserBlocked, handleUnblockUser]);

    // Show loading indicator while data is being fetched
    if (userLoading || friendsLoading || userInfoLoading || loadingBlockStatus || loadingPinCount) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    // Handle case where user data couldn't be loaded
    if (!userData) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>User not found</Text>
                <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
                    <Text style={styles.goBackButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Determine if YourResponses should render
    const shouldShowYourResponses = (isOwner || (isFriend && !isUserBlocked)) && 
                                   userData?.id && 
                                   pinCount !== null && 
                                   pinCount > 0;

    // Debug the ProfileActivityMap rendering conditions
    const shouldShowActivityMap = !isOwner && isFriend && !isUserBlocked;

    return (
        <View style={styles.container}>
            <NavigationHandler sourceTab="friends" />
            <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

            {/* Animated Navbar with fade effect */}
            <Animated.View style={[
                styles.navbarPrecise,
                {
                    backgroundColor: animatedBackgroundColor,
                    paddingTop: insets.top,
                    height: 60 + insets.top,
                }
            ]}>
                <View style={styles.navbarContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleGoBack}
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <Animated.Text
                        style={[styles.navbarTitle, { opacity: navbarTitleOpacity }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {userData.username}
                    </Animated.Text>

                    {isOwner ? (
                        <Link href="/settings" style={styles.zIndexHigh} asChild>
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
            </Animated.View>

            {/* Animated ScrollView with scroll tracking */}
            <Animated.ScrollView
                style={styles.scrollContainerFixed}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.userScrollContent}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            >
                {/* Profile Image Container with HD quality */}
                <View style={styles.profileImageContainerFixed}>
                    <Image
                        source={{
                            uri: userData.avatar_url || 'https://via.placeholder.com/1080x1080',
                            cache: 'force-cache',
                        }}
                        style={styles.profileImageHD}
                        resizeMode="cover"
                        resizeMethod="scale"
                        accessible={true}
                        accessibilityLabel={`${userData.username}'s profile picture`}
                        defaultSource={require('../../../../assets/hattori.webp')}
                        fadeDuration={300}
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

                {/* Conditionally render Message Button */}
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
                                color={friendButtonProps.iconColor}
                                style={styles.friendButtonIcon}
                            />
                        )}
                    </TouchableOpacity>
                )}

                {/* FIXED: User's Responses Component - Only render if user has pinned responses */}
                {shouldShowYourResponses && (
                    <View style={styles.responsesContainer}>
                        <YourResponses userId={userData.id} />
                    </View>
                )}

                {/* User's Activity Map - Only shows for friends who aren't blocked and isn't owner */}
                {shouldShowActivityMap && userData?.id && (
                    <View style={{ marginTop: 20 }}>
                        <ProfileActivityMap
                            userId={userData.id}
                            isOwnProfile={false}
                            isVisible={true}
                        />
                    </View>
                )}
            </Animated.ScrollView>

            {/* User Actions Modal */}
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
