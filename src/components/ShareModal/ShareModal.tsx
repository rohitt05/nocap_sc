import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Share, Platform } from 'react-native';
import React from 'react';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

const ShareModal = ({ visible, onClose }) => {
    // Function to handle native sharing - now simplified to use the device's default share sheet
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

    // Function for sharing a file
    const shareFile = async () => {
        try {
            // For actual file sharing, you would need to have the file URL or path
            // This is a simplified example that just opens the share dialog
            const result = await Share.share({
                title: 'BeReal.mp4',
                message: 'Check out this video from NoCap!',
                // url: fileUrl // You would need the actual file URL here
            });

            if (result.action === Share.sharedAction) {
                onClose();
            }
        } catch (error) {
            console.error('Error sharing file:', error.message);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Modal pull indicator - now at the top */}
                    <View style={styles.modalCloseBar}>
                        <View style={styles.closeBarIndicator} />
                    </View>

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sharing 1 file</Text>
                    </View>

                    <TouchableOpacity style={styles.fileContainer} onPress={shareFile}>
                        <Ionicons name="document-outline" size={24} color="#555" />
                        <Text style={styles.fileName}>BeReal.mp4</Text>
                        <MaterialCommunityIcons name="share" size={22} color="#555" style={styles.shareIcon} />
                    </TouchableOpacity>

                    <View style={styles.shareOptionsContainer}>
                        <Text style={styles.sectionTitle}>Recent contacts</Text>
                        <View style={styles.shareOptionsRow}>
                            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                                <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                                    <Image
                                        source={require('../../../assets/hattori.webp')}
                                        style={styles.contactImage}
                                    />
                                </View>
                                <Text style={styles.shareOptionText}>Shiv Yoga{'\n'}Kendra SNU</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                                <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                                    <Image
                                        source={require('../../../assets/hattori.webp')}
                                        style={styles.contactImage}
                                    />
                                </View>
                                <Text style={styles.shareOptionText}>Airtel{'\n'}Finance</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                                <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                                    <Image
                                        source={require('../../../assets/hattori.webp')}
                                        style={styles.contactImage}
                                    />
                                </View>
                                <Text style={styles.shareOptionText}>Canara Bank</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Share to</Text>
                        <View style={styles.shareOptionsRow}>
                            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                                <View style={[styles.shareIconCircle, { backgroundColor: '#4285F4' }]}>
                                    <Ionicons name="sync" size={24} color="white" />
                                </View>
                                <Text style={styles.shareOptionText}>Quick Share</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                                <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                                    <FontAwesome name="whatsapp" size={24} color="white" />
                                </View>
                                <Text style={styles.shareOptionText}>WhatsApp</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                                <View style={[styles.shareIconCircle, { backgroundColor: '#4285F4' }]}>
                                    <Ionicons name="images" size={24} color="white" />
                                </View>
                                <Text style={styles.shareOptionText}>Photos</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                                <View style={[styles.shareIconCircle, { backgroundColor: '#E1306C' }]}>
                                    <Ionicons name="logo-instagram" size={24} color="white" />
                                </View>
                                <Text style={styles.shareOptionText}>Instagram{'\n'}Feed</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                                <View style={[styles.shareIconCircle, { backgroundColor: '#0077B5' }]}>
                                    <Ionicons name="logo-linkedin" size={24} color="white" />
                                </View>
                                <Text style={styles.shareOptionText}>LinkedIn</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.moreAppsButton}
                            onPress={handleShare}
                        >
                            <Text style={styles.moreAppsText}>More apps</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#f0f0f0',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30,
    },
    modalHeader: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    fileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6e6e6',
        padding: 15,
        borderRadius: 10,
        marginBottom: 25,
    },
    fileName: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    shareIcon: {
        marginLeft: 10,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 12,
        fontWeight: '500',
    },
    shareOptionsContainer: {
        marginBottom: 20,
    },
    shareOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    shareOption: {
        alignItems: 'center',
        width: 70,
    },
    shareIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        overflow: 'hidden',
    },
    contactImage: {
        width: 50,
        height: 50,
    },
    shareOptionText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#333',
    },
    moreAppsButton: {
        backgroundColor: '#e6e6e6',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
    },
    moreAppsText: {
        fontSize: 16,
        color: '#555',
        fontWeight: '500',
    },
    modalCloseBar: {
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    closeBarIndicator: {
        width: 50,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 3,
    },
});

export default ShareModal;