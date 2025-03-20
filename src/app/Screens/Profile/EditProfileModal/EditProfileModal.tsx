import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const EditProfileModal = ({ visible, onClose, userData }) => {
    const [name, setName] = useState(userData.name);
    const [bio, setBio] = useState(userData.bio);
    const [profileImage, setProfileImage] = useState(userData.profilePicture);

    const handleSave = () => {
        // Here you would typically update the userData
        // For now we'll just close the modal
        onClose();
    };

    // Close keyboard when tapping outside of text inputs
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={handleSave}>
                                <Text style={styles.saveButton}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Profile Image Section */}
                        <View style={styles.profileImageSection}>
                            <Image
                                source={{ uri: profileImage }}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity
                                style={styles.editImageButton}
                                onPress={() => {
                                    // Logic to choose a new image would go here
                                }}
                            >
                                <Feather name="camera" size={22} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formSection}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput
                                style={[styles.textInput, styles.bioInput]}
                                value={bio}
                                onChangeText={setBio}
                                multiline
                                numberOfLines={4}
                                placeholderTextColor="#666"
                            />
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        flex: 1,
        backgroundColor: '#111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: 50,
        padding: 0,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        color: '#3897f0',
        fontSize: 16,
        fontWeight: '600',
    },
    profileImageSection: {
        alignItems: 'center',
        marginVertical: 20,
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editImageButton: {
        position: 'absolute',
        right: '32%',
        bottom: 0,
        backgroundColor: '#3897f0',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formSection: {
        paddingHorizontal: 15,
    },
    inputLabel: {
        color: 'white',
        fontSize: 16,
        marginBottom: 5,
        marginTop: 15,
    },
    textInput: {
        backgroundColor: '#222',
        color: 'white',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
});

export default EditProfileModal;