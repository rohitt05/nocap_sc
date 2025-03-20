import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import CameraScreen from '../../../CameraScreen'; // Adjust import path as needed
import { styles } from './styles';

// Define the media type
interface MediaInfo {
    uri: string;
    type: 'image' | 'video';
    isFrontFacing: boolean;
}

interface MediaInputProps {
    onMediaSelect?: (mediaFile: { uri: string; type: string }) => void;
}

export default function MediaInput({ onMediaSelect }: MediaInputProps) {
    const [mediaPreview, setMediaPreview] = useState<MediaInfo | null>(null);

    async function saveMediaToGallery() {
        if (!mediaPreview) return;

        try {
            // Ensure we have media library permissions
            const { status } = await MediaLibrary.requestPermissionsAsync();

            if (status !== 'granted') {
                alert('Sorry, we need media library permissions to save the file.');
                return;
            }

            // Save the file to an album named "Nocap"
            const asset = await MediaLibrary.createAssetAsync(mediaPreview.uri);
            await MediaLibrary.createAlbumAsync("Nocap", asset, false);

            alert('Media saved successfully to Nocap album!');
        } catch (error) {
            console.error('Error saving media:', error);
            alert('Failed to save media.');
        }
    }

    function discardPreview() {
        setMediaPreview(null);
    }

    // When media is captured, pass it to the parent component
    function handleMediaCapture(mediaInfo: MediaInfo) {
        setMediaPreview(mediaInfo);

        // Pass the media file to the parent component for uploading
        if (onMediaSelect) {
            onMediaSelect({
                uri: mediaInfo.uri,
                // Determine mime type based on media type
                type: mediaInfo.type === 'image' ? 'image/jpeg' : 'video/mp4'
            });
        }
    }

    // If media is captured, show preview
    if (mediaPreview) {
        return (
            <View style={styles.container}>
                <View style={styles.previewContainer}>
                    {mediaPreview.type === 'image' ? (
                        <Image
                            source={{ uri: mediaPreview.uri }}
                            style={[
                                styles.mediaPreview,
                                mediaPreview.isFrontFacing && styles.mirroredMedia
                            ]}
                            resizeMode="cover"
                        />
                    ) : (
                        <Video
                            source={{ uri: mediaPreview.uri }}
                            style={[
                                styles.mediaPreview,
                                mediaPreview.isFrontFacing && styles.mirroredMedia
                            ]}
                            useNativeControls
                            resizeMode={ResizeMode.COVER}
                            isLooping
                            shouldPlay
                        />
                    )}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={saveMediaToGallery}
                        >
                            <MaterialIcons name="save-alt" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={discardPreview}
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // Default view is the camera
    return (
        <View style={styles.container}>
            <CameraScreen onMediaCapture={handleMediaCapture} />
        </View>
    );
}