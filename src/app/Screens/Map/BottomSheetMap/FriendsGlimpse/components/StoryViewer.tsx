import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, ListRenderItem, Animated, ActivityIndicator } from 'react-native';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import { Video, AVPlaybackStatus } from 'expo-av';
import { supabase } from '../../../../../../../lib/supabase'; // ✅ ADD: Supabase client
import StoryProgressBar from './StoryProgressBar';

const { width: screenWidth } = Dimensions.get('window');

interface Story {
    id: string;
    type: 'image' | 'video';
    url: string;
    uploadedTime: string;
    timestamp: number;
    duration: number;
}

interface Friend {
    id: string;
    name: string;
    username: string;
    profilePic: string;
    stories: Story[];
    lastSeen: string;
    isOnline: boolean;
}

interface StoryViewerProps {
    friends: Friend[];
    currentUserIndex: number;
    currentStoryIndex: number;
    onUserSwipe: (direction: 'left' | 'right') => void;
    onStoryTap: (direction: 'left' | 'right') => void;
    flatListRef: React.RefObject<FlatList>;
    onMenuPress: () => void;
    progress: Animated.Value;
    isPaused: boolean;
    onLongPressStart: () => void;
    onLongPressEnd: () => void;
    onVideoProgressUpdate: (progress: number) => void;
    onVideoLoadingChange: (isLoading: boolean) => void;
    videoProgress: number;
    isVideoLoading: boolean;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
    friends,
    currentUserIndex,
    currentStoryIndex,
    onUserSwipe,
    onStoryTap,
    flatListRef,
    onMenuPress,
    progress,
    isPaused,
    onLongPressStart,
    onLongPressEnd,
    onVideoProgressUpdate,
    onVideoLoadingChange,
    videoProgress,
    isVideoLoading
}) => {
    const videoRef = useRef<Video>(null);
    const isMountedRef = useRef(true);

    // Media loading states
    const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
    const [mediaError, setMediaError] = useState<{ [key: string]: boolean }>({});
    // ✅ NEW: Track viewed stories to avoid duplicate records
    const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

    useEffect(() => {
        return () => {
            isMountedRef.current = false;

            if (videoRef.current) {
                videoRef.current.unloadAsync().catch(() => {
                    // Ignore cleanup errors
                });
            }
        };
    }, []);

    // ✅ NEW: Record story view in database
    const recordStoryView = async (storyId: string) => {
        try {
            // Avoid duplicate records
            if (viewedStories.has(storyId)) {
                console.log('👀 Story already viewed, skipping:', storyId);
                return;
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.warn('⚠️ User not authenticated, cannot record view');
                return;
            }

            console.log('👀 Recording story view for:', storyId);

            const { error } = await supabase
                .from('story_views')
                .insert({
                    story_id: storyId,
                    viewer_user_id: user.id
                });

            if (error) {
                // Ignore duplicate key errors (23505) - user already viewed this story
                if (error.code === '23505') {
                    console.log('👀 Story view already recorded (duplicate)');
                } else {
                    console.error('❌ Failed to record story view:', error);
                }
            } else {
                console.log('✅ Story view recorded successfully');
            }

            // Mark as viewed locally to avoid duplicate attempts
            setViewedStories(prev => new Set([...prev, storyId]));

        } catch (error) {
            console.warn('⚠️ Error recording story view:', error);
        }
    };

    // ✅ NEW: Record view when story becomes current
    useEffect(() => {
        if (friends.length > 0 && currentUserIndex >= 0 && currentStoryIndex >= 0) {
            const currentFriend = friends[currentUserIndex];
            const currentStory = currentFriend?.stories[currentStoryIndex];

            if (currentStory) {
                // Small delay to ensure story is actually being viewed
                const viewTimer = setTimeout(() => {
                    recordStoryView(currentStory.id);
                }, 1000); // Record after 1 second of viewing

                return () => clearTimeout(viewTimer);
            }
        }
    }, [friends, currentUserIndex, currentStoryIndex]);

    const renderStoryItem: ListRenderItem<Friend> = ({ item, index }) => {
        const currentStory = item.stories[currentStoryIndex] || item.stories[0];
        const isCurrentUser = index === currentUserIndex;

        // Debug: Log media URL for debugging
        if (isCurrentUser && currentStory) {
            console.log('🎬 Current story URL:', currentStory.url);
            console.log('🎬 Story type:', currentStory.type);
            console.log('🎬 Story ID:', currentStory.id);
        }

        // SAFE STATUS HANDLER: Enhanced with better error handling
        const handleVideoStatusUpdate = (status: AVPlaybackStatus) => {
            if (!isCurrentUser || !isMountedRef.current) return;

            try {
                if (status.isLoaded) {
                    console.log('📹 Video loaded successfully');
                    const loading = status.isBuffering || false;

                    if (loading !== isVideoLoading && isMountedRef.current) {
                        onVideoLoadingChange(loading);
                    }

                    if (status.durationMillis && status.positionMillis !== undefined && isMountedRef.current) {
                        const progress = status.positionMillis / status.durationMillis;
                        onVideoProgressUpdate(progress);
                    }

                    // AUTO-PLAY: Ensure video starts playing
                    if (!status.isPlaying && !isPaused && isMountedRef.current) {
                        console.log('▶️ Auto-starting video playback');
                        videoRef.current?.playAsync().catch((error) => {
                            console.warn('⚠️ Auto-play failed:', error);
                        });
                    }
                } else if (status.error) {
                    console.error('❌ Video loading error:', status.error);
                    setMediaError(prev => ({ ...prev, [currentStory.id]: true }));
                    if (isMountedRef.current) {
                        onVideoLoadingChange(false);
                    }
                } else {
                    console.log('📹 Video loading...');
                    if (!isVideoLoading && isMountedRef.current) {
                        onVideoLoadingChange(true);
                    }
                }
            } catch (error) {
                console.error('📹 Video status update error:', error);
                setMediaError(prev => ({ ...prev, [currentStory.id]: true }));
            }
        };

        // IMAGE LOADING HANDLERS
        const handleImageLoadStart = () => {
            console.log('🖼️ Image loading started:', currentStory.url);
            setImageLoading(prev => ({ ...prev, [currentStory.id]: true }));
            setMediaError(prev => ({ ...prev, [currentStory.id]: false }));
        };

        const handleImageLoad = () => {
            console.log('✅ Image loaded successfully');
            setImageLoading(prev => ({ ...prev, [currentStory.id]: false }));

            // ✅ NEW: Record view when image loads successfully and is current
            if (isCurrentUser) {
                recordStoryView(currentStory.id);
            }
        };

        const handleImageError = (error: any) => {
            console.error('❌ Image loading error:', error);
            setImageLoading(prev => ({ ...prev, [currentStory.id]: false }));
            setMediaError(prev => ({ ...prev, [currentStory.id]: true }));
        };

        // VIDEO LOADING HANDLERS
        const handleVideoLoadStart = () => {
            console.log('📹 Video loading started:', currentStory.url);
            if (isCurrentUser && isMountedRef.current) {
                onVideoLoadingChange(true);
            }
            setMediaError(prev => ({ ...prev, [currentStory.id]: false }));
        };

        const handleVideoLoad = () => {
            console.log('✅ Video loaded successfully');
            if (isCurrentUser && isMountedRef.current) {
                onVideoLoadingChange(false);

                // ✅ NEW: Record view when video loads successfully and is current
                recordStoryView(currentStory.id);
            }
        };

        const handleVideoError = (error: any) => {
            console.error('❌ Video loading error:', error);
            setMediaError(prev => ({ ...prev, [currentStory.id]: true }));
            if (isMountedRef.current) {
                onVideoLoadingChange(false);
            }
        };

        if (!currentStory) {
            return (
                <View style={styles.storySlide}>
                    <View style={[styles.storyContentContainer, styles.errorContainer]}>
                        <Text style={styles.errorText}>No story available</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.storySlide}>
                <View style={styles.storyContentContainer}>
                    {/* Progress bars */}
                    {isCurrentUser && (
                        <StoryProgressBar
                            stories={item.stories}
                            currentStoryIndex={currentStoryIndex}
                            progress={progress}
                            isVideoLoading={isVideoLoading}
                            videoProgress={videoProgress}
                        />
                    )}

                    {/* ENHANCED: Story Content with Loading States */}
                    {currentStory.type === 'image' ? (
                        <>
                            {/* LOADING INDICATOR for images */}
                            {imageLoading[currentStory.id] && (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color="#fff" />
                                    <Text style={styles.loadingText}>Loading image...</Text>
                                </View>
                            )}

                            {/* ERROR STATE for images */}
                            {mediaError[currentStory.id] ? (
                                <View style={styles.errorOverlay}>
                                    <MaterialIcons name="broken-image" size={48} color="#666" />
                                    <Text style={styles.errorText}>Failed to load image</Text>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={() => {
                                            setMediaError(prev => ({ ...prev, [currentStory.id]: false }));
                                            setImageLoading(prev => ({ ...prev, [currentStory.id]: true }));
                                        }}
                                    >
                                        <Text style={styles.retryText}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Image
                                    source={{ uri: currentStory.url }}
                                    style={styles.fullSizeStoryMedia}
                                    resizeMode="cover"
                                    onLoadStart={handleImageLoadStart}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {/* LOADING INDICATOR for videos */}
                            {isCurrentUser && isVideoLoading && (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color="#fff" />
                                    <Text style={styles.loadingText}>Loading video...</Text>
                                </View>
                            )}

                            {/* ERROR STATE for videos */}
                            {mediaError[currentStory.id] ? (
                                <View style={styles.errorOverlay}>
                                    <MaterialIcons name="videocam-off" size={48} color="#666" />
                                    <Text style={styles.errorText}>Failed to load video</Text>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={() => {
                                            setMediaError(prev => ({ ...prev, [currentStory.id]: false }));
                                            if (isCurrentUser) {
                                                onVideoLoadingChange(true);
                                            }
                                        }}
                                    >
                                        <Text style={styles.retryText}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Video
                                    ref={isCurrentUser ? videoRef : null}
                                    source={{ uri: currentStory.url }}
                                    style={styles.fullSizeStoryMedia}
                                    shouldPlay={isCurrentUser && !isPaused}
                                    isLooping={false}
                                    isMuted={false}
                                    resizeMode="cover"
                                    onPlaybackStatusUpdate={handleVideoStatusUpdate}
                                    onLoadStart={handleVideoLoadStart}
                                    onLoad={handleVideoLoad}
                                    onError={handleVideoError}
                                />
                            )}
                        </>
                    )}

                    {/* Tap Zones */}
                    <View style={styles.gestureContainer}>
                        <TouchableOpacity
                            style={styles.leftTapZone}
                            onPress={() => onStoryTap('left')}
                            onLongPress={onLongPressStart}
                            onPressOut={onLongPressEnd}
                            activeOpacity={1}
                        />

                        <TouchableOpacity
                            style={styles.rightTapZone}
                            onPress={() => onStoryTap('right')}
                            onLongPress={onLongPressStart}
                            onPressOut={onLongPressEnd}
                            activeOpacity={1}
                        />
                    </View>

                    {/* Menu Icon */}
                    <TouchableOpacity
                        style={styles.menuIcon}
                        onPress={onMenuPress}
                        activeOpacity={0.7}
                    >
                        <Entypo name="dots-two-vertical" size={20} color="white" />
                    </TouchableOpacity>

                    {/* Reply Footer */}
                    <View style={styles.overlayFooter}>
                        <TouchableOpacity style={styles.replyButton}>
                            <MaterialIcons name="reply" size={18} color="white" />
                            <Text style={styles.replyText}>Reply to {item.name.split(' ')[0]}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const keyExtractor = (item: Friend) => item.id;

    return (
        <View style={styles.storiesContainer}>
            <FlatList
                ref={flatListRef}
                data={friends}
                renderItem={renderStoryItem}
                keyExtractor={keyExtractor}
                horizontal={true}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const contentOffsetX = event.nativeEvent.contentOffset.x;
                    const newUserIndex = Math.round(contentOffsetX / screenWidth);

                    if (newUserIndex !== currentUserIndex) {
                        if (newUserIndex > currentUserIndex) {
                            onUserSwipe('left');
                        } else {
                            onUserSwipe('right');
                        }
                    }
                }}
                getItemLayout={(data, index) => ({
                    length: screenWidth,
                    offset: screenWidth * index,
                    index,
                })}
                initialScrollIndex={0}
                decelerationRate="fast"
                snapToInterval={screenWidth}
                snapToAlignment="start"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    storiesContainer: {
        flex: 1,
        marginTop: -20,
    },
    storySlide: {
        width: screenWidth,
        paddingHorizontal: 4,
        paddingTop: 20,
    },
    storyContentContainer: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#111',
    },
    fullSizeStoryMedia: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    // Loading and error states
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        borderRadius: 16,
    },
    loadingText: {
        color: '#fff',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        borderRadius: 16,
    },
    errorText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
    },
    retryButton: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 16,
    },
    retryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    gestureContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        zIndex: 5,
    },
    leftTapZone: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    rightTapZone: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    menuIcon: {
        position: 'absolute',
        top: 10,
        right: 8,
        padding: 8,
        borderRadius: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 15,
    },
    overlayFooter: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        alignItems: 'center',
        zIndex: 10,
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    replyText: {
        color: 'white',
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '500',
    },
});

export default StoryViewer;
