import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ResponseItemProps } from '../../types';
import { Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { Link } from 'expo-router';
import ReactionPicker from '../ReactionPicker';
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

    // Toggle expanded state
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    // Handle reaction selection from the picker
    const handleReactionSelected = (reactionType: string) => {
        // Just a simple callback - we don't need to refresh reactions anymore
        console.log(`Reaction ${reactionType} was selected`);
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
                            />
                        </TouchableOpacity>
                    </Link>
                    <View style={styles.headerInfo}>
                        <Link href={`/Screens/user/users?id=${item.user.id}}`} asChild>
                            <TouchableOpacity>
                                <Text style={styles.username}>{item.user.username}</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

                {/* Header right section with timestamp and menu dots */}
                <View style={styles.headerRight}>
                    <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                    <TouchableOpacity style={styles.menuDotsContainer}>
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

                {/* Only render the Show more/less button if needed */}
                {needsExpansion && (
                    <TouchableOpacity
                        style={styles.moreButton}
                        onPress={toggleExpanded}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.moreButtonText}>
                            {expanded ? "Show less" : "Show more"}
                        </Text>
                    </TouchableOpacity>
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
                    {/* Reply icon */}
                    <Feather name="send" size={18} color="#fff" style={styles.sendIcon} />

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

export default TextResponse;