import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Friend {
    id: string;
    name: string;
    username: string;
    profilePic: string;
    stories: Story[]; // ✅ FIXED: Changed from 'story' to 'stories' array to match FriendsGlimpse
    lastSeen: string;
    isOnline: boolean;
}

interface Story {
    id: string;
    type: 'image' | 'video';
    url: string;
    uploadedTime: string;
    timestamp: number;
    duration: number;
}

interface FloatingProfileProps {
    currentFriend: Friend;
    position: number;
    onPress: () => void;
}

const FloatingProfile: React.FC<FloatingProfileProps> = ({
    currentFriend,
    position,
    onPress
}) => {
    return (
        <View style={[
            styles.floatingActiveProfile,
            {
                left: position,
                top: 15,
            }
        ]}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.floatingProfileCircle}>
                    <Image
                        source={{ uri: currentFriend.profilePic }}
                        style={styles.floatingProfileImage}
                    />
                    {currentFriend.isOnline && <View style={styles.floatingOnlineBadge} />}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingActiveProfile: {
        position: 'absolute',
        zIndex: 99999,
    },
    floatingProfileCircle: {
        width: 58,
        height: 58,
        borderRadius: 29,
        padding: 3,
        backgroundColor: '#FF3040',
        elevation: 20,
        shadowColor: '#FF3040',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        borderWidth: 3,
        borderColor: 'rgba(255, 48, 64, 0.8)',
    },
    floatingProfileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 23,
    },
    floatingOnlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#000',
    },
});

export default FloatingProfile;
