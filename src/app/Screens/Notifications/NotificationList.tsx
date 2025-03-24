import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ActivityIndicator, RefreshControl, ScrollView, Dimensions
} from 'react-native';
import { useFriendRequests } from '../../../../API/useFriendRequests';
import { useReactionNotifications } from '../../../../API/useReactionNotifications';
import { useFriendResponses } from '../../../../API/useFriendResponses'; // Import new hook
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');

// Condensed type definitions
type FriendRequest = {
    id: string;
    full_name: string;
    avatar_url: string | null;
    created_at: string;
    type: 'friend_request';
};

type ReactionNotification = {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    response_id: string;
    reaction_type: string;
    reaction_count: number;
    prompt_text: string;
    created_at: string;
    type: 'reaction';
};

// Add new type from our hook
type FriendResponseNotification = {
    id: string;
    user_id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    response_id: string;
    prompt_id: string;
    prompt_text: string;
    content_type: string;
    created_at: string;
    type: 'friend_response';
};

type Notification = FriendRequest | ReactionNotification | FriendResponseNotification;

const NotificationList = () => {
    const {
        friendRequests, loading: friendRequestsLoading, error: friendRequestsError,
        refreshFriendRequests, acceptFriendRequest, declineFriendRequest
    } = useFriendRequests();

    const {
        reactionNotifications, loading: reactionsLoading, error: reactionsError,
        refreshReactionNotifications
    } = useReactionNotifications();

    // Add the new hook
    const {
        friendResponses, loading: friendResponsesLoading, error: friendResponsesError,
        refreshFriendResponses
    } = useFriendResponses();

    const [refreshing, setRefreshing] = useState(false);
    const [processingIds, setProcessingIds] = useState<string[]>([]);

    // Combine notifications and sort by date
    const allNotifications: Notification[] = [
        ...friendRequests.map(request => ({ ...request, type: 'friend_request' as const })),
        ...reactionNotifications.map(notification => ({ ...notification, type: 'reaction' as const })),
        ...friendResponses.map(response => ({ ...response, type: 'friend_response' as const }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const loading = friendRequestsLoading || reactionsLoading || friendResponsesLoading;
    const error = friendRequestsError || reactionsError || friendResponsesError;

    // Utility functions
    const formatTimestamp = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch (e) {
            return 'recently';
        }
    };

    const getReactionText = (notification: ReactionNotification) => {
        if (notification.reaction_count > 1) {
            return `reacted ${notification.reaction_count} times on your response`;
        } else {
            return "reacted on your response";
        }
    };

    const getFriendResponseText = (notification: FriendResponseNotification) => {
        return `posted a response to "${notification.prompt_text.substring(0, 30)}${notification.prompt_text.length > 30 ? '...' : ''}"`;
    };

    // Action handlers
    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            refreshFriendRequests(),
            refreshReactionNotifications(),
            refreshFriendResponses() // Add new refresh
        ]);
        setRefreshing(false);
    };

    const handleAccept = async (requestId: string) => {
        setProcessingIds(prev => [...prev, requestId]);
        const success = await acceptFriendRequest(requestId);
        if (!success) {
            setProcessingIds(prev => prev.filter(id => id !== requestId));
        }
    };

    const handleDecline = async (requestId: string) => {
        setProcessingIds(prev => [...prev, requestId]);
        const success = await declineFriendRequest(requestId);
        if (!success) {
            setProcessingIds(prev => prev.filter(id => id !== requestId));
        }
    };

    const handleReactionNotificationPress = (responseId: string) => {
        console.log('Navigate to response:', responseId);
    };

    const handleFriendResponsePress = (responseId: string) => {
        console.log('Navigate to friend response:', responseId);
    };

    // Emoji mapping for reaction types
    const getEmoji = (type: string) => {
        const emojiMap: { [key: string]: string } = {
            'fire': '🔥',
            'skull': '💀',
            'holding-hands': '🫶🏻',
            'crying': '😭',
            'dotted-face': '🫥',
            'tongue': '👅'
        };
        return emojiMap[type] || '👍';
    };

    // Get content type emoji
    const getContentTypeEmoji = (contentType: string) => {
        const contentMap: { [key: string]: string } = {
            'text': '💬',
            'image': '📸',
            'video': '🎬',
            'audio': '🎵',
            'gif': '🎞️'
        };
        return contentMap[contentType] || '💬';
    };

    // Render notification item based on type
    const renderNotification = (notification: Notification, index: number) => (
        <View key={notification.id}>
            {notification.type === 'friend_request' ? (
                <View style={styles.notificationItem}>
                    <View style={styles.leftSection}>
                        <Image
                            source={{ uri: notification.avatar_url || 'https://via.placeholder.com/50' }}
                            style={styles.avatar}
                            defaultSource={require('../../../../assets/hattori.webp')}
                        />
                        <Text style={styles.fullName}>{notification.full_name}</Text>
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
            ) : notification.type === 'reaction' ? (
                <TouchableOpacity
                    style={styles.notificationItem}
                    onPress={() => handleReactionNotificationPress(notification.response_id)}
                >
                    <View style={styles.leftSection}>
                        <Image
                            source={{ uri: notification.avatar_url || 'https://via.placeholder.com/50' }}
                            style={styles.avatar}
                            defaultSource={require('../../../../assets/hattori.webp')}
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
                        <Text style={styles.reactionEmoji}>{getEmoji(notification.reaction_type)}</Text>
                    </View>
                </TouchableOpacity>
            ) : (
                // Friend response notification
                <TouchableOpacity
                    style={styles.notificationItem}
                    onPress={() => handleFriendResponsePress(notification.response_id)}
                >
                    <View style={styles.leftSection}>
                        <Image
                            source={{ uri: notification.avatar_url || 'https://via.placeholder.com/50' }}
                            style={styles.avatar}
                            defaultSource={require('../../../../assets/hattori.webp')}
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
            {/* Empty state */}
            {!loading && !error && allNotifications.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTextPrimary}>No Notifications</Text>
                    <Text style={styles.emptyTextSecondary}>Friend requests, reactions, and friend activities will appear here</Text>
                </View>
            )}

            {/* Loading state */}
            {loading && !refreshing && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}

            {/* Error state */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Notifications list */}
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
    }
});

export default NotificationList;