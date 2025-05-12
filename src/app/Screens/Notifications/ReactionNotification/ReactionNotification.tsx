// ReactionNotification.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ReactionNotification as ReactionNotificationType } from '../utils/types';
import { formatTimestamp, getReactionText, getReactionImage, getEmoji } from '../utils/formatters';
import { styles } from '../styles';

interface ReactionNotificationProps {
    notification: ReactionNotificationType;
    onPress: (responseId: string) => void;
}

const ReactionNotification: React.FC<ReactionNotificationProps> = ({
    notification,
    onPress
}) => {
    const avatarSource = notification.avatar_url
        ? { uri: notification.avatar_url }
        : require('../../../../../assets/hattori.webp');

    const reactionImage = getReactionImage(notification.reaction_type);

    return (
        <TouchableOpacity
            style={styles.notificationItem}
            onPress={() => onPress(notification.response_id)}
        >
            <View style={styles.leftSection}>
                <Image
                    source={avatarSource}
                    style={styles.avatar}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.fullName}>{notification.full_name}</Text>
                    <Text style={styles.notificationText}>
                        {getReactionText(notification)}
                    </Text>
                </View>
            </View>
            <View style={styles.rightSection}>
                <Text style={styles.timestamp}>{formatTimestamp(notification.created_at)}</Text>
                {reactionImage ? (
                    <Image
                        source={reactionImage}
                        style={styles.reactionTextImage}
                        resizeMode="contain"
                    />
                ) : (
                    <Text style={[styles.reactionEmoji, { width: 40, height: 40, textAlign: 'center', textAlignVertical: 'center' }]}>
                        {getEmoji(notification.reaction_type)}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ReactionNotification;