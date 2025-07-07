import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { PanGestureHandler, GestureHandlerRootView, LongPressGestureHandler } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getHumanReactions, deleteHumanReaction } from '../humanReactionService';
import CommentInput from '../CommentInput';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    runOnJS,
    withSpring,
} from 'react-native-reanimated';

import styles from './styles'; // Assuming styles are defined in a separate file

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HumanReaction {
    id: string;
    response_id: string;
    user_id: string;
    content_type: 'text' | 'image' | 'video';
    file_url?: string;
    text_content?: string;
    created_at: string;
    user: {
        id: string;
        username: string;
        full_name: string;
        avatar_url: string;
    };
}

interface HumanReactionModalProps {
    isVisible: boolean;
    onClose: () => void;
    responseId: string;
    currentUserId?: string;
}

const HumanReactionModal: React.FC<HumanReactionModalProps> = ({
    isVisible,
    onClose,
    responseId,
    currentUserId,
}) => {
    const [humanReactions, setHumanReactions] = useState<HumanReaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // Animation values for swipe gesture
    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });

    const fetchHumanReactions = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getHumanReactions(responseId);

            if (result.success) {
                setHumanReactions(result.data || []);
            } else {
                setError(result.error || 'Failed to load reactions');
            }
        } catch (err) {
            setError('Something went wrong');
            console.error('Error fetching human reactions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible) {
            fetchHumanReactions();
            translateY.value = 0;
            // Reset scroll position when modal opens
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 0, animated: false });
            }
        }
    }, [isVisible, responseId]);

    const handleDeleteReaction = async (reactionId: string) => {
        if (!currentUserId) return;

        Alert.alert(
            'Delete Reaction',
            'Are you sure you want to delete this reaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await deleteHumanReaction(reactionId, currentUserId);

                            if (result.success) {
                                setHumanReactions(prev =>
                                    prev.filter(reaction => reaction.id !== reactionId)
                                );
                            } else {
                                Alert.alert('Error', result.error || 'Failed to delete reaction');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Something went wrong');
                            console.error('Error deleting reaction:', err);
                        }
                    },
                },
            ]
        );
    };

    const handleCommentAdded = () => {
        fetchHumanReactions();
    };

    // Swipe gesture handler
    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx) => {
            translateY.value = Math.max(0, ctx.startY + event.translationY);
        },
        onEnd: (event) => {
            const shouldClose = translateY.value > 100 || event.velocityY > 500;

            if (shouldClose) {
                runOnJS(onClose)();
            } else {
                translateY.value = withSpring(0);
            }
        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    // State for image zoom modal
    const [zoomedImageUri, setZoomedImageUri] = useState<string | null>(null);

    // Component for zoomable image
    const ZoomableImage: React.FC<{ source: { uri: string }, style: any }> = ({ source, style }) => {
        const handleLongPress = () => {
            setZoomedImageUri(source.uri);
        };

        return (
            <LongPressGestureHandler
                onActivated={handleLongPress}
                minDurationMs={500}
            >
                <Animated.View>
                    <Image
                        source={source}
                        style={style}
                        contentFit="cover"
                    />
                </Animated.View>
            </LongPressGestureHandler>
        );
    };

    // Full screen image zoom modal
    const ImageZoomModal = () => (
        <Modal
            visible={zoomedImageUri !== null}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setZoomedImageUri(null)}
        >
            <View style={styles.zoomModalOverlay}>
                <TouchableOpacity
                    style={styles.zoomModalBackdrop}
                    activeOpacity={1}
                    onPress={() => setZoomedImageUri(null)}
                />
                
                {zoomedImageUri && (
                    <Image
                        source={{ uri: zoomedImageUri }}
                        style={styles.zoomedImage}
                        contentFit="contain"
                        onError={(error) => {
                            console.log('Image load error:', error);
                            Alert.alert('Error', 'Failed to load image');
                            setZoomedImageUri(null);
                        }}
                    />
                )}
                
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setZoomedImageUri(null)}
                >
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </Modal>
    );

    const renderHumanReaction = ({ item }: { item: HumanReaction }) => {
        const isOwnReaction = currentUserId === item.user_id;

        return (
            <View style={styles.reactionItem}>
                <Image
                    source={{ uri: item.user.avatar_url || 'https://via.placeholder.com/40' }}
                    style={styles.avatar}
                    contentFit="cover"
                />
                <View style={styles.contentSection}>
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>{item.user.username}</Text>
                        <Text style={styles.fullName}>{item.user.full_name}</Text>
                    </View>

                    {/* Render different content based on type */}
                    {item.content_type === 'text' ? (
                        <View style={styles.textSection}>
                            <Text style={styles.textContent}>{item.text_content}</Text>
                            {isOwnReaction && (
                                <TouchableOpacity
                                    style={styles.deleteTextButton}
                                    onPress={() => handleDeleteReaction(item.id)}
                                >
                                    <MaterialIcons name="delete" size={16} color="#FF3B30" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View style={styles.mediaSection}>
                            {item.content_type === 'image' ? (
                                <ZoomableImage
                                    source={{ uri: item.file_url || '' }}
                                    style={styles.reactionMedia}
                                />
                            ) : (
                                <Video
                                    source={{ uri: item.file_url || '' }}
                                    style={styles.reactionMedia}
                                    resizeMode={ResizeMode.COVER}
                                    shouldPlay={false}
                                    isLooping={true}
                                    useNativeControls={true}
                                />
                            )}

                            {isOwnReaction && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteReaction(item.id)}
                                >
                                    <MaterialIcons name="delete" size={18} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#666" />
            </View>
            <Text style={styles.emptyText}>No reactions yet</Text>
            <Text style={styles.emptySubtext}>Be the first to react or take that shit out</Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.errorState}>
            <View style={styles.errorIconContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
            </View>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchHumanReactions}>
                <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <Modal
                visible={isVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={onClose}
            >
                <GestureHandlerRootView style={styles.gestureContainer}>
                    <View style={styles.overlay}>
                        <TouchableOpacity
                            style={styles.backdrop}
                            activeOpacity={1}
                            onPress={onClose}
                        />

                        <PanGestureHandler onGestureEvent={gestureHandler}>
                            <Animated.View style={[styles.bottomSheet, animatedStyle]}>
                                {/* iPhone-style Header */}
                                <View style={styles.header}>
                                    <View style={styles.dragIndicator} />
                                    <Text style={styles.title}>Reactions</Text>
                                </View>

                                {/* Content with proper scrolling */}
                                <View style={styles.contentContainer}>
                                    {loading ? (
                                        <View style={styles.loadingState}>
                                            <ActivityIndicator size="large" color="#007AFF" />
                                            <Text style={styles.loadingText}>Loading reactions...</Text>
                                        </View>
                                    ) : error ? (
                                        renderError()
                                    ) : humanReactions.length === 0 ? (
                                        renderEmptyState()
                                    ) : (
                                        <FlatList
                                            data={humanReactions}
                                            renderItem={renderHumanReaction}
                                            keyExtractor={(item) => item.id}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={styles.listContainer}
                                            scrollEnabled={true}
                                            nestedScrollEnabled={true}
                                            style={styles.scrollableContent}
                                        />
                                    )}
                                </View>

                                {/* Fixed Comment Input at Bottom */}
                                {currentUserId && (
                                    <CommentInput
                                        responseId={responseId}
                                        currentUserId={currentUserId}
                                        onCommentAdded={handleCommentAdded}
                                    />
                                )}
                            </Animated.View>
                        </PanGestureHandler>
                    </View>
                </GestureHandlerRootView>
            </Modal>

            {/* Full Screen Image Zoom Modal */}
            <ImageZoomModal />
        </>
    );
};

export default HumanReactionModal;