// FriendRequestNotification.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FriendRequest } from '../utils/types';
import { formatTimestamp } from '../utils/formatters';
import { styles } from '../styles';

interface FriendRequestNotificationProps {
    notification: FriendRequest;
    isProcessing: boolean;
    onAccept: (requestId: string) => void;
    onDecline: (requestId: string) => void;
}

const FriendRequestNotification: React.FC<FriendRequestNotificationProps> = ({
    notification,
    isProcessing,
    onAccept,
    onDecline
}) => {
    const avatarSource = notification.avatar_url
        ? { uri: notification.avatar_url }
        : require('../../../../../assets/hattori.webp');

    return (
        <View style={styles.notificationItem}>
            <View style={styles.leftSection}>
                <Image
                    source={avatarSource}
                    style={styles.avatar}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.fullName}>{notification.full_name}</Text>
                    <Text style={styles.notificationText}>sent you a friend request</Text>
                </View>
            </View>
            <View style={styles.rightSection}>
                <Text style={styles.timestamp}>{formatTimestamp(notification.created_at)}</Text>
                {isProcessing ? (
                    <ActivityIndicator size="small" color="#0066FF" style={styles.processingIndicator} />
                ) : (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity onPress={() => onDecline(notification.id)}>
                            <Text style={styles.declineButtonText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => onAccept(notification.id)}
                        >
                            <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default FriendRequestNotification;