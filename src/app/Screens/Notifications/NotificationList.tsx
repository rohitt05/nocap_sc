import React, { useState, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ActivityIndicator, RefreshControl, ScrollView, Dimensions
} from 'react-native';
import { useFriendRequests } from '../../../../API/useFriendRequests';
import { useReactionNotifications } from '../../../../API/useReactionNotifications';
import { useFriendResponses } from '../../../../API/useFriendResponses';
import { useCurseNotifications } from '../../../../API/useCurseNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../../context/NotificationContext';

const { width } = Dimensions.get('window');

// Comprehensive Type Definitions
type BaseNotification = {
    id: string;
    user_id?: string;
    full_name: string;
    username?: string;
    avatar_url: string | null;
    created_at: string;
};

type FriendRequest = BaseNotification & {
    type: 'friend_request';
};

type ReactionNotification = BaseNotification & {
    response_id: string;
    reaction_type: string;
    reaction_count: number;
    prompt_text: string;
    type: 'reaction';
};

type FriendResponseNotification = BaseNotification & {
    response_id: string;
    prompt_id?: string;
    prompt_text: string;
    content_type: string;
    type: 'friend_response';
};

type CurseNotification = BaseNotification & {
    curse_count: number;
    type: 'curse';
};

type Notification = FriendRequest | ReactionNotification | FriendResponseNotification | CurseNotification;

// Constant Mappings
const EMOJI_MAP: Record<string, string> = {
    'fire': '🔥',
    'skull': '💀',
    'holding-hands': '🫶🏻',
    'crying': '😭',
    'dotted-face': '🫥',
    'tongue': '👅'
};

const CONTENT_TYPE_EMOJI: Record<string, string> = {
    'text': '💬',
    'image': '📸',
    'video': '🎬',
    'audio': '🎵',
    'gif': '🎞️'
};

const REACTION_IMAGE_MAP: Record<string, any> = {
    'wtf': require('../../../components/responses/components/ReactionText/images/wtf.png'),
    'bruhh': require('../../../components/responses/components/ReactionText/images/bruh.png'),
    'spilled': require('../../../components/responses/components/ReactionText/images/spilled.png'),
    'delulu': require('../../../components/responses/components/ReactionText/images/delulu.png'),
    'sus': require('../../../components/responses/components/ReactionText/images/sus.png'),
    "shit's real": require('../../../components/responses/components/ReactionText/images/shit.png')
};



const NotificationList: React.FC = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [processingIds, setProcessingIds] = useState<string[]>([]);





    // API Hooks
    const {
        friendRequests,
        loading: friendRequestsLoading,
        error: friendRequestsError,
        refreshFriendRequests,
        acceptFriendRequest,
        declineFriendRequest
    } = useFriendRequests();

    const {
        reactionNotifications,
        loading: reactionsLoading,
        error: reactionsError,
        refreshReactionNotifications
    } = useReactionNotifications();

    const {
        friendResponses,
        loading: friendResponsesLoading,
        error: friendResponsesError,
        refreshFriendResponses
    } = useFriendResponses();

    const {
        curseNotifications,
        loading: curseNotificationsLoading,
        error: curseNotificationsError,
        refreshCurseNotifications
    } = useCurseNotifications();

    // Memoized Computations
    const allNotifications = useMemo(() => [
        ...friendRequests.map(request => ({ ...request, type: 'friend_request' as const })),
        ...reactionNotifications.map(notification => ({ ...notification, type: 'reaction' as const })),
        ...friendResponses.map(response => ({ ...response, type: 'friend_response' as const })),
        ...curseNotifications.map(curse => ({ ...curse, type: 'curse' as const }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        [friendRequests, reactionNotifications, friendResponses, curseNotifications]);

    const loading = useMemo(() =>
        friendRequestsLoading ||
        reactionsLoading ||
        friendResponsesLoading ||
        curseNotificationsLoading,
        [friendRequestsLoading, reactionsLoading, friendResponsesLoading, curseNotificationsLoading]);

    const error = useMemo(() =>
        friendRequestsError ||
        reactionsError ||
        friendResponsesError ||
        curseNotificationsError,
        [friendRequestsError, reactionsError, friendResponsesError, curseNotificationsError]);

    // Utility Functions
    const formatTimestamp = useCallback((timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return 'recently';
        }
    }, []);

    const getEmoji = useCallback((type: string) => EMOJI_MAP[type] || '👍', []);

    const getContentTypeEmoji = useCallback((contentType: string) =>
        CONTENT_TYPE_EMOJI[contentType] || '💬',
        []);

    const getReactionImage = useCallback((type: string) =>
        REACTION_IMAGE_MAP[type] || null,
        []);

    // Notification Text Generators
    const getReactionText = useCallback((notification: ReactionNotification) =>
        notification.reaction_count > 1
            ? `reacted ${notification.reaction_count} times on your response`
            : "reacted on your response"
        , []);

    const getFriendResponseText = useCallback((notification: FriendResponseNotification) => {
        const truncatedPrompt = notification.prompt_text.length > 30
            ? `${notification.prompt_text.substring(0, 30)}...`
            : notification.prompt_text;
        return `posted a response to "${truncatedPrompt}"`;
    }, []);

    const getCurseNotificationText = useCallback((notification: CurseNotification) =>
        notification.curse_count > 1
            ? `cursed you ${notification.curse_count} times`
            : "cursed you"
        , []);

    // Refresh Handler
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            refreshFriendRequests(),
            refreshReactionNotifications(),
            refreshFriendResponses(),
            refreshCurseNotifications()
        ]);
        setRefreshing(false);
    }, [
        refreshFriendRequests,
        refreshReactionNotifications,
        refreshFriendResponses,
        refreshCurseNotifications
    ]);

    // Action Handlers
    const handleAccept = useCallback(async (requestId: string) => {
        setProcessingIds(prev => [...prev, requestId]);
        const success = await acceptFriendRequest(requestId);
        if (!success) {
            setProcessingIds(prev => prev.filter(id => id !== requestId));
        }
    }, [acceptFriendRequest]);

    const handleDecline = useCallback(async (requestId: string) => {
        setProcessingIds(prev => [...prev, requestId]);
        const success = await declineFriendRequest(requestId);
        if (!success) {
            setProcessingIds(prev => prev.filter(id => id !== requestId));
        }
    }, [declineFriendRequest]);

    // Notification Press Handlers
    const handleReactionNotificationPress = useCallback((responseId: string) => {
        console.log('Navigate to response:', responseId);
        // Implement actual navigation logic
    }, []);

    const handleFriendResponsePress = useCallback((responseId: string) => {
        console.log('Navigate to friend response:', responseId);
        // Implement actual navigation logic
    }, []);

    // Render Notification Item
    const renderNotification = useCallback((notification: Notification, index: number) => {
        const avatarSource = notification.avatar_url
            ? { uri: notification.avatar_url }
            : require('../../../../assets/hattori.webp');

        return (
            <View key={notification.id}>
                {notification.type === 'curse' && (
                    <TouchableOpacity style={styles.notificationItem}>
                        <View style={styles.leftSection}>
                            <Image
                                source={avatarSource}
                                style={styles.avatar}
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.fullName}>{notification.full_name}</Text>
                                <Text style={[styles.notificationText, styles.curseNotificationText]}>
                                    {getCurseNotificationText(notification)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.rightSection}>
                            <Text style={styles.timestamp}>{formatTimestamp(notification.created_at)}</Text>
                            <Text style={[styles.reactionEmoji, styles.curseEmoji]}>🤬</Text>
                        </View>
                    </TouchableOpacity>
                )}
                {notification.type === 'friend_request' && (
                    <View style={styles.notificationItem}>
                        <View style={styles.leftSection}>
                            <Image
                                source={avatarSource}
                                style={styles.avatar}
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.fullName}>{notification.full_name}</Text>
                                <Text style={styles.notificationText}>sent you a friend request</Text>
                            </View>
                        </View>
                        <View style={styles.rightSection}>
                            <Text style={styles.timestamp}>{formatTimestamp(notification.created_at)}</Text>
                            {processingIds.includes(notification.id) ? (
                                <ActivityIndicator size="small" color="#0066FF" style={styles.processingIndicator} />
                            ) : (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity onPress={() => handleDecline(notification.id)}>
                                        <Text style={styles.declineButtonText}>Decline</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(notification.id)}>
                                        <Text style={styles.acceptButtonText}>Accept</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                )}
                {notification.type === 'reaction' && (
                    <TouchableOpacity
                        style={styles.notificationItem}
                        onPress={() => handleReactionNotificationPress(notification.response_id)}
                    >
                        <View style={styles.leftSection}>
                            <Image
                                source={avatarSource}
                                style={styles.avatar}
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.fullName}>{notification.full_name}</Text>
                                <Text style={styles.notificationText}>
                                    {getReactionText(notification)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.rightSection}>
                            <Text style={styles.timestamp}>{formatTimestamp(notification.created_at)}</Text>
                            {getReactionImage(notification.reaction_type) ? (
                                <Image
                                    source={getReactionImage(notification.reaction_type)}
                                    style={styles.reactionTextImage}
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text style={[styles.reactionEmoji, { width: 40, height: 40, textAlign: 'center', textAlignVertical: 'center' }]}>
                                    {getEmoji(notification.reaction_type)}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
                {notification.type === 'friend_response' && (
                    <TouchableOpacity
                        style={styles.notificationItem}
                        onPress={() => handleFriendResponsePress(notification.response_id)}
                    >
                        <View style={styles.leftSection}>
                            <Image
                                source={avatarSource}
                                style={styles.avatar}
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.fullName}>{notification.full_name}</Text>
                                <Text style={styles.notificationText}>
                                    {getFriendResponseText(notification)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.rightSection}>
                            <Text style={styles.timestamp}>{formatTimestamp(notification.created_at)}</Text>
                            <Text style={styles.reactionEmoji}>{getContentTypeEmoji(notification.content_type)}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                {index < allNotifications.length - 1 && <View style={styles.separator} />}
            </View>
        );
    }, [
        processingIds,
        formatTimestamp,
        getReactionText,
        getFriendResponseText,
        getCurseNotificationText,
        getEmoji,
        getContentTypeEmoji,
        getReactionImage,
        handleAccept,
        handleDecline,
        handleReactionNotificationPress,
        handleFriendResponsePress
    ]);

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#fff']}
                    tintColor="#fff"
                    titleColor="#FFFFFF"
                />
            }
        >
            {!loading && !error && allNotifications.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTextPrimary}>No Notifications</Text>
                    <Text style={styles.emptyTextSecondary}>
                        Friend requests, reactions, and friend activities will appear here
                    </Text>
                </View>
            )}

            {loading && !refreshing && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {allNotifications.map(renderNotification)}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    notificationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    reactionTextImage: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333333',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    fullName: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    notificationText: {
        fontSize: 14,
        color: '#BBBBBB',
    },
    timestamp: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#132fba',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 25,
        marginLeft: 12,
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    declineButtonText: {
        color: '#FF3B30',
        fontSize: 14,
    },
    processingIndicator: {
        marginRight: 12,
    },
    reactionEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    separator: {
        height: 1,
        backgroundColor: '#222222',
        width: '100%',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    errorText: {
        color: '#FF3B30',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#222222',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTextPrimary: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyTextSecondary: {
        color: '#666666',
        fontSize: 14,
        textAlign: 'center',
    },
    curseNotificationText: {
        color: '#FF4500', // Bright red-orange for curse notifications
    },
    curseEmoji: {
        fontSize: 24, // Slightly larger emoji
        color: '#FF4500', // Match text color
    },
});

export default NotificationList;