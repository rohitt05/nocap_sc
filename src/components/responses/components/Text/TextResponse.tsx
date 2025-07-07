import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { ResponseItemProps } from '../../types';
import { Entypo, Feather, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image'; // Added this import for profile images
import { styles } from './styles';
import { Link } from 'expo-router';
import ReactionPicker from '../ReactionPicker';
import ReactionTexts from '../ReactionText/ReactionTexts';
import ShareModal from '../../../SharePostModal';
import HumanReaction from '../HumanReaction'; // Import HumanReaction component
import HumanReactionModal from '../HumanReaction/HumanReactionModal/HumanReactionModal'; // Import HumanReactionModal
import { uploadHumanReaction, getHumanReactions } from '../HumanReaction/humanReactionService'; // Import services

import {
    formatTimestamp,
    estimateNeedsExpansion,
    isValidUserId,
    measureTextLines
} from './TextResponseUtils';

// Update the ResponseItemProps to include any necessary properties
interface ExtendedResponseItemProps extends ResponseItemProps {
    currentUserId: string; // Added to track the current user
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

const TextResponse: React.FC<ExtendedResponseItemProps> = ({ item, currentUserId }) => {
    // Validate currentUserId early
    const isUserAuthenticated = isValidUserId(currentUserId);

    if (!isUserAuthenticated) {
        console.log('TextResponse: No valid currentUserId provided', { currentUserId });
    }

    // State to track if the content is expanded
    const [expanded, setExpanded] = useState(false);
    // State to track if content is long enough to need expansion
    const [needsExpansion, setNeedsExpansion] = useState(false);
    // State to control reaction picker visibility
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    // State to control reaction texts visibility
    const [showReactionTexts, setShowReactionTexts] = useState(false);
    // state to control share modal visibility
    const [showShareModal, setShowShareModal] = useState(false);
    // State for human reaction functionality
    const [showHumanReaction, setShowHumanReaction] = useState(false);
    const [showHumanReactionModal, setShowHumanReactionModal] = useState(false);
    const [humanReactions, setHumanReactions] = useState<HumanReaction[]>([]);

    // Ref for the text component to measure its height
    const textRef = useRef(null);

    // Function to check if content needs expansion button
    useEffect(() => {
        if (textRef.current) {
            // Use utility function to estimate if expansion is needed
            setNeedsExpansion(estimateNeedsExpansion(item?.content));
        }
    }, [item?.content]);

    // For more accurate line counting after render
    useEffect(() => {
        // Use utility function for text measurement
        const timeout = setTimeout(() => {
            measureTextLines(textRef, () => {
                // Additional measurement logic if needed
            });
        }, 100);
        return () => clearTimeout(timeout);
    }, []);

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

    // Toggle expanded state
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    // Handle reaction selection from the picker
    const handleReactionSelected = (reactionType: string) => {
        // Just a simple callback - we don't need to refresh reactions anymore
        console.log(`Reaction ${reactionType} was selected`);
    };

    const handleReactionTextSelected = (reactionType: string) => {
        console.log(`Reaction text ${reactionType} was selected for text response`);
    };

    // Handle media captured from HumanReaction component
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
                Alert.alert(
                    'Upload Failed',
                    result.error || 'Failed to post your reaction. Please try again.'
                );
            }
        } catch (error) {
            console.error('Error posting human reaction:', error);
            Alert.alert(
                'Error',
                'Something went wrong. Please check your internet connection and try again.'
            );
        }
    };

    // Render profile images for reactions button (same logic as MediaResponse)
    const renderReactionProfiles = () => {
        const latestReactions = humanReactions.slice(0, 3); // Get latest 3 reactions

        if (latestReactions.length === 0) {
            // No reactions - show original button with egg icon
            return (
                <TouchableOpacity
                    style={[styles.reactionButton, updatedStyles.viewReactionsButton]}
                    onPress={() => setShowHumanReactionModal(true)}
                >
                    <FontAwesome6 name="egg" size={14} color="white" />
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

    // Check if we have necessary data
    if (!item || !item.id || !item.user) {
        console.warn('Missing required data in item prop', { itemExists: !!item, hasId: !!item?.id, hasUser: !!item?.user });
        return null;
    }

    return (
        <View style={[
            styles.responseItem,
            // Dynamic height based on content and expansion state
            expanded ? styles.expanded : (needsExpansion ? styles.defaultHeight : styles.compactHeight)
        ]}>
            <View style={styles.contentContainer}>
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
                        <TouchableOpacity>
                            <Text style={styles.username}>{item.user.username}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Header right section with timestamp and menu dots */}
                <View style={styles.headerRight}>
                    <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                    <TouchableOpacity
                        style={styles.menuDotsContainer}
                        onPress={() => setShowShareModal(true)} >
                        <Entypo name="dots-two-vertical" size={16} color="#fff" style={styles.menuDots} />
                    </TouchableOpacity>
                </View>

                {/* Text content with quote icon */}
                <View style={styles.textContentContainer}>
                    <MaterialCommunityIcons
                        name="format-quote-open-outline"
                        size={24}
                        color="#e0e0e0"
                        style={styles.quoteIcon}
                    />
                    <Text
                        ref={textRef}
                        style={styles.textContent}
                        numberOfLines={expanded ? undefined : 3}
                        onTextLayout={(e) => {
                            // Most accurate way to count lines on both iOS and Android
                            const linesCount = e.nativeEvent.lines.length;
                            setNeedsExpansion(linesCount > 3);
                        }}
                    >
                        {item.content}
                    </Text>
                </View>

                {/* Bottom section with Human Reactions and Show more/less */}
                <View style={updatedStyles.bottomSection}>
                    {/* Human Reactions Button - Left Side */}
                    {isUserAuthenticated && renderReactionProfiles()}

                    {/* Show more/less button - Right Side */}
                    {needsExpansion && (
                        <TouchableOpacity
                            style={[styles.moreButton, updatedStyles.alignedMoreButton]}
                            onPress={toggleExpanded}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.moreButtonText}>
                                {expanded ? "Show less" : "Show more"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

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

                {/* Always render reaction container at the bottom right */}
                <View style={styles.reactionsContainer}>
                    {/* Camera icon - Human Reaction */}
                    {isUserAuthenticated && (
                        <TouchableOpacity
                            style={[styles.reactionButton, showHumanReaction && additionalStyles.activeButton]}
                            onPress={() => setShowHumanReaction(prev => !prev)}
                        >
                            <MaterialIcons name="camera-alt" size={18} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {/* Type icon */}
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

                    {/* Only show emoji button if user is authenticated */}
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

// Updated styles for the new layout
const updatedStyles = StyleSheet.create({
    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // marginTop: 18,
    },
    viewReactionsButton: {
        top: 40,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
    },
    profileOnlyButton: {
        top: 40,
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
    alignedMoreButton: {
        marginLeft: 'auto', // Push to the right
    },
});

export default TextResponse;