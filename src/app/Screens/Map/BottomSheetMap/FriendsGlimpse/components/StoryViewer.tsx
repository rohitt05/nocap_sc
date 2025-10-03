import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, Animated, ActivityIndicator } from 'react-native';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import { Video, AVPlaybackStatus } from 'expo-av';
import { supabase } from '../../../../../../../lib/supabase';
import StoryProgressBar from './StoryProgressBar';
import VibrantCaption from '../../../VibrantCaption';
import StoryActionSheet from './StoryActionSheet';

const { width: screenWidth } = Dimensions.get('window');

interface Story {
    id: string;
    type: 'image' | 'video';
    url: string;
    uploadedTime: string;
    timestamp: number;
    duration: number;
    caption: string;
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
    flatListRef: React.RefObject<FlatList<any>>;
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

    const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
    const [mediaError, setMediaError] = useState<{ [key: string]: boolean }>({});
    const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
    const [showActionSheet, setShowActionSheet] = useState(false);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (videoRef.current) {
                videoRef.current.unloadAsync().catch(() => { });
            }
        };
    }, []);

    const recordStoryView = async (storyId: string) => {
        try {
            if (viewedStories.has(storyId)) return;
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) return;
            await supabase
                .from('story_views')
                .insert({ story_id: storyId, viewer_user_id: user.id });
            setViewedStories(prev => new Set([...prev, storyId]));
        } catch { }
    };

    useEffect(() => {
        if (friends.length > 0 && currentUserIndex >= 0 && currentStoryIndex >= 0) {
            const currentFriend = friends[currentUserIndex];
            const currentStory = currentFriend?.stories[currentStoryIndex];
            if (currentStory) {
                const viewTimer = setTimeout(() => {
                    recordStoryView(currentStory.id);
                }, 1000);
                return () => clearTimeout(viewTimer);
            }
        }
    }, [friends, currentUserIndex, currentStoryIndex]);

    const renderStoryItem = ({ item, index }: { item: Friend; index: number }) => {
        const currentStory = item.stories[currentStoryIndex] || item.stories[0];
        const isCurrentUser = index === currentUserIndex;

        const handleVideoStatusUpdate = (status: AVPlaybackStatus) => {
            if (!isCurrentUser || !isMountedRef.current) return;
            try {
                if (status.isLoaded) {
                    const loading = status.isBuffering || false;
                    if (loading !== isVideoLoading && isMountedRef.current) onVideoLoadingChange(loading);
                    if (status.durationMillis && status.positionMillis !== undefined && isMountedRef.current) {
                        const progress = status.positionMillis / status.durationMillis;
                        onVideoProgressUpdate(progress);
                    }
                    if (!status.isPlaying && !isPaused && isMountedRef.current) {
                        videoRef.current?.playAsync().catch(() => { });
                    }
                } else if (status.error) {
                    setMediaError(prev => ({ ...prev, [currentStory.id]: true }));
                    if (isMountedRef.current) onVideoLoadingChange(false);
                } else {
                    if (!isVideoLoading && isMountedRef.current) onVideoLoadingChange(true);
                }
            } catch {
                setMediaError(prev => ({ ...prev, [currentStory.id]: true }));
            }
        };

        const handleImageLoadStart = () => setImageLoading(prev => ({ ...prev, [currentStory.id]: true }));
        const handleImageLoad = () => {
            setImageLoading(prev => ({ ...prev, [currentStory.id]: false }));
            if (isCurrentUser) recordStoryView(currentStory.id);
        };
        const handleImageError = () => setMediaError(prev => ({ ...prev, [currentStory.id]: true }));

        const handleVideoLoadStart = () => {
            if (isCurrentUser && isMountedRef.current) onVideoLoadingChange(true);
            setMediaError(prev => ({ ...prev, [currentStory.id]: false }));
        };
        const handleVideoLoad = () => {
            if (isCurrentUser && isMountedRef.current) {
                onVideoLoadingChange(false);
                recordStoryView(currentStory.id);
            }
        };
        const handleVideoError = () => {
            setMediaError(prev => ({ ...prev, [currentStory.id]: true }));
            if (isMountedRef.current) onVideoLoadingChange(false);
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
                    {isCurrentUser && (
                        <View style={styles.progressBarCaptionAbsolute}>
                            <StoryProgressBar
                                stories={item.stories}
                                currentStoryIndex={currentStoryIndex}
                                progress={progress}
                                isVideoLoading={isVideoLoading}
                                videoProgress={videoProgress}
                            />
                            {!!currentStory.caption && (
                                <View style={styles.captionBubbleWrapper}>
                                    <View style={styles.captionBubble}>
                                        <VibrantCaption
                                            uri={currentStory.type === 'image' ? currentStory.url : ''}
                                            style={styles.captionText}
                                            mode="dominant"
                                            pick={all => all.darkVibrant || all.vibrant || all.dominant || '#fff'}
                                        >
                                            {currentStory.caption}
                                        </VibrantCaption>
                                        <View style={styles.captionCaret} />
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {currentStory.type === 'image' ? (
                        <>
                            {imageLoading[currentStory.id] && (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color="#fff" />
                                    <Text style={styles.loadingText}>Loading image...</Text>
                                </View>
                            )}
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
                            {isCurrentUser && isVideoLoading && (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color="#fff" />
                                    <Text style={styles.loadingText}>Loading video...</Text>
                                </View>
                            )}
                            {mediaError[currentStory.id] ? (
                                <View style={styles.errorOverlay}>
                                    <MaterialIcons name="videocam-off" size={48} color="#666" />
                                    <Text style={styles.errorText}>Failed to load video</Text>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={() => {
                                            setMediaError(prev => ({ ...prev, [currentStory.id]: false }));
                                            if (isCurrentUser) onVideoLoadingChange(true);
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

                    <TouchableOpacity
                        style={styles.menuIcon}
                        onPress={() => setShowActionSheet(true)}
                        activeOpacity={0.7}
                    >
                        <Entypo name="dots-two-vertical" size={20} color="white" />
                    </TouchableOpacity>

                    {/* <View style={styles.overlayFooter}>
                        <TouchableOpacity style={styles.replyButton}>
                            <MaterialIcons name="reply" size={18} color="white" />
                            <Text style={styles.replyText}>Reply to {item.name.split(' ')[0]}</Text>
                        </TouchableOpacity>
                    </View> */}

                    <StoryActionSheet
                        visible={showActionSheet}
                        onClose={() => setShowActionSheet(false)}
                        onReport={() => {
                            // TODO: Add your report story logic, e.g. supabase reporting mutation for story id
                            setShowActionSheet(false);
                        }}
                    />
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
        marginTop: 0,
    },
    storySlide: {
        width: screenWidth,
        paddingHorizontal: 4,
        paddingTop: 0,
    },
    storyContentContainer: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#111',
    },
    progressBarCaptionAbsolute: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        zIndex: 50,
        alignItems: 'flex-start',
        paddingHorizontal: 12,
        paddingTop: 6,
    },
    captionBubbleWrapper: {
        marginTop: 28,
        width: '100%',
        alignItems: 'flex-start',
    },
    captionBubble: {
        backgroundColor: 'rgba(240, 246, 249, 0.2)',
        borderRadius: 13,
        paddingVertical: 7,
        paddingHorizontal: 16,
        marginLeft: 4,
        maxWidth: '78%',
        position: 'relative',
        flexDirection: 'column',
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.16,
        shadowRadius: 4,
    },
    captionCaret: {
        position: 'absolute',
        left: 14,
        top: -11,
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 11,
        borderStyle: 'solid',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'rgba(240, 246, 249, 0.2)',
    },
    captionText: {
        color: '#fff',
        fontWeight: '400',
        fontSize: 14.2,
        textAlign: 'left',
        lineHeight: 19,
        textShadowColor: 'rgba(0,0,0,0.16)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    fullSizeStoryMedia: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
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
