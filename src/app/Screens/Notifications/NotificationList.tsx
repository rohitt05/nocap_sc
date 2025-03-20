import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Dimensions
} from 'react-native';
import { useFriendRequests } from '../../../../API/useFriendRequests'; // Adjust path as needed
import { formatDistanceToNow } from 'date-fns'; // You'll need to install this package

const { width } = Dimensions.get('window');

const NotificationList = () => {
    const {
        friendRequests,
        loading,
        error,
        refreshFriendRequests,
        acceptFriendRequest,
        declineFriendRequest
    } = useFriendRequests();

    const [refreshing, setRefreshing] = useState(false);
    const [processingIds, setProcessingIds] = useState<string[]>([]);

    // Format timestamp to relative time (e.g., "2h ago")
    const formatTimestamp = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch (e) {
            return 'recently';
        }
    };

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await refreshFriendRequests();
        setRefreshing(false);
    };

    // Handle accepting friend request
    const handleAccept = async (requestId: string) => {
        setProcessingIds(prev => [...prev, requestId]);
        const success = await acceptFriendRequest(requestId);
        if (!success) {
            setProcessingIds(prev => prev.filter(id => id !== requestId));
        }
    };

    // Handle declining friend request
    const handleDecline = async (requestId: string) => {
        setProcessingIds(prev => [...prev, requestId]);
        const success = await declineFriendRequest(requestId);
        if (!success) {
            setProcessingIds(prev => prev.filter(id => id !== requestId));
        }
    };

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#00FF00']}
                    tintColor="#00FF00"
                    titleColor="#FFFFFF"
                />
            }
        >
            {/* Header */}
            <Text style={styles.headerText}>Friend Requests</Text>

            {/* Empty state */}
            {!loading && !error && friendRequests.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTextPrimary}>No Requests</Text>
                    <Text style={styles.emptyTextSecondary}>Friend requests will appear here</Text>
                </View>
            )}

            {/* Loading state */}
            {loading && !refreshing && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00FF00" />
                </View>
            )}

            {/* Error state */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={refreshFriendRequests}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Friend request notifications */}
            {friendRequests.map((request, index) => (
                <View key={request.id}>
                    <View style={styles.notificationItem}>
                        <View style={styles.leftSection}>
                            <Image
                                source={{ uri: request.avatar_url || 'https://via.placeholder.com/50' }}
                                style={styles.avatar}
                                defaultSource={require('../../../../assets/hattori.webp')} // Adjust path as needed
                            />
                            <Text style={styles.fullName}>{request.full_name}</Text>
                        </View>

                        <View style={styles.rightSection}>
                            <Text style={styles.timestamp}>{formatTimestamp(request.created_at)}</Text>

                            {processingIds.includes(request.id) ? (
                                <ActivityIndicator size="small" color="#0066FF" style={styles.processingIndicator} />
                            ) : (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        onPress={() => handleDecline(request.id)}
                                    >
                                        <Text style={styles.declineButtonText}>Decline</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.acceptButton}
                                        onPress={() => handleAccept(request.id)}
                                    >
                                        <Text style={styles.acceptButtonText}>Accept</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                    {index < friendRequests.length - 1 && <View style={styles.separator} />}
                </View>
            ))}
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
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 24,
        marginTop: 8,
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
    fullName: {
        fontSize: 16,
        color: '#FFFFFF',
        flex: 1,
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