import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { supabase } from '../../../../../../lib/supabase';

interface ReactionTextsProps {
    responseId: string;
    userId: string;
    isVisible: boolean;
    onClose: () => void;
    onReactionSelected: (reactionType: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ReactionTexts: React.FC<ReactionTextsProps> = ({
    responseId,
    userId,
    isVisible,
    onClose,
    onReactionSelected
}) => {
    // Early return if no userId or responseId
    if (!userId || !responseId) {
        console.log('ReactionTexts: Missing required IDs', { userId, responseId });
        return null;
    }

    const [animation] = useState(new Animated.Value(0));

    // Reaction texts with their corresponding image paths
    const reactionTexts = [
        { type: 'wtf', image: require('../images/wtf.png') },
        { type: 'bruhh', image: require('../images/bruh.png') },
        { type: 'spilled', image: require('../images/spilled.png') },
        { type: 'delulu', image: require('../images/delulu.png') },
        { type: 'sus', image: require('../images/sus.png') },
        { type: "shit’s real", image: require('../images/shit.png') }
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
            console.error('Cannot handle reaction text: missing IDs', { responseId, userId });
            return;
        }

        try {
            // Add new reaction to Supabase
            const { error } = await supabase
                .from('reactions')
                .insert({
                    response_id: responseId,
                    user_id: userId,
                    reaction_type: reactionType
                });

            if (error) {
                // If we still get an error, log it
                console.log('Warning in reaction text handling:', error);
            }

            onReactionSelected(reactionType);
            onClose();
        } catch (error) {
            console.error('Error handling reaction text:', error);
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
        <Animated.View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {reactionTexts.map((reaction) => (
                    <TouchableOpacity
                        key={reaction.type}
                        style={styles.reactionButton}
                        onPress={() => handleReaction(reaction.type)}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={reaction.image}
                            style={styles.reactionImage}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 70,
        left: (SCREEN_WIDTH - (SCREEN_WIDTH * 0.8)) / 2, // Center the container
        width: SCREEN_WIDTH * 0.8, // Reduced width to 80% of screen width
        borderRadius: 20, // Added border radius
        height: 50, // Reduced height
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollViewContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    reactionButton: {
        marginHorizontal: 8,
        padding: 5,
        borderRadius: 15,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reactionImage: {
        top: 6, // Slight adjustment to center image
        width: 70,  // Increased size for better visibility
        height: 70, // Uniform square size
        resizeMode: 'contain', // Ensures image fits within bounds
        transform: [{ scale: 0.9 }], // Slight zoom to make more visible
    },
});

export default ReactionTexts;