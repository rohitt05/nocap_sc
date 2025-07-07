import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ResponseItemProps } from '../../types';
import { Entypo, FontAwesome, Feather, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { formatTimestamp, formatTime, useAudioPlayer } from './utils';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';
import { Link } from 'expo-router';
import ReactionPicker from '../ReactionPicker';
import ReactionTexts from '../ReactionText/ReactionTexts';
import ShareModal from '../../../SharePostModal';
import HumanReaction from '../HumanReaction'; // Import the HumanReaction component
import HumanReactionModal from '../HumanReaction/HumanReactionModal/HumanReactionModal'; // Import the HumanReactionModal
import { uploadHumanReaction } from '../HumanReaction/humanReactionService'; // Import the service
import { getHumanReactions } from '../HumanReaction/humanReactionService'; // Import the service

// Update the ResponseItemProps to include necessary properties
interface ExtendedResponseItemProps extends ResponseItemProps {
    currentUserId?: string; // Added to track the current user
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

const AudioResponse: React.FC<ExtendedResponseItemProps> = ({ item, currentUserId }) => {
    const { audioState, togglePlayback } = useAudioPlayer(item.content);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showReactionTexts, setShowReactionTexts] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showHumanReaction, setShowHumanReaction] = useState(false);
    const [showHumanReactionModal, setShowHumanReactionModal] = useState(false);
    const [humanReactions, setHumanReactions] = useState<HumanReaction[]>([]);

    const isUserAuthenticated = !!currentUserId && typeof currentUserId === 'string' && currentUserId.length > 0;

    if (!isUserAuthenticated) {
        console.log('AudioResponse: No valid currentUserId provided', { currentUserId });
    }

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

    const handleReactionSelected = (reactionType: string) => {
        console.log(`Reaction ${reactionType} was selected for audio response`);
    };

    const handleReactionTextSelected = (reactionType: string) => {
        console.log(`Reaction text ${reactionType} was selected for audio response`);
    };

    const handleMediaCaptured = async (mediaUri: string, mediaType: 'image' | 'video') => {
        try {
            console.log(`Captured ${mediaType} for response ${item.id}:`, mediaUri);

            if (!currentUserId) {
                console.error('User not authenticated');
                Alert.alert('Error', 'You must be logged in to post a reaction');
                return;
            }

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

    return (
        <View style={styles.responseItem}>
            <LinearGradient
                colors={['#87CEFA', '#1E90FF', '#0000CD', '#000033']}
                style={styles.contentContainer}
                locations={[0, 0.3, 0.7, 1]}
            >
                {/* Header with user info and timestamp */}
                <View style={styles.header}>
                    <Link href={`/Screens/user/users?id=${item.user.id}`} asChild>
                        <TouchableOpacity>
                            <Image
                                source={{ uri: item.user.avatar || 'https://via.placeholder.com/40' }}
                                style={styles.profilePic}
                                contentFit="cover"
                            />
                        </TouchableOpacity>
                    </Link>
                    <View style={styles.headerInfo}>
                        <Link href={`/Screens/user/users?id=${item.user.id}`} asChild>
                            <TouchableOpacity>
                                <Text style={styles.username}>{item.user.username}</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                    <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                    <TouchableOpacity
                        style={styles.menuDotsContainer}
                        onPress={() => setShowShareModal(true)} >
                        <Entypo name="dots-two-vertical" size={16} color="#fff" style={styles.menuDots} />
                    </TouchableOpacity>
                </View>

                {/* Message content area - expanded for extra height */}
                <View style={styles.messageContent}>
                    {/* Empty space for additional height */}
                </View>

                {/* Audio controls at bottom left corner */}
                <View style={styles.audioControls}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={togglePlayback}
                        disabled={!audioState.isLoaded}
                        hitSlop={5}
                    >
                        <FontAwesome
                            name={audioState.isPlaying ? "pause" : "play"}
                            size={20}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    <Text style={styles.audioDuration}>
                        {formatTime(audioState.duration)}
                    </Text>
                </View>

                {audioState.error && (
                    <Text style={styles.errorText}>{audioState.error}</Text>
                )}

                {/* ShareModal component */}
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

                {/* ReactionTexts */}
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

                {/* Bottom bar with reactions view button and reaction buttons */}
                <View style={updatedStyles.bottomBar}>
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

                        {/* Replace send button with ReactionTexts trigger */}
                        {isUserAuthenticated && (
                            <TouchableOpacity
                                style={[styles.reactionButton, showReactionTexts && additionalStyles.activeButton]}
                                onPress={() => {
                                    setShowReactionTexts(prev => !prev);
                                    setShowReactionPicker(false); // Close emoji picker if open
                                }}
                            >
                                <Feather name="type" size={18} color="#fff" />
                            </TouchableOpacity>
                        )}

                        {/* Emoji reaction button */}
                        {isUserAuthenticated && (
                            <TouchableOpacity
                                style={[styles.reactionButton, showReactionPicker && additionalStyles.activeButton]}
                                onPress={() => {
                                    setShowReactionPicker(prev => !prev);
                                    setShowReactionTexts(false); // Close reaction texts if open
                                }}
                            >
                                <Entypo name="emoji-happy" size={18} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>
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

const updatedStyles = StyleSheet.create({
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
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
        right: 20,
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
    }
});

export default AudioResponse;