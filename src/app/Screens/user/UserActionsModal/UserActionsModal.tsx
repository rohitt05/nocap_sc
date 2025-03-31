import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserActionsModalProps {
    isVisible: boolean;
    onClose: () => void;
    userId: string;
    username: string;
    onUnfriend: () => void;
    isFriend: boolean;
    joinDate: string | null;
}

const UserActionsModal: React.FC<UserActionsModalProps> = ({
    isVisible,
    onClose,
    userId,
    username,
    onUnfriend,
    isFriend,
    joinDate
}) => {
    // Pan responder for swipe down to close
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 20;
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) {
                    onClose();
                }
            }
        })
    ).current;

    const handleUnfriend = useCallback(() => {
        Alert.alert(
            'Unfriend User',
            `Are you sure you want to unfriend ${username}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Unfriend',
                    style: 'destructive',
                    onPress: () => {
                        onUnfriend();
                        onClose();
                    }
                }
            ]
        );
    }, [onUnfriend, onClose, username]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View
                    style={styles.modalContainer}
                    {...panResponder.panHandlers}
                >
                    {/* Modal indicator */}
                    <View style={styles.modalIndicator} />

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{username}</Text>
                    </View>

                    {/* User Info section */}
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="information-circle" size={24} color="#fff" />
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.actionButtonText}>User Info</Text>
                            <Text style={styles.infoText}>
                                Joined on {joinDate || 'Unknown date'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Conditionally render Unfriend option */}
                    {isFriend && (
                        <TouchableOpacity style={styles.actionButton} onPress={handleUnfriend}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="person-remove" size={24} color="#fff" />
                            </View>
                            <Text style={styles.actionButtonText}>Unfriend</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    modalContainer: {
        backgroundColor: '#111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 10
    },
    modalIndicator: {
        width: 40,
        height: 5,
        backgroundColor: '#444',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 15
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 15
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF'
    },
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
    infoContainer: {
        flex: 1,
        marginLeft: 15
    },
    infoText: {
        fontSize: 14,
        color: '#AAAAAA',
        marginTop: 4
    }
});

export default UserActionsModal;