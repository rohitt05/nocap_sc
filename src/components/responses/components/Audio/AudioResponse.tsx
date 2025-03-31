import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ResponseItemProps } from '../../types';
import { Entypo, FontAwesome, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { formatTimestamp, formatTime, useAudioPlayer } from './utils';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';
import { Link } from 'expo-router';
import ReactionPicker from '../ReactionPicker'; // Import the ReactionPicker component
import ReactionTexts from '../ReactionText/ReactionTexts';
import ShareModal from '../../../SharePostModal'; // Import the ShareModal component


// Update the ResponseItemProps to include necessary properties
interface ExtendedResponseItemProps extends ResponseItemProps {
    currentUserId?: string; // Added to track the current user
}

const AudioResponse: React.FC<ExtendedResponseItemProps> = ({ item, currentUserId }) => {
    const { audioState, togglePlayback } = useAudioPlayer(item.content);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showReactionTexts, setShowReactionTexts] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false); // Add state for ShareModal

    const isUserAuthenticated = !!currentUserId && typeof currentUserId === 'string' && currentUserId.length > 0;

    if (!isUserAuthenticated) {
        console.log('AudioResponse: No valid currentUserId provided', { currentUserId });
    }

    const handleReactionSelected = (reactionType: string) => {
        console.log(`Reaction ${reactionType} was selected for audio response`);
    };

    const handleReactionTextSelected = (reactionType: string) => {
        console.log(`Reaction text ${reactionType} was selected for audio response`);
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

                {/* Reaction and send buttons */}
                <View style={styles.reactionsContainer}>
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

export default AudioResponse;