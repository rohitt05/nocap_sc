import React, { useRef, useState } from 'react';
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
    ScrollView,
    RefreshControl
} from 'react-native';
import { useSentRequests } from '../../../../API/useSentRequests'; // Adjust path as needed
import { formatDistanceToNow } from 'date-fns'; // You'll need to install this package

const SentModal = ({ visible, onClose }) => {
    const panY = useRef(new Animated.Value(0)).current;
    const [refreshing, setRefreshing] = useState(false);
    const [processingIds, setProcessingIds] = useState([]);

    const {
        sentRequests,
        loading,
        error,
        refreshSentRequests,
        cancelFriendRequest
    } = useSentRequests();

    // Format timestamp to relative time (e.g., "2h ago")
    const formatTimestamp = (timestamp) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch (e) {
            return 'recently';
        }
    };

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await refreshSentRequests();
        setRefreshing(false);
    };

    // Handle canceling a friend request
    const handleCancel = async (requestId) => {
        setProcessingIds(prev => [...prev, requestId]);
        const success = await cancelFriendRequest(requestId);
        if (!success) {
            setProcessingIds(prev => prev.filter(id => id !== requestId));
        }
    };

    const resetPositionAnim = Animated.timing(panY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
    });

    const closeAnim = Animated.timing(panY, {
        toValue: 600,
        duration: 500,
        useNativeDriver: true,
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only respond to vertical pan gestures
                return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            },
            onPanResponderMove: (_, gestureState) => {
                // Only allow downward drag
                if (gestureState.dy > 0) {
                    panY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                // If dragged down more than 100 units, close the modal
                if (gestureState.dy > 100) {
                    closeModal();
                } else {
                    resetPositionAnim.start();
                }
            },
        })
    ).current;

    const closeModal = () => {
        closeAnim.start(() => {
            onClose();
            panY.setValue(0);
        });
    };

    const headerDraggableArea = {
        ...panResponder.panHandlers
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={closeModal}>
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.bottomSheet,
                                { transform: [{ translateY: panY }] }
                            ]}
                        >
                            <View style={styles.handle} />

                            <View
                                style={styles.header}
                                {...headerDraggableArea}
                            >
                                <Text style={styles.headerText}>Sent Requests</Text>
                            </View>

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
                                {/* Empty state */}
                                {!loading && !error && sentRequests.length === 0 && (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyTextPrimary}>No Sent Requests</Text>
                                        <Text style={styles.emptyTextSecondary}>Requests you've sent will appear here</Text>
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
                                            onPress={refreshSentRequests}
                                        >
                                            <Text style={styles.retryButtonText}>Retry</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Sent request list */}
                                {sentRequests.map((request, index) => (
                                    <View key={request.id}>
                                        <View style={styles.requestItem}>
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

                                                <View style={styles.statusSection}>
                                                    <Text style={styles.pendingText}>Pending</Text>

                                                    {processingIds.includes(request.id) ? (
                                                        <ActivityIndicator size="small" color="#FF3B30" style={styles.processingIndicator} />
                                                    ) : (
                                                        <TouchableOpacity
                                                            onPress={() => handleCancel(request.id)}
                                                        >
                                                            <Text style={styles.cancelButtonText}>Cancel Request</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                        {index < sentRequests.length - 1 && <View style={styles.separator} />}
                                    </View>
                                ))}
                            </ScrollView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    bottomSheet: {
        backgroundColor: '#121212',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 30,
        height: '80%',
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#666',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 16,
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
    pendingText: {
        color: '#fff',
        fontSize: 14,
        marginRight: 12,
    },
    cancelButtonText: {
        color: '#FF3B30',
        fontSize: 14,
    },
    processingIndicator: {
        marginLeft: 8,
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

export default SentModal;