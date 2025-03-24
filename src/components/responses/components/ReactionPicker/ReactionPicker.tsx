import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { supabase } from '../../../../../lib/supabase'; // Adjust import path as needed
import { styles } from './styles';

interface ReactionPickerProps {
    responseId: string;
    userId: string;
    isVisible: boolean;
    onClose: () => void;
    onReactionSelected: (reactionType: string) => void;
}

const ReactionPicker: React.FC<ReactionPickerProps> = ({
    responseId,
    userId,
    isVisible,
    onClose,
    onReactionSelected
}) => {
    // Early return if no userId or responseId
    if (!userId || !responseId) {
        console.log('ReactionPicker: Missing required IDs', { userId, responseId });
        return null;
    }

    const [animation] = useState(new Animated.Value(0));

    // Available reactions with emojis instead of icons
    const reactions = [
        { type: 'fire', emoji: '🔥' },
        { type: 'skull', emoji: '💀' },
        { type: 'holding-hands', emoji: '🫶🏻' },
        { type: 'crying', emoji: '😭' },
        { type: 'dotted-face', emoji: '🫥' },
        { type: 'tongue', emoji: '👅' }
    ];

    useEffect(() => {
        if (isVisible) {
            Animated.spring(animation, {
                toValue: 1,
                useNativeDriver: true,
                friction: 7,
                tension: 40
            }).start();
        } else {
            Animated.timing(animation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [isVisible, animation]);

    const handleReaction = async (reactionType: string) => {
        // Validate parameters before proceeding
        if (!responseId || !userId) {
            console.error('Cannot handle reaction: missing IDs', { responseId, userId });
            return;
        }

        try {
            // Add new reaction (no need to check for existing reactions)
            const { error } = await supabase
                .from('reactions')
                .insert({
                    response_id: responseId,
                    user_id: userId,
                    reaction_type: reactionType
                });

            if (error) {
                // If we still get an error, log it but don't throw
                console.log('Warning in reaction handling:', error);
            }

            onReactionSelected(reactionType);
            onClose();
        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    };

    const animatedStyle = {
        opacity: animation,
        transform: [
            {
                scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                })
            }
        ]
    };

    if (!isVisible) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.pickerContainer}>
                {reactions.map((reaction) => {
                    return (
                        <TouchableOpacity
                            key={reaction.type}
                            style={styles.reactionButton}
                            onPress={() => handleReaction(reaction.type)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.emojiText}>{reaction.emoji}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </Animated.View>
    );
};


export default ReactionPicker;