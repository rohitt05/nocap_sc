import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Pressable,
    Modal,
    Dimensions
} from 'react-native';
import { Entypo, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { addReaction, getReactions } from '../../../../../API/addReactions';
import { supabase } from '../../../../../lib/supabase';

interface ReactionPickerProps {
    responseId: string;
    onReactionAdded?: () => void;
}

const ReactionPicker: React.FC<ReactionPickerProps> = ({ responseId, onReactionAdded }) => {
    // States
    const [showPicker, setShowPicker] = useState(false);
    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [reactionCounts, setReactionCounts] = useState<{ [key: string]: number }>({});
    const [isLongPressing, setIsLongPressing] = useState(false);
    const [loadingReaction, setLoadingReaction] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [pickerPosition, setPickerPosition] = useState({x: 0, y: 0});
    const [buttonLayout, setButtonLayout] = useState({width: 0, height: 0});

    // Animation value for reaction bar
    const slideAnim = new Animated.Value(0);

    // Available reaction types
    const reactions = [
        { type: 'fire', icon: '🔥', name: 'Fire' },
        { type: 'skull', icon: '💀', name: 'Skull' },
        { type: 'crying', icon: '😭', name: 'Crying' },
        { type: 'heart', icon: '❤️', name: 'Heart' },
        { type: 'poop', icon: '💩', name: 'Poop' },
        { type: 'alien', icon: '👽', name: 'Alien' },
    ];

    // Get current user when component mounts
    useEffect(() => {
        const getCurrentUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setCurrentUserId(data.user.id);
            }
        };
        getCurrentUser();
    }, []);

    // Fetch initial reactions when component mounts
    useEffect(() => {
        fetchReactions();
    }, [responseId, currentUserId]);

    // Animation for showing/hiding reaction picker
    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: showPicker ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showPicker]);

    // Function to fetch reactions for this response
    const fetchReactions = async () => {
        if (!responseId) return;

        const result = await getReactions(responseId);
        if (result.success && result.data) {
            // Count reactions by type
            const counts = {};
            // Check if the current user has reacted
            let userReaction = null;

            result.data.forEach(reaction => {
                if (!counts[reaction.reaction_type]) {
                    counts[reaction.reaction_type] = 0;
                }
                counts[reaction.reaction_type]++;

                // Check if this reaction belongs to the current user
                if (currentUserId && reaction.user_id === currentUserId) {
                    userReaction = reaction.reaction_type;
                }
            });

            setReactionCounts(counts);
            setSelectedReaction(userReaction);
        }
    };

    // Handle long press to show reaction picker
    const handleLongPress = () => {
        setIsLongPressing(true);
        setShowPicker(true);
    };

    // Handle press release
    const handlePressOut = () => {
        setIsLongPressing(false);
        // Keep picker open for a bit after release
        if (showPicker) {
            setTimeout(() => {
                if (!isLongPressing) {
                    setShowPicker(false);
                }
            }, 500);
        }
    };

    // Handle reaction selection
    const handleReactionSelect = async (reactionType: string) => {
        if (!currentUserId) {
            console.log("User not authenticated");
            return;
        }

        setLoadingReaction(true);
        setShowPicker(false);

        // If selecting the same reaction, toggle it off
        const newReaction = selectedReaction === reactionType ? null : reactionType;

        const result = await addReaction({
            response_id: responseId,
            reaction_type: reactionType
            // user_id is now handled inside addReaction function
        });

        if (result.success) {
            setSelectedReaction(newReaction);
            // Update local counts for immediate feedback
            fetchReactions();
            if (onReactionAdded) onReactionAdded();
        } else {
            console.error("Reaction failed:", result.error);
        }

        setLoadingReaction(false);
    };

    // Quick tap to add/remove the most prominent reaction (fire)
    const handleQuickReaction = async () => {
        if (loadingReaction || !currentUserId) return;

        const defaultReaction = 'fire';
        await handleReactionSelect(
            selectedReaction === defaultReaction ? null : defaultReaction
        );
    };

    // Measure button layout to position the picker properly
    const measureButtonLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        setButtonLayout({ width, height });
    };

    return (
        <View style={styles.container}>
            {/* Currently selected reaction or default fire button */}
            <TouchableOpacity
                onPress={handleQuickReaction}
                onLongPress={handleLongPress}
                onPressOut={handlePressOut}
                delayLongPress={300}
                onLayout={measureButtonLayout}
                style={styles.mainReactionButton}
                disabled={loadingReaction || !currentUserId}
            >
                <Text style={styles.reactionIcon}>
                    {selectedReaction ?
                        reactions.find(r => r.type === selectedReaction)?.icon :
                        reactions[0].icon}
                </Text>
                {reactionCounts[selectedReaction || 'fire'] > 0 && (
                    <Text style={styles.reactionCount}>
                        {reactionCounts[selectedReaction || 'fire']}
                    </Text>
                )}
            </TouchableOpacity>

            {/* Reaction picker that appears on long press */}
            {showPicker && (
                <Animated.View
                    style={[
                        styles.reactionBar,
                        {
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                            opacity: slideAnim,
                        },
                    ]}
                >
                    {reactions.map((reaction) => (
                        <TouchableOpacity
                            key={reaction.type}
                            style={[
                                styles.reactionOption,
                                selectedReaction === reaction.type && styles.selectedReaction,
                            ]}
                            onPress={() => handleReactionSelect(reaction.type)}
                        >
                            <Text style={styles.reactionOptionIcon}>{reaction.icon}</Text>
                            {reactionCounts[reaction.type] > 0 && (
                                <Text style={styles.miniCount}>{reactionCounts[reaction.type]}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginVertical: 8,
        alignItems: 'flex-start', // Align to the left
        zIndex: 100, // Ensure this renders above other elements
        width: '100%', // Take full width to ensure proper positioning
    },
    mainReactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    reactionIcon: {
        fontSize: 18,
        marginRight: 4,
    },
    reactionCount: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    reactionBar: {
        position: 'absolute',
        bottom: 45, // Position above the main button
        left: 0, // Start from the left edge
        flexDirection: 'row',
        backgroundColor: '#1e1e1e',
        borderRadius: 30,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000, // Very high to ensure it's on top
    },
    reactionOption: {
        marginHorizontal: 6,
        padding: 6,
        borderRadius: 20,
    },
    selectedReaction: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    reactionOptionIcon: {
        fontSize: 22,
    },
    miniCount: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#007AFF',
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        borderRadius: 10,
        width: 16,
        height: 16,
        textAlign: 'center',
        lineHeight: 16,
        overflow: 'hidden',
    },
});

export default ReactionPicker;