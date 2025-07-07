import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av'; // Updated to use expo-av
import { Image } from 'expo-image';
import { Ionicons, Entypo, Feather, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { ResponseItemProps } from '../../types';
import { styles } from './styles';
import ReactionPicker from '../ReactionPicker';
import ReactionTexts from '../ReactionText/ReactionTexts';
import ShareModal from '../../../SharePostModal';
import MediaCaptionResponse from './MediaCaptionResponse';
import HumanReaction from '../HumanReaction'; // Import the new component
import HumanReactionModal from '../HumanReaction/HumanReactionModal/HumanReactionModal'; // Import the new modal
import { uploadHumanReaction } from '../HumanReaction/humanReactionService'; // Adjust path as needed
import { getHumanReactions } from '../HumanReaction/humanReactionService'; // Add this import

import {
    formatTimestamp,
    getDirectGiphyUrl,
    useVideoPlayer
} from './MediaUtils';

interface ExtendedResponseItemProps extends ResponseItemProps {
    currentUserId?: string;
}

interface HumanReaction {
    id: string;
    response_id: string;
    user_id: string;
    content_type: 'image' | 'video';
    file_url: string;
    created_at: string;
    user: {
        id: string;
        username: string;
        full_name: string;
        avatar_url: string;
    };
}

const MediaResponse: React.FC<ExtendedResponseItemProps> = ({ item, currentUserId }) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showReactionTexts, setShowReactionTexts] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showHumanReaction, setShowHumanReaction] = useState(false);
    const [showHumanReactionModal, setShowHumanReactionModal] = useState(false); // New state
    const [isInViewport, setIsInViewport] = useState(false);
    const [manuallyPaused, setManuallyPaused] = useState(false);
    const [humanReactions, setHumanReactions] = useState<HumanReaction[]>([]); // Add this state

    const componentRef = useRef<View>(null);

    // Using updated expo-video for video error handling
    const mediaUrl = item.content;
    const {
        videoState,
        videoRef,
        togglePlayback,
        onPlaybackStatusUpdate,
        handleVideoError,
        retryVideoLoad
    } = useVideoPlayer(item.type === 'video' ? mediaUrl ?? '' : '');

    const isUserAuthenticated = !!currentUserId && typeof currentUserId === 'string' && currentUserId.length > 0;

    // Fetch human reactions
    const fetchHumanReactions = async () => {
        try {
            const result = await getHumanReactions(item.id);
            if (result.success) {
                setHumanReactions(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching human reactions:', error);
        }
    };

    // Fetch human reactions on component mount
    useEffect(() => {
        fetchHumanReactions();
    }, [item.id]);

    // Check if component is in viewport
    const checkViewport = () => {
        if (componentRef.current) {
            componentRef.current.measure((x, y, width, height, pageX, pageY) => {
                // Get screen dimensions (approximate)
                const screenHeight = 800; // You can get this dynamically if needed
                const screenWidth = 400;

                // Check if the component is visible
                const isVisible = (
                    pageY < screenHeight && // Top edge is above screen bottom
                    pageY + height > 0 && // Bottom edge is below screen top
                    pageX < screenWidth && // Left edge is before screen right
                    pageX + width > 0 // Right edge is after screen left
                );

                // More strict visibility check - at least 50% of component should be visible
                const visibleHeight = Math.min(screenHeight, pageY + height) - Math.max(0, pageY);
                const visibilityPercentage = visibleHeight / height;
                const isSignificantlyVisible = visibilityPercentage > 0.5;

                setIsInViewport(isVisible && isSignificantlyVisible);
            });
        }
    };

    // Check viewport on mount and periodically
    useEffect(() => {
        const interval = setInterval(checkViewport, 500); // Check every 500ms
        checkViewport(); // Initial check

        return () => clearInterval(interval);
    }, []);

    // Handle video play/pause based on viewport visibility
    useEffect(() => {
        if (item.type === 'video' && videoRef.current) {
            if (isInViewport && !manuallyPaused) {
                // Play video when in viewport and not manually paused
                videoRef.current.playAsync();
            } else {
                // Pause video when out of viewport or manually paused
                videoRef.current.pauseAsync();
            }
        }
    }, [isInViewport, manuallyPaused, item.type]);

    // Handle manual tap to pause/play
    const handleVideoTap = () => {
        if (videoState.playing) {
            setManuallyPaused(true);
            togglePlayback();
        } else {
            setManuallyPaused(false);
            togglePlayback();
        }
    };

    const handleReactionSelected = (reactionType: string) => {
        console.log(`Reaction ${reactionType} was selected for media response`);
    };

    const handleReactionTextSelected = (reactionType: string) => {
        console.log(`Reaction text ${reactionType} was selected for media response`);
    };

    // In your MediaResponse component, replace the handleMediaCaptured function with this:

    const handleMediaCaptured = async (mediaUri: string, mediaType: 'image' | 'video') => {
        try {
            console.log(`Captured ${mediaType} for response ${item.id}:`, mediaUri);

            if (!currentUserId) {
                console.error('User not authenticated');
                // TODO: Show error message to user
                Alert.alert('Error', 'You must be logged in to post a reaction');
                return;
            }

            // Show loading state (optional)
            // setIsUploading(true);

            // Upload the human reaction using the imported service
            const result = await uploadHumanReaction(
                mediaUri,
                mediaType,
                currentUserId,
                item.id
            );

            if (result.success) {
                console.log('Human reaction posted successfully!', result.data);
                setShowHumanReaction(false);
                // Refresh human reactions after successful upload
                fetchHumanReactions();

            } else {
                console.error('Failed to post human reaction:', result.error);

                // Show error message to user
                Alert.alert(
                    'Upload Failed',
                    result.error || 'Failed to post your reaction. Please try again.'
                );
            }
        } catch (error) {
            console.error('Error posting human reaction:', error);

            // Show generic error message
            Alert.alert(
                'Error',
                'Something went wrong. Please check your internet connection and try again.'
            );
        } finally {

        }
    };

    // Render profile images for reactions button
    const renderReactionProfiles = () => {
        const latestReactions = humanReactions.slice(0, 3); // Get latest 3 reactions

        if (latestReactions.length === 0) {
            // No reactions - show original button
            return (
                <TouchableOpacity
                    style={[styles.reactionButton, updatedStyles.viewReactionsButton]}
                    onPress={() => setShowHumanReactionModal(true)}
                >
                    <FontAwesome6 name="egg" size={14} color="white" />

                    {/* <Text style={updatedStyles.buttonText}>Reactions</Text> */}
                </TouchableOpacity>
            );
        }

        // Has reactions - show profile images only
        return (
            <TouchableOpacity
                style={updatedStyles.profileOnlyButton}
                onPress={() => setShowHumanReactionModal(true)}
            >
                <View style={updatedStyles.profileStack}>
                    {latestReactions.map((reaction, index) => (
                        <Image
                            key={reaction.id}
                            source={{ uri: reaction.user.avatar_url || 'https://via.placeholder.com/24' }}
                            style={[
                                updatedStyles.profileImage,
                                { zIndex: latestReactions.length - index, marginLeft: index > 0 ? -8 : 0 }
                            ]}
                            contentFit="cover"
                        />
                    ))}
                </View>
            </TouchableOpacity>
        );
    };

    const renderMedia = () => {
        if (!mediaUrl) return null;

        switch (item.type) {
            case 'image':
                return (
                    <Image
                        source={{ uri: mediaUrl }}
                        style={styles.mediaContent}
                        contentFit="cover"
                        transition={200}
                    />
                );

            case 'gif':
                return (
                    <Image
                        source={{ uri: getDirectGiphyUrl(mediaUrl) }}
                        style={styles.mediaContent}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                    />
                );

            case 'video':
                return (
                    <>
                        <TouchableOpacity
                            style={updatedStyles.videoTouchArea}
                            onPress={handleVideoTap}
                            activeOpacity={1}
                        >
                            <Video
                                ref={videoRef}
                                source={{ uri: videoState.uri }}
                                style={styles.mediaContent}
                                resizeMode={ResizeMode.COVER}
                                shouldPlay={false} // We'll control this programmatically
                                isLooping={true}
                                useNativeControls={false}
                                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                                onError={handleVideoError}
                                onLoad={(status) => {
                                    if (status.isLoaded) {
                                        console.log('Video loaded successfully');
                                        // Check viewport after video loads
                                        setTimeout(checkViewport, 100);
                                    }
                                }}
                                posterSource={{ uri: mediaUrl }}
                                usePoster={!isInViewport} // Show poster when not in viewport
                                posterStyle={styles.mediaPoster}
                            />
                        </TouchableOpacity>

                        {/* Visual indicator when video is paused */}
                        {item.type === 'video' && !videoState.playing && isInViewport && (
                            <View style={updatedStyles.pauseIndicator}>
                                <View style={updatedStyles.pauseIcon}>
                                    <Ionicons name="play" size={32} color="white" />
                                </View>
                            </View>
                        )}

                        {videoState.error && (
                            <View style={styles.errorOverlay}>
                                <Ionicons name="alert-circle" size={24} color="#FF5252" />
                                <Text style={styles.errorText}>
                                    {videoState.error.includes('Error:') ? 'Failed to load video, please refresh and try again' : videoState.error}
                                </Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={retryVideoLoad}
                                >
                                    <Ionicons name="refresh" size={16} color="white" />
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <View
            ref={componentRef}
            style={updatedStyles.mainContainer}
            onLayout={checkViewport} // Check viewport when component layout changes
        >
            <View style={styles.mediaResponseItem}>
                <View style={styles.mediaContainer}>
                    {renderMedia()}
                </View>

                <View style={styles.gradientOverlay} />

                <View style={styles.overlayHeader}>
                    <Link href={`/Screens/user/users?id=${item.user.id}`} asChild>
                        <TouchableOpacity>
                            <Image
                                source={{ uri: item.user.avatar || 'https://via.placeholder.com/40' }}
                                style={styles.profilePic}
                                contentFit="cover"
                                transition={100}
                            />
                        </TouchableOpacity>
                    </Link>
                    <View style={styles.headerInfo}>
                        <Link href={`/Screens/user/users?id=${item.user.id}`} asChild>
                            <TouchableOpacity>
                                <Text style={styles.overlayUsername}>{item.user.username}</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <Text style={styles.overlayTimestamp}>{formatTimestamp(item.timestamp)}</Text>

                    <TouchableOpacity
                        style={styles.menuDotsContainer}
                        onPress={() => setShowShareModal(true)}
                    >
                        <Entypo name="dots-two-vertical" size={24} color="white" style={styles.menuDots} />
                    </TouchableOpacity>
                </View>

                <ShareModal
                    isVisible={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    postId={item.id}
                    postType={item.type}
                />

                {/* HumanReaction Camera Component */}
                {isUserAuthenticated && (
                    <HumanReaction
                        isVisible={showHumanReaction}
                        onClose={() => setShowHumanReaction(false)}
                        responseId={item.id}
                        userId={currentUserId}
                        onMediaCaptured={handleMediaCaptured}
                    />
                )}

                {/* Human Reaction Modal */}
                <HumanReactionModal
                    isVisible={showHumanReactionModal}
                    onClose={() => setShowHumanReactionModal(false)}
                    responseId={item.id}
                    currentUserId={currentUserId}
                />

                {isUserAuthenticated && (
                    <ReactionTexts
                        responseId={item.id}
                        userId={currentUserId}
                        isVisible={showReactionTexts}
                        onClose={() => setShowReactionTexts(false)}
                        onReactionSelected={handleReactionTextSelected}
                    />
                )}

                {isUserAuthenticated && (
                    <ReactionPicker
                        responseId={item.id}
                        userId={currentUserId}
                        isVisible={showReactionPicker}
                        onClose={() => setShowReactionPicker(false)}
                        onReactionSelected={handleReactionSelected}
                    />
                )}

                <View style={styles.bottomBar}>
                    {/* Human Reactions View Button - Left Side */}
                    <View style={updatedStyles.leftControls}>
                        {renderReactionProfiles()}
                    </View>

                    {/* All reaction buttons on the right */}
                    <View style={styles.reactionsContainer}>
                        {isUserAuthenticated && (
                            <TouchableOpacity
                                style={[styles.reactionButton, showHumanReaction && additionalStyles.activeButton]}
                                onPress={() => setShowHumanReaction(prev => !prev)}
                            >
                                <MaterialIcons name="camera-alt" size={18} color="#fff" />
                            </TouchableOpacity>
                        )}

                        {isUserAuthenticated && (
                            <TouchableOpacity
                                style={[styles.reactionButton, showReactionTexts && additionalStyles.activeButton]}
                                onPress={() => setShowReactionTexts(prev => !prev)}
                            >
                                <Feather name="type" size={18} color="#fff" />
                            </TouchableOpacity>
                        )}

                        {isUserAuthenticated && (
                            <TouchableOpacity
                                style={[styles.reactionButton, showReactionPicker && additionalStyles.activeButton]}
                                onPress={() => setShowReactionPicker(prev => !prev)}
                            >
                                <Entypo name="emoji-happy" size={18} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {item.caption && (
                <MediaCaptionResponse
                    caption={item.caption}
                    style={updatedStyles.captionSection}
                />
            )}
        </View>
    );
};

const additionalStyles = StyleSheet.create({
    activeButton: {
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderWidth: 1,
        borderColor: '#3498db',
    }
});

const updatedStyles = StyleSheet.create({
    mainContainer: {
        marginBottom: 5,
        borderRadius: 12,
        overflow: 'hidden',
    },
    captionSection: {
        paddingHorizontal: 10,
        paddingBottom: 12,
    },
    leftControls: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    viewReactionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
    },
    profileOnlyButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileStack: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    profileImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fff',
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    videoTouchArea: {
        width: '100%',
        height: '100%',
    },
    pauseIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -30 }, { translateY: -30 }],
        zIndex: 10,
    },
    pauseIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default MediaResponse;