import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { toByteArray } from 'base64-js';
import { supabase } from '../../../../../lib/supabase'; // Adjust path as needed

export const dismissKeyboard = (Keyboard) => {
    Keyboard.dismiss();
};

export const pickImage = async (setUploading, uploadAvatarBase64) => {
    try {
        // Request permissions first
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please allow access to your photo library to change your profile picture.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];

            // Check if we have a valid URI and base64 data
            if (asset.uri && asset.base64) {
                setUploading(true);
                await uploadAvatarBase64(asset.base64, asset.uri.split('.').pop() || 'jpg');
            } else {
                Alert.alert('Error', 'Could not process the selected image');
            }
        }
    } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Error', 'Failed to select image');
    } finally {
        setUploading(false);
    }
};

export const uploadAvatarBase64 = async (base64Data, fileExt, setAvatarUrl) => {
    try {
        // Get the current user session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error('No active session');
        }

        const userId = session.user.id;
        const fileName = `${userId.replace(/-/g, '')}-${Date.now()}.${fileExt}`;
        const filePath = `user_${userId}/${fileName}`;

        // Convert base64 to Uint8Array
        const binaryData = toByteArray(base64Data);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('response_bucket')
            .upload(filePath, binaryData, {
                contentType: `image/${fileExt}`,
                upsert: true
            });

        if (error) {
            console.error('Storage upload error:', error);
            throw error;
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
            .from('response_bucket')
            .getPublicUrl(filePath);

        if (urlData && urlData.publicUrl) {
            setAvatarUrl(urlData.publicUrl);
        } else {
            throw new Error('Failed to get public URL');
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
        Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
    }
};

export const validateFields = (fullName, username) => {
    if (!fullName.trim()) {
        Alert.alert('Error', 'Name cannot be empty');
        return false;
    }
    if (!username.trim()) {
        Alert.alert('Error', 'Username cannot be empty');
        return false;
    }
    return true;
};

export const saveProfile = async (
    fullName,
    username,
    bio,
    avatarUrl,
    setUploading,
    validateFields,
    refreshUserData,
    onClose
) => {
    if (!validateFields(fullName, username)) return;

    try {
        setUploading(true);

        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            throw new Error('Session not found');
        }

        const userId = session.user.id;

        // Update profile in the database
        const { error } = await supabase
            .from('users')
            .update({
                full_name: fullName,
                username: username,
                bio: bio,
                avatar_url: avatarUrl
            })
            .eq('id', userId);

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                Alert.alert('Error', 'Username is already taken');
            } else {
                throw error;
            }
        } else {
            Alert.alert('Success', 'Profile updated successfully');
            refreshUserData();
            onClose();
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile: ' + error.message);
    } finally {
        setUploading(false);
    }
};