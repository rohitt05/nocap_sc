import React, { useState, useCallback, memo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    FlatList,
    Platform,
    Image,
    BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSentRequests } from '../../../../API/useSentRequests';
import { formatDistanceToNow } from 'date-fns';

// Memo-ized request item component
const RequestItem = memo(({ request, onCancel, isProcessing }) => {
    // Format timestamp to relative time
    const formattedTime = formatDistanceToNow(new Date(request.created_at), { addSuffix: true });

    return (
        <View style={styles.requestItem}>
            <View style={styles.leftSection}>
                <Image
                    source={{ uri: request.avatar_url || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                    defaultSource={require('../../../../assets/hattori.webp')}
                />
                <Text style={styles.fullName}>{request.full_name}</Text>
            </View>

            <View style={styles.rightSection}>
                <Text style={styles.timestamp}>{formattedTime}</Text>

                <View style={styles.statusSection}>
                    <Text style={styles.pendingText}>Pending</Text>

                    {isProcessing ? (
                        <ActivityIndicator size="small" color="#FF3B30" style={styles.processingIndicator} />
                    ) : (
                        <TouchableOpacity
                            onPress={() => onCancel(request.id)}
                            style={styles.cancelButton}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel Request</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
});

// Empty state component
const EmptyState = memo(() => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyTextPrimary}>No Sent Requests</Text>
        <Text style={styles.emptyTextSecondary}>Requests you've sent will appear here</Text>
    </View>
));

// Error state component
const ErrorState = memo(({ error, onRetry }) => (
    <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.7}
        >
            <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
    </View>
));

const SentModal = () => {
    const router = useRouter();
    const [processingIds, setProcessingIds] = useState([]);

    const {
        sentRequests,
        loading,
        error,
        refreshSentRequests,
        cancelFriendRequest
    } = useSentRequests();

    // Memoize cancel handler to prevent unnecessary rerenders
    const handleCancel = useCallback(async (requestId) => {
        setProcessingIds(prev => [...prev, requestId]);
        try {
            await cancelFriendRequest(requestId);
        } catch (err) {
            console.error('Error canceling request:', err);
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== requestId));
        }
    }, [cancelFriendRequest]);

    // Optimized render item for FlatList
    const renderItem = useCallback(({ item }) => (
        <RequestItem
            request={item}
            onCancel={handleCancel}
            isProcessing={processingIds.includes(item.id)}
        />
    ), [handleCancel, processingIds]);

    // Optimized key extractor
    const keyExtractor = useCallback((item) => item.id, []);

    // Optimized item separator
    const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

    // Optimized refresh handler
    const handleRefresh = useCallback(() => {
        refreshSentRequests();
    }, [refreshSentRequests]);

    // Handle hardware back button on Android
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            router.back();
            return true; // Prevent default behavior
        });

        return () => backHandler.remove();
    }, [router]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sent Requests</Text>
                <View style={styles.rightPlaceholder} />
            </View>

            {/* Content */}
            {loading && !sentRequests.length ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00FF00" />
                </View>
            ) : error ? (
                <ErrorState error={error} onRetry={refreshSentRequests} />
            ) : sentRequests.length === 0 ? (
                <EmptyState />
            ) : (
                <FlatList
                    data={sentRequests}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ItemSeparatorComponent={ItemSeparator}
                    contentContainerStyle={styles.scrollContentContainer}
                    onRefresh={handleRefresh}
                    refreshing={loading}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={8}
                    maxToRenderPerBatch={5}
                    windowSize={10}
                    removeClippedSubviews={true}
                    ListFooterComponent={<View style={styles.bottomSpacer} />}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    rightPlaceholder: {
        width: 40,
    },
    scrollContentContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        flexGrow: 1,
    },
    requestItem: {
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
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#333333',
        marginRight: 14,
    },
    fullName: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
        flex: 1,
    },
    timestamp: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 8,
    },
    pendingText: {
        color: '#ccc',
        fontSize: 14,
        marginRight: 14,
    },
    cancelButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    cancelButtonText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '600',
    },
    processingIndicator: {
        marginLeft: 8,
    },
    separator: {
        height: 1,
        backgroundColor: '#333333',
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        marginVertical: 20,
    },
    errorText: {
        color: '#FF3B30',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#333333',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
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
        color: '#999999',
        fontSize: 14,
        textAlign: 'center',
    },
    bottomSpacer: {
        height: Platform.OS === 'ios' ? 40 : 20,
    }
});

export default SentModal;