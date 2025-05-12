// FriendResponseNotification.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FriendResponseNotification as FriendResponseNotificationType } from '../utils/types';
import { formatTimestamp, getFriendResponseText, getContentTypeEmoji } from '../utils/formatters';
import { styles } from '../styles';

interface FriendResponseNotificationProps {
    notification: FriendResponseNotificationType;
    onPress: (responseId: string) => void;
}

const FriendResponseNotification: React.FC<FriendResponseNotificationProps> = ({
    notification,
    onPress
}) => {
    const avatarSource = notification.avatar_url
        ? { uri: notification.avatar_url }
        : require('../../../../../assets/hattori.webp');

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
                        {getFriendResponseText(notification)}
                    </Text>
                </View>
            </View>
            <View style={styles.rightSection}>
                <Text style={styles.timestamp}>{formatTimestamp(notification.created_at)}</Text>
                <Text style={styles.reactionEmoji}>
                    {getContentTypeEmoji(notification.content_type)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default FriendResponseNotification;