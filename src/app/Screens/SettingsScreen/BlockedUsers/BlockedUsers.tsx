import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Image
} from 'react-native';
import { getBlockedUsers, unblockUser, BlockedUser } from '../../../../../API/blockedUsers';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons'; // Import icons for back button

const BlockedUsers: React.FC<{ navigation?: any }> = ({ navigation }) => {
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            setLoading(true);
            const users = await getBlockedUsers();
            setBlockedUsers(users);
            setError(null);
        } catch (err) {
            setError('Failed to load blocked users. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (userId: string) => {
        try {
            await unblockUser(userId);
            // Remove the unblocked user from the state
            setBlockedUsers(prev => prev.filter(user => user.blocked_id !== userId));
        } catch (err) {
            setError('Failed to unblock user. Please try again.');
            console.error(err);
        }
    };

    const goBack = () => {
        if (navigation && navigation.goBack) {
            navigation.goBack();
        }
    };

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't blocked any users yet.</Text>
        </View>
    );

    const renderBlockedUserItem = ({ item }: { item: BlockedUser }) => (
        <View style={styles.userRow}>
            <View style={styles.userInfo}>
                {item.blocked_user.avatar_url ? (
                    <Image
                        source={{ uri: item.blocked_user.avatar_url }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>
                            {item.blocked_user.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.blocked_user.full_name}</Text>
                    <Text style={styles.userHandle}>@{item.blocked_user.username}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.unblockButton}
                onPress={() => handleUnblock(item.blocked_id)}
            >
                <Text style={styles.unblockText}>Unblock</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header with back button and centered title */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <AntDesign name="arrowleft" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Blocked Users</Text>
                <View style={styles.placeholderView} />
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            ) : (
                <FlatList
                    data={blockedUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderBlockedUserItem}
                    ListEmptyComponent={renderEmptyList}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 40,
        marginBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    placeholderView: {
        width: 40, // Same width as back button for balance
    },
    title: {
        fontSize: 20, // Smaller font size (was 24)
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    errorContainer: {
        backgroundColor: '#7F1D1D',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        backgroundColor: '#000000',
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: '#A0A0A0',
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 24,
    },
    userRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#333333',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 20,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    userDetails: {
        marginLeft: 12,
    },
    userName: {
        color: '#FFFFFF',
        fontWeight: '500',
        fontSize: 16,
    },
    userHandle: {
        color: '#A0A0A0',
        fontSize: 14,
    },
    unblockButton: {
        backgroundColor: '#444444',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    unblockText: {
        color: '#FFFFFF',
        fontWeight: '500',
        fontSize: 13,
    },
});

export default BlockedUsers;