// components/responses/ReactionsList.tsx
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Reaction } from '../types';

interface ReactionsListProps {
    reactions: Reaction[];
}

const ReactionsList: React.FC<ReactionsListProps> = ({ reactions }) => {
    if (!reactions || reactions.length === 0) {
        return null;
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reactionsContainer}>
            {reactions.map((reaction, index) => (
                <View key={index} style={styles.reaction}>
                    <Image
                        source={{ uri: reaction.profile_picture_url }}
                        style={styles.reactionProfilePic}
                    />
                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    reactionsContainer: {
        marginTop: 8,
        flexDirection: 'row',
    },
    reaction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 15,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
    },
    reactionProfilePic: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 4,
    },
    reactionEmoji: {
        fontSize: 14,
    },
});

export default ReactionsList;