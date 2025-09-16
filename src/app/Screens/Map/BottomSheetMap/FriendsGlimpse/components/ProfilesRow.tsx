import React from 'react';
import { View, ScrollView, Image, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Story {
    id: string;
    type: 'image' | 'video';
    url: string;
    uploadedTime: string;
    timestamp: number;
    duration: number;
}

interface Friend {
    id: string;
    name: string;
    username: string;
    profilePic: string;
    stories: Story[];
    lastSeen: string;
    isOnline: boolean;
}

interface ProfilesRowProps {
    friends: Friend[];
    currentUserIndex: number;
    onProfilePress: (index: number) => void;
    onScroll: (event: any) => void;
    scrollRef: React.RefObject<ScrollView>;
    getExtraPadding: () => number;
}

const ProfilesRow: React.FC<ProfilesRowProps> = ({
    friends,
    currentUserIndex,
    onProfilePress,
    onScroll,
    scrollRef,
    getExtraPadding
}) => {
    return (
        <View style={styles.profilesRow}>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    styles.profilesContent,
                    { paddingRight: 16 + getExtraPadding() }
                ]}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                {friends.map((friend, index) => (
                    <View key={friend.id} style={styles.profileItemWrapper}>
                        <TouchableOpacity
                            style={styles.profileItem}
                            onPress={() => onProfilePress(index)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.profileCircle,
                                index === currentUserIndex && styles.hiddenProfile
                            ]}>
                                {index !== currentUserIndex && (
                                    <>
                                        <Image
                                            source={{ uri: friend.profilePic }}
                                            style={styles.profileImage}
                                        />
                                        {friend.isOnline && <View style={styles.onlineBadge} />}
                                        
                                        {/* Story count indicator */}
                                        {friend.stories.length > 1 && (
                                            <View style={styles.storyCountBadge}>
                                                <Text style={styles.storyCountText}>{friend.stories.length}</Text>
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                ))}
                
                <View style={styles.endOfInternetContainer}>
                    <Text style={styles.endOfInternetText}>End of glimpses</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    profilesRow: {
        height: 50,
        backgroundColor: '#000',
        paddingVertical: 0,
    },
    profilesContent: {
        paddingHorizontal: 16,
        alignItems: 'center',
        paddingTop: 5,
    },
    profileItemWrapper: {
        marginHorizontal: 5,
    },
    profileItem: {
        alignItems: 'center',
    },
    profileCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        padding: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
        position: 'relative',
    },
    hiddenProfile: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#000',
    },
    storyCountBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#FF3040',
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyCountText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
    endOfInternetContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 5,
        marginLeft: 15,
    },
    endOfInternetText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 11,
        fontStyle: 'italic',
        textAlign: 'center',
        fontWeight: '300',
    },
});

export default ProfilesRow;
