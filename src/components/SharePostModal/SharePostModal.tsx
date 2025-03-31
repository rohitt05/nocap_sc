import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Share, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareModalProps {
    isVisible: boolean;
    onClose: () => void;
    postId: string;
    postType: string;
}

const SharePostModal: React.FC<ShareModalProps> = ({
    isVisible,
    onClose,
    postId,
    postType
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

    const handleShare = async () => {
        try {
            // Construct a simple share message
            let message = "Check out NoCap!";
            let url = "https://nocap-app.com"; // Replace with your actual app URL

            const result = await Share.share({
                message: message,
                url: url,
                title: 'Share NoCap'
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                    console.log(`Shared via ${result.activityType}`);
                } else {
                    // shared
                    console.log('Shared successfully');
                }
                // Close modal after successful share
                onClose();
            } else if (result.action === Share.dismissedAction) {
                // dismissed
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error(error.message);
        }
    };


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
                        <Text style={styles.modalTitle}>Share Options</Text>
                    </View>

                    {/* Share option */}
                    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="share-social" size={24} color="#fff" />
                        </View>
                        <Text style={styles.actionButtonText}>Share Post</Text>
                    </TouchableOpacity>
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
        borderBottomWidth: 0.5,
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
    }
});

export default SharePostModal;