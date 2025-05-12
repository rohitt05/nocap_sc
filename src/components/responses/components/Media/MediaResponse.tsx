import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av'; // Updated to use expo-av
import { Image } from 'expo-image';
import { Ionicons, Entypo, Feather, FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { ResponseItemProps } from '../../types';
import { styles } from './styles';
import ReactionPicker from '../ReactionPicker';
import ReactionTexts from '../ReactionText/ReactionTexts';
import ShareModal from '../../../SharePostModal';
import MediaCaptionResponse from './MediaCaptionResponse';

import {
    formatTimestamp,
    getDirectGiphyUrl,
    useVideoPlayer
} from './MediaUtils';

interface ExtendedResponseItemProps extends ResponseItemProps {
    currentUserId?: string;
}

const MediaResponse: React.FC<ExtendedResponseItemProps> = ({ item, currentUserId }) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showReactionTexts, setShowReactionTexts] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

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

    const handleReactionSelected = (reactionType: string) => {
        console.log(`Reaction ${reactionType} was selected for media response`);
    };

    const handleReactionTextSelected = (reactionType: string) => {
        console.log(`Reaction text ${reactionType} was selected for media response`);
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
                        <Video
                            ref={videoRef}
                            source={{ uri: videoState.uri }}
                            style={styles.mediaContent}
                            resizeMode={ResizeMode.COVER} // Using ResizeMode enum
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
        <View style={updatedStyles.mainContainer}>
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
                    <View style={styles.reactionsContainer}>
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

                {item.type === 'video' && (
                    <TouchableOpacity
                        style={styles.debugButton}
                        onPress={togglePlayback}
                    >
                        <FontAwesome
                            name={videoState.playing ? 'pause' : 'play'}
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                )}
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
    }
});

export default MediaResponse;
