import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    PanResponder,
    Animated,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Dimensions,
    Platform
} from 'react-native';
import { useSentRequests } from '../../../../API/useSentRequests';
import { formatDistanceToNow } from 'date-fns';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.8;
const SNAP_THRESHOLD = 0.3;


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

const SentModal = ({ visible, onClose }) => {
    const [modalVisible, setModalVisible] = useState(visible);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const [processingIds, setProcessingIds] = useState([]);

    const {
        sentRequests,
        loading,
        error,
        refreshSentRequests,
        cancelFriendRequest
    } = useSentRequests();

    // Optimize animations with useCallback
    const animateIn = useCallback(() => {
        setModalVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 9,
                tension: 80,
                useNativeDriver: true
            })
        ]).start();
    }, [fadeAnim, slideAnim]);

    const closeModal = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true
            }),
            Animated.timing(slideAnim, {
                toValue: MODAL_HEIGHT,
                duration: 250,
                useNativeDriver: true
            })
        ]).start(() => {
            setModalVisible(false);
            onClose();
        });
    }, [fadeAnim, slideAnim, onClose]);

    // Effect for visibility changes
    useEffect(() => {
        if (visible) {
            animateIn();
        } else {
            closeModal();
        }
    }, [visible, animateIn, closeModal]);

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

    // Optimize pan responder
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 2);
            },
            onPanResponderMove: Animated.event(
                [null, { dy: slideAnim }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                const draggedDownEnough = gestureState.dy > MODAL_HEIGHT * SNAP_THRESHOLD ||
                    (gestureState.vy > 0.5 && gestureState.dy > 50);

                if (draggedDownEnough) {
                    closeModal();
                } else {
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        friction: 9,
                        tension: 80,
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

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

    if (!modalVisible) return null;

    return (
        <Modal
            visible={modalVisible}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
            onRequestClose={closeModal}
        >
            <Animated.View
                style={[
                    styles.backdrop,
                    { opacity: fadeAnim }
                ]}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.bottomSheet,
                                    {
                                        transform: [{ translateY: slideAnim }],
                                    }
                                ]}
                            >
                                <View
                                    {...panResponder.panHandlers}
                                    style={styles.dragHandleArea}
                                >
                                    <View style={styles.handle} />
                                    <Text style={styles.headerText}>Sent Requests</Text>
                                </View>

                                {/* Replace ScrollView with FlatList for better performance */}
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
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: MODAL_HEIGHT,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    dragHandleArea: {
        paddingTop: 10,
        paddingBottom: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#666',
        borderRadius: 3,
        marginBottom: 16,
    },
    headerText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
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

export default React.memo(SentModal);