import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Entypo, Feather, FontAwesome } from '@expo/vector-icons';
import { ResponseItemProps } from '../../types';
import { styles } from './styles';
import { Link } from 'expo-router';
import ReactionPicker from '../ReactionPicker';
import ReactionTexts from '../ReactionText/ReactionTexts';
import ShareModal from '../../../SharePostModal'; // Import the ShareModal component
import {
    formatTimestamp,
    getDirectGiphyUrl,
    useVideoPlayer
} from './MediaUtils';

// Update the ResponseItemProps to include necessary properties
interface ExtendedResponseItemProps extends ResponseItemProps {
    currentUserId?: string; // Added to track the current user
}

const MediaResponse: React.FC<ExtendedResponseItemProps> = ({ item, currentUserId }) => {
    // State to control reaction picker visibility
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showReactionTexts, setShowReactionTexts] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false); // Add state for ShareModal

    // Use the custom hook for video handling
    const mediaUrl = item.content;
    const {
        videoState,
        videoRef,
        togglePlayback,
        onPlaybackStatusUpdate,
        handleVideoError,
        retryVideoLoad
    } = useVideoPlayer(item.type === 'video' ? mediaUrl : '');

    // Validate currentUserId early
    const isUserAuthenticated = !!currentUserId && typeof currentUserId === 'string' && currentUserId.length > 0;

    if (!isUserAuthenticated) {
        console.log('MediaResponse: No valid currentUserId provided', { currentUserId });
    }

    // Handle reaction selection from the picker
    const handleReactionSelected = (reactionType: string) => {
        // Just a simple callback
        console.log(`Reaction ${reactionType} was selected for media response`);
    };

    const handleReactionTextSelected = (reactionType: string) => {
        console.log(`Reaction text ${reactionType} was selected for media response`);
    };

    // Render appropriate media based on item type
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
                        <Video
                            ref={videoRef}
                            source={{ uri: videoState.uri }}
                            style={styles.mediaContent}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={false}
                            isLooping={false}
                            useNativeControls={false}
                            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                            onError={handleVideoError}
                            onLoad={(status) => {
                                if (status.isLoaded) {
                                    console.log('Video loaded successfully');
                                }
                            }}
                            posterSource={{ uri: mediaUrl }}
                            usePoster={true}
                            posterStyle={styles.mediaPoster}
                        />

                        {videoState.error && (
                            <View style={styles.errorOverlay}>
                                <Ionicons name="alert-circle" size={24} color="#FF5252" />
                                <Text style={styles.errorText}>
                                    {videoState.error.includes('Error:') ? 'Failed to load video' : videoState.error}
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
        <View style={styles.mediaResponseItem}>
            {/* Media content */}
            <View style={styles.mediaContainer}>
                {renderMedia()}
            </View>

            {/* Gradient overlay */}
            <View style={styles.gradientOverlay} />

            {/* Header overlay */}
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

                {/* Timestamp now appears here */}
                <Text style={styles.overlayTimestamp}>{formatTimestamp(item.timestamp)}</Text>

                {/* Menu dots in top right corner - now opens ShareModal */}
                <TouchableOpacity
                    style={styles.menuDotsContainer}
                    onPress={() => setShowShareModal(true)}
                >
                    <Entypo name="dots-two-vertical" size={24} color="white" style={styles.menuDots} />
                </TouchableOpacity>
            </View>

            {/* ShareModal component */}
            <ShareModal
                isVisible={showShareModal}
                onClose={() => setShowShareModal(false)}
                postId={item.id}
                postType={item.type}
            />

            {/* Only render ReactionTexts if user is authenticated */}
            {isUserAuthenticated && (
                <ReactionTexts
                    responseId={item.id}
                    userId={currentUserId}
                    isVisible={showReactionTexts}
                    onClose={() => setShowReactionTexts(false)}
                    onReactionSelected={handleReactionTextSelected}
                />
            )}

            {/* Only render ReactionPicker if user is authenticated */}
            {isUserAuthenticated && (
                <ReactionPicker
                    responseId={item.id}
                    userId={currentUserId}
                    isVisible={showReactionPicker}
                    onClose={() => setShowReactionPicker(false)}
                    onReactionSelected={handleReactionSelected}
                />
            )}

            {/* Bottom bar with reactions */}
            <View style={styles.bottomBar}>
                <View style={styles.reactionsContainer}>
                    {/* Replace send button with ReactionTexts trigger */}
                    {isUserAuthenticated && (
                        <TouchableOpacity
                            style={[styles.reactionButton, showReactionTexts && additionalStyles.activeButton]}
                            onPress={() => setShowReactionTexts(prev => !prev)}
                        >
                            <Feather name="type" size={18} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {/* Existing reaction emoji button */}
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

            {/* Play/Pause button */}
            {item.type === 'video' && (
                <TouchableOpacity
                    style={styles.debugButton}
                    onPress={togglePlayback}
                >
                    <FontAwesome
                        name={videoState.playing ? "pause" : "play"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

// Additional styles for new components
const additionalStyles = StyleSheet.create({
    activeButton: {
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderWidth: 1,
        borderColor: '#3498db',
    }
});

export default MediaResponse;