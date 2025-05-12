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
import { styles } from './styles'; // Adjust path if needed

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    userData: {
        id: string;
        full_name: string;
        username: string;
        bio: string;
        avatar_url: string;
        email: string;
    };
    refreshUserData: () => Promise<void>;
}

const EditProfileModal = ({ visible, onClose, userData, refreshUserData }: EditProfileModalProps) => {
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
        await pickImage(setUploading, (base64Data: string, fileExt: string) =>
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
                                    onPress={handleSaveProfile}
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

export default EditProfileModal;