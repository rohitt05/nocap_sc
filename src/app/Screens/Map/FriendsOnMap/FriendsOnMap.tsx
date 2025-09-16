import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PointAnnotation } from '@rnmapbox/maps';

interface Friend {
    id: string;
    name: string;
    username: string;
    profile_pic: string;
    current_latitude: number;
    current_longitude: number;
    location_updated_at: string;
    location_sharing_enabled: boolean;
    status: string;
}

interface FriendsOnMapProps {
    friends: Friend[];
    selectedFilter: string;
}

const FriendsOnMap: React.FC<FriendsOnMapProps> = ({ friends, selectedFilter }) => {

    const handleFriendMarkerPress = (friend: Friend): void => {
        const timeDiff = new Date().getTime() - new Date(friend.location_updated_at).getTime();
        const minutesAgo = Math.floor(timeDiff / (1000 * 60));

        console.log(`Pressed marker for ${friend.name}`);
        // You can add Alert here if needed
    };

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    };

    const getFirstName = (fullName: string): string => {
        return fullName.split(' ')[0];
    };

    // Generate a consistent color based on name
    const getAvatarColor = (name: string): string => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        const index = name.length % colors.length;
        return colors[index];
    };

    const renderFriendMarker = (friend: Friend) => {
        return (
            <PointAnnotation
                key={friend.id}
                id={friend.id}
                coordinate={[friend.current_longitude, friend.current_latitude]}
                onSelected={() => handleFriendMarkerPress(friend)}
                anchor={{ x: 0.5, y: 0.5 }}
            >
                <View style={styles.markerContainer}>
                    {/* Profile Avatar */}
                    <View style={styles.avatarContainer}>
                        <View style={[
                            styles.avatar,
                            { backgroundColor: getAvatarColor(friend.name) }
                        ]}>
                            <Text style={styles.avatarText}>
                                {getInitials(friend.name)}
                            </Text>
                        </View>

                        {/* Status indicator */}
                        <View style={styles.statusIndicator} />
                    </View>

                    {/* Name label */}
                    <View style={styles.nameContainer}>
                        <Text style={styles.nameText} numberOfLines={1}>
                            {getFirstName(friend.name)}
                        </Text>
                    </View>
                </View>
            </PointAnnotation>
        );
    };

    // Only render when friends filter is selected
    if (selectedFilter !== 'friends') {
        return null;
    }

    // Filter valid friends
    const validFriends = friends.filter(friend => {
        return friend.location_sharing_enabled &&
            friend.current_latitude &&
            friend.current_longitude &&
            !isNaN(friend.current_latitude) &&
            !isNaN(friend.current_longitude) &&
            Math.abs(friend.current_latitude) <= 90 &&
            Math.abs(friend.current_longitude) <= 180;
    });

    console.log(`Rendering ${validFriends.length} friends on map`);

    return (
        <>
            {validFriends.map(renderFriendMarker)}
        </>
    );
};

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 100,
    },
    avatarContainer: {
        position: 'relative',
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    nameContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        marginTop: 6,
        minWidth: 45,
        maxWidth: 80,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    nameText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default FriendsOnMap;
