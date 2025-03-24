import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    PanResponder
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import {
    dismissKeyboard,
    pickImage,
    uploadAvatarBase64,
    validateFields,
    saveProfile
} from './profileUtils'; // Adjust path if needed

const EditProfileModal = ({ visible, onClose, userData, refreshUserData }) => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (visible && userData) {
            setFullName(userData.full_name || '');
            setUsername(userData.username || '');
            setBio(userData.bio || '');
            setAvatarUrl(userData.avatar_url || 'https://via.placeholder.com/150');
        }
    }, [visible, userData]);

    // Create a PanResponder for swipe down to close
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return gestureState.dy > 20;
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 50) {
                onClose();
            }
        },
    });

    const handleDismissKeyboard = () => dismissKeyboard(Keyboard);

    const handlePickImage = async () => {
        await pickImage(setUploading, (base64Data, fileExt) =>
            uploadAvatarBase64(base64Data, fileExt, setAvatarUrl)
        );
    };

    const handleSaveProfile = async () => {
        await saveProfile(
            fullName,
            username,
            bio,
            avatarUrl,
            setUploading,
            validateFields,
            refreshUserData,
            onClose
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
                <View style={styles.centeredView}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.keyboardAvoidingContainer}
                    >
                        <View {...panResponder.panHandlers} style={styles.modalView}>
                            {/* Swipe indicator at the top of modal */}
                            <View style={styles.swipeIndicator} />

                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit Profile</Text>
                                <TouchableOpacity
                                    style={styles.saveButtonContainer}
                                    onPress={onClose}
                                    disabled={uploading}
                                >
                                    <Text style={[styles.saveButton, uploading && styles.disabledButton]}>
                                        {uploading ? 'Saving...' : 'Save'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={styles.scrollContainer}>
                                {/* Profile Image Section */}
                                <View style={styles.profileImageSection}>
                                    {uploading && (
                                        <View style={styles.loadingOverlay}>
                                            <ActivityIndicator size="large" color="#3897f0" />
                                        </View>
                                    )}
                                    <View style={styles.profileImageContainer}>
                                        <Image
                                            source={{ uri: avatarUrl }}
                                            style={styles.profileImage}
                                            onError={() => setAvatarUrl('https://via.placeholder.com/150')}
                                        />
                                        <TouchableOpacity
                                            style={styles.editImageButton}
                                            onPress={handlePickImage}
                                            disabled={uploading}
                                        >
                                            <Entypo name="plus" size={16} color="black" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.changePhotoText}>Change profile photo</Text>
                                </View>

                                {/* Form Fields */}
                                <View style={styles.formSection}>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Full Name</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={fullName}
                                            onChangeText={setFullName}
                                            placeholderTextColor="#666"
                                            placeholder="Your full name"
                                            editable={!uploading}
                                        />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Username</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={username}
                                            onChangeText={setUsername}
                                            placeholderTextColor="#666"
                                            placeholder="Your username"
                                            editable={!uploading}
                                        />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Bio</Text>
                                        <TextInput
                                            style={[styles.textInput, styles.bioInput]}
                                            value={bio}
                                            onChangeText={setBio}
                                            multiline
                                            numberOfLines={4}
                                            placeholderTextColor="#666"
                                            placeholder="Tell us about yourself"
                                            editable={!uploading}
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    keyboardAvoidingContainer: {
        width: '100%',
        height: '90%',
    },
    modalView: {
        backgroundColor: '#000',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: '100%',
        padding: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    swipeIndicator: {
        width: 40,
        height: 5,
        backgroundColor: '#666',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 0.5,
        borderBottomColor: '#222',
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        paddingLeft: 5,
    },
    saveButtonContainer: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    saveButton: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        color: '#666',
    },
    profileImageSection: {
        alignItems: 'center',
        marginVertical: 25,
        position: 'relative',
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: '#000',
    },
    editImageButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    changePhotoText: {
        color: '#fff',
        fontSize: 14,
        marginTop: 8,
        fontWeight: '500',
    },
    formSection: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#999',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: '#111',
        color: 'white',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#222',
    },
    bioInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 10,
        borderRadius: 55,
        width: 110,
        height: 110,
    }
});

export default EditProfileModal;