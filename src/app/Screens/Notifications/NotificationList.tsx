import React, { useState, useCallback, useMemo } from 'react';
import {
    View, Text, TouchableOpacity,
    ActivityIndicator, RefreshControl, ScrollView
} from 'react-native';
import { useFriendRequests } from '../../../../API/useFriendRequests';
import { useReactionNotifications } from '../../../../API/useReactionNotifications';
import { useFriendResponses } from '../../../../API/useFriendResponses';
import { useCurseNotifications } from '../../../../API/useCurseNotifications';
import { styles } from './styles';

// Import types
import { Notification } from './utils/types';

// Import components
import FriendRequestNotification from './FriendRequestNotification';
import ReactionNotification from './ReactionNotification';
import FriendResponseNotification from './FriendResponseNotification';
import CurseNotification from './CurseNotification';

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
        return (
            <View key={notification.id}>
                {notification.type === 'curse' && (
                    <CurseNotification notification={notification} />
                )}

                {notification.type === 'friend_request' && (
                    <FriendRequestNotification
                        notification={notification}
                        isProcessing={processingIds.includes(notification.id)}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                    />
                )}

                {notification.type === 'reaction' && (
                    <ReactionNotification
                        notification={notification}
                        onPress={handleReactionNotificationPress}
                    />
                )}

                {notification.type === 'friend_response' && (
                    <FriendResponseNotification
                        notification={notification}
                        onPress={handleFriendResponsePress}
                    />
                )}

                {index < allNotifications.length - 1 && <View style={styles.separator} />}
            </View>
        );
    }, [
        processingIds,
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

export default NotificationList;