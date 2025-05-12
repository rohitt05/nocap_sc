import React, { useState, useRef } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import CameraScreen from '../../../CameraScreen'; // Adjust import path as needed
import { styles } from './styles';
import MediaOptionsMenu from './MediaOptionsMenu'; // Import the new dropdown component

// Define the media type
interface MediaInfo {
    uri: string;
    type: 'image' | 'video';
    isFrontFacing: boolean;
}

interface MediaInputProps {
    onMediaSelect?: (mediaFile: { uri: string; type: string; caption?: string }) => void;
    isKeyboardVisible?: boolean;
    keyboardHeight?: number;
}
export default function MediaInput({ onMediaSelect, isKeyboardVisible = false, keyboardHeight = 0 }: MediaInputProps) {
    const [mediaPreview, setMediaPreview] = useState<MediaInfo | null>(null);
    const [caption, setCaption] = useState<string>('');
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [showTagFriends, setShowTagFriends] = useState<boolean>(false);
    const [responseId, setResponseId] = useState<string | undefined>(undefined);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);

    // Video player reference
    const videoRef = useRef(null);

    // Define max character limit
    const MAX_CAPTION_LENGTH = 200;

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
        setCaption('');
    }

    // When media is captured, pass it to the parent component along with caption
    function handleMediaCapture(mediaInfo: MediaInfo) {
        setMediaPreview(mediaInfo);

        // Pass the media file to the parent component for uploading
        if (onMediaSelect) {
            onMediaSelect({
                uri: mediaInfo.uri,
                // Determine mime type based on media type
                type: mediaInfo.type === 'image' ? 'image/jpeg' : 'video/mp4',
                caption: caption
            });
        }
    }

    // Update the parent component when caption changes
    const handleCaptionChange = (text: string) => {
        // Limit text to max character length
        if (text.length <= MAX_CAPTION_LENGTH) {
            setCaption(text);

            // If we already have media, update the parent with the new caption
            if (mediaPreview && onMediaSelect) {
                onMediaSelect({
                    uri: mediaPreview.uri,
                    type: mediaPreview.type === 'image' ? 'image/jpeg' : 'video/mp4',
                    caption: text
                });
            }
        }
    };

    // Toggle options menu
    const toggleOptionsMenu = () => {
        setShowOptions(!showOptions);
    };

    // Handle tag friends button press
    const handleTagFriends = () => {
        setShowTagFriends(true);
    };

    // Toggle play/pause for video
    const togglePlayPause = async () => {
        if (videoRef.current) {
            try {
                const status = await videoRef.current.getStatusAsync();
                if (status.isPlaying) {
                    await videoRef.current.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await videoRef.current.playAsync();
                    setIsPlaying(true);
                }
            } catch (error) {
                console.error('Error toggling video playback:', error);
            }
        }
    };

    // If media is captured, show preview
    if (mediaPreview) {
        return (
            <View style={styles.container}>
                {/* Main media preview area */}
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
                        <>
                            <Video
                                ref={videoRef}
                                source={{ uri: mediaPreview.uri }}
                                style={[
                                    styles.mediaPreview,
                                    mediaPreview.isFrontFacing && styles.mirroredMedia
                                ]}
                                resizeMode={ResizeMode.COVER}
                                isLooping
                                shouldPlay
                                useNativeControls={false}
                                onPlaybackStatusUpdate={status => {
                                    if (status.isLoaded) {
                                        setIsPlaying(status.isPlaying);
                                    }
                                }}
                            />

                            {/* Play/Pause Button - only the button is clickable now */}
                            <View style={videoStyles.playPauseButtonContainer}>
                                <TouchableOpacity
                                    style={videoStyles.playPauseButton}
                                    onPress={togglePlayPause}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={32}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Only show action buttons when keyboard is not visible */}
                    {!isKeyboardVisible && (
                        <View style={[styles.buttonContainer, { justifyContent: 'flex-end' }]}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={toggleOptionsMenu}
                            >
                                <MaterialIcons name="more-vert" size={24} color="white" />
                            </TouchableOpacity>

                            {/* Render dropdown menu if showOptions is true */}
                            {showOptions && (
                                <MediaOptionsMenu
                                    onSave={saveMediaToGallery}
                                    onDiscard={discardPreview}
                                    onClose={() => setShowOptions(false)}
                                />
                            )}
                        </View>
                    )}
                </View>

                {/* Bottom caption area - outside the preview container with transparent background */}
                <View style={captionStyles.captionOuterContainer}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                        style={captionStyles.keyboardAvoid}
                    >
                        <View style={captionStyles.captionWrapper}>
                            <TextInput
                                style={captionStyles.captionInput}
                                placeholder="Add a caption..."
                                placeholderTextColor="rgba(255, 255, 255, 0.9)"
                                value={caption}
                                onChangeText={handleCaptionChange}
                                multiline
                                maxLength={MAX_CAPTION_LENGTH}
                            />

                            {/* Character counter */}
                            <View style={captionStyles.counterContainer}>
                                <Text style={[
                                    captionStyles.characterCount,
                                    caption.length > MAX_CAPTION_LENGTH * 0.8 && captionStyles.characterCountWarning
                                ]}>
                                    {caption.length}/{MAX_CAPTION_LENGTH}
                                </Text>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
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

const videoStyles = StyleSheet.create({
    playPauseButtonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
        // This container is not touchable, just positions the button
        pointerEvents: 'box-none',
    },
    playPauseButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        // Center the play icon better
        paddingLeft: 4,
        // Ensure this element receives touch events
        zIndex: 10,
    }
});

const captionStyles = StyleSheet.create({
    captionOuterContainer: {
        backgroundColor: 'transparent', // Transparent background
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 15,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    keyboardAvoid: {
        width: '100%',
    },
    captionWrapper: {
        width: '100%',
        backgroundColor: 'transparent', // Ensure wrapper is also transparent
    },
    captionInput: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        paddingVertical: 8,
        paddingHorizontal: 10,
        width: '100%',
        backgroundColor: 'transparent', // Transparent input background
        textShadowColor: 'rgba(0, 0, 0, 0.75)', // Add text shadow for better visibility on any background
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    counterContainer: {
        alignItems: 'flex-end',
        marginTop: 2,
        paddingRight: 4,
    },
    characterCount: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.5)', // Text shadow for counter too
        textShadowOffset: { width: 0.5, height: 0.5 },
        textShadowRadius: 1,
    },
    characterCountWarning: {
        color: '#FF4D4D',
    }
});