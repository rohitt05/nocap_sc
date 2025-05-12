import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBlockUserAccount } from '../../../../../API/useBlockUsersAccount';

interface BlockUserProps {
    userId: string;
    username: string;
    onActionComplete?: () => void;
}

const BlockUser: React.FC<BlockUserProps> = ({ userId, username, onActionComplete }) => {
    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);

    const {
        blockUser,
        unblockUser,
        checkIsBlocked,
        isBlocking,
        isUnblocking
    } = useBlockUserAccount({
        onSuccess: () => {
            setIsBlocked(prev => !prev);
            if (isBlocked) {
                Alert.alert('Success', `${username} has been unblocked.`);
            } else {
                Alert.alert('Success', `${username} has been blocked and removed from your friends list if they were a friend.`);
            }
            if (onActionComplete) onActionComplete();
        },
        onError: (error) => {
            Alert.alert('Error', error.message || 'Something went wrong');
        }
    });

    useEffect(() => {
        const checkBlockStatus = async () => {
            try {
                setIsChecking(true);
                const blocked = await checkIsBlocked(userId);
                setIsBlocked(blocked);
            } catch (error) {
                console.error('Error checking block status:', error);
            } finally {
                setIsChecking(false);
            }
        };

        checkBlockStatus();
    }, [userId, checkIsBlocked]);

    const handleToggleBlock = useCallback(() => {
        if (isBlocked) {
            Alert.alert(
                'Unblock User',
                `Are you sure you want to unblock ${username}?`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'Unblock',
                        onPress: async () => {
                            await unblockUser(userId);
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                'Block User',
                `Are you sure you want to block ${username}? This will also remove them from your friends list if they are currently your friend. You won't see their content and they won't be able to interact with you.`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'Block',
                        style: 'destructive',
                        onPress: async () => {
                            await blockUser(userId);
                        }
                    }
                ]
            );
        }
    }, [isBlocked, username, userId, blockUser, unblockUser]);

    if (isChecking) {
        return (
            <View style={styles.actionButton}>
                <View style={styles.iconContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                </View>
                <Text style={styles.actionButtonText}>Loading...</Text>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleBlock}
            disabled={isBlocking || isUnblocking}
        >
            <View style={styles.iconContainer}>
                {isBlocking || isUnblocking ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Ionicons
                        name={isBlocked ? "lock-open" : "lock-closed"}
                        size={24}
                        color={isBlocked ? "#4d94ff" : "#ff4d4d"}
                    />
                )}
            </View>
            <Text style={[
                styles.actionButtonText,
                isBlocked ? styles.unblockText : styles.blockText
            ]}>
                {isBlocked ? "Unblock User" : "Block User"}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 5,
        borderBottomWidth: 0.4,
        borderBottomColor: '#333'
    },
    iconContainer: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        marginLeft: 15,
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF'
    },
    blockText: {
        color: '#ff4d4d'  // Red color for block option
    },
    unblockText: {
        color: '#4d94ff'  // Blue color for unblock option
    }
});

export default BlockUser;