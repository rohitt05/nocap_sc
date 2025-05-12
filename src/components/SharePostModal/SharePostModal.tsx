import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Share, PanResponder, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReportResponse, ReportReason } from '../../../API/useReportResponse';
import { useResponseDelete } from '../../../API/useResponseDelete';
import ReportModal from './ReportModal';
import { supabase } from '../../../lib/supabase'; // Adjust the import path as needed

interface ShareModalProps {
    isVisible: boolean;
    onClose: () => void;
    postId: string;
    postType: string;
    userId?: string; // User ID of the post owner
    onDelete?: () => void; // Optional callback after successful deletion
}

const SharePostModal: React.FC<ShareModalProps> = ({
    isVisible,
    onClose,
    postId,
    postType,
    userId,
    onDelete
}) => {
    const { reportResponse, isLoading: isReportLoading } = useReportResponse();
    const { deleteResponse, isLoading: isDeleteLoading } = useResponseDelete();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [isUserOwner, setIsUserOwner] = useState(false);

    // Fetch the current user and check ownership when modal becomes visible
    useEffect(() => {
        const checkOwnership = async () => {
            if (!isVisible || !postId) return;

            try {
                // Get current user
                const { data: sessionData } = await supabase.auth.getSession();
                const userId = sessionData?.session?.user?.id;

                if (!userId) {
                    setIsUserOwner(false);
                    return;
                }

                setCurrentUserId(userId);

                // Get the response to check ownership
                const { data: responseData, error } = await supabase
                    .from('responses')
                    .select('user_id')
                    .eq('id', postId)
                    .single();

                if (error) {
                    console.error("Error checking response ownership:", error);
                    setIsUserOwner(false);
                    return;
                }

                setIsUserOwner(responseData?.user_id === userId);
            } catch (error) {
                console.error("Error in checkOwnership:", error);
                setIsUserOwner(false);
            }
        };

        checkOwnership();
    }, [isVisible, postId]);

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

    const handleDeletePress = async () => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const success = await deleteResponse({ responseId: postId });
                        if (success) {
                            onClose();
                            if (onDelete) onDelete();
                        } else {
                            Alert.alert("Error", "Failed to delete post. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const handleReportPress = () => {
        setReportModalVisible(true);
    };

    const handleReportClose = () => {
        setReportModalVisible(false);
    };

    const handleReportSubmit = async (reason: ReportReason, details: string) => {
        await reportResponse({
            responseId: postId,
            reason,
            details
        });
        setReportModalVisible(false);
        onClose(); // Close the main modal after reporting
    };

    return (
        <>
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

                        {/* Delete option - only shown if user is the owner */}
                        {isUserOwner && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleDeletePress}
                                disabled={isDeleteLoading}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name="trash" size={24} color="#ff4040" />
                                </View>
                                <Text style={[styles.actionButtonText, { color: '#ff4040' }]}>
                                    {isDeleteLoading ? 'Deleting...' : 'Delete Post'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Report option */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleReportPress}
                            disabled={isReportLoading}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="flag" size={24} color="#ff4040" />
                            </View>
                            <Text style={[styles.actionButtonText, { color: '#ff4040' }]}>
                                {isReportLoading ? 'Submitting Report...' : 'Report Post'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Custom Report Modal */}
            <ReportModal
                isVisible={reportModalVisible}
                onClose={handleReportClose}
                onSubmit={handleReportSubmit}
                isLoading={isReportLoading}
            />
        </>
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