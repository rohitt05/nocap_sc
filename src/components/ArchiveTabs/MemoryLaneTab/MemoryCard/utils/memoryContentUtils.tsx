import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Video, Audio } from 'expo-av';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Response } from '../../../../../../API/fetchArchives';

// Calculate dimensions based on screen width
const { width } = Dimensions.get('window');
const MEDIA_WIDTH = width * 0.9; // 90% of screen width
const MEDIA_HEIGHT = MEDIA_WIDTH * (5 / 4); // Keep the 4:5 ratio

// Styles for the content renderers
const styles = StyleSheet.create({
    textMemory: {
        width: MEDIA_WIDTH,
        padding: 16,
        backgroundColor: 'transparent',
        minHeight: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContent: {
        fontSize: 18,
        lineHeight: 24,
        color: '#fff',
        textAlign: 'center',
    },
    mediaContainer: {
        width: MEDIA_WIDTH,
        height: MEDIA_HEIGHT,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    imageContent: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    videoContent: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    audioContainer: {
        width: MEDIA_WIDTH,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    audioButton: {
        backgroundColor: '#333',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#555',
        flexDirection: 'row',
        alignItems: 'center',
    },
    audioButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    playPauseButton: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 10,
    },
});

// Text memory renderer
export const renderTextMemory = (content: string) => {
    return (
        <View style={styles.textMemory}>
            <Text style={styles.textContent}>{content}</Text>
        </View>
    );
};

// Image memory renderer
export const renderImageMemory = (fileUrl: string) => {
    return (
        <View style={styles.mediaContainer}>
            <Image
                source={{ uri: fileUrl }}
                style={styles.imageContent}
                contentFit="cover"
            />
        </View>
    );
};

// Video memory component with custom play/pause controls
const VideoMemory = ({ fileUrl }) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [hasEnded, setHasEnded] = React.useState(false);
    const videoRef = React.useRef(null);

    const handlePlayPause = async (event) => {
        // Stop event propagation to prevent clicks from passing through to the video
        event.stopPropagation();

        if (videoRef.current) {
            try {
                if (isPlaying) {
                    await videoRef.current.pauseAsync();
                    setIsPlaying(false);
                } else {
                    // If video has ended, restart it from the beginning
                    if (hasEnded) {
                        await videoRef.current.replayAsync();
                        setHasEnded(false);
                    } else {
                        await videoRef.current.playAsync();
                    }
                    setIsPlaying(true);
                }
            } catch (error) {
                console.error("Error controlling video playback:", error);
            }
        }
    };

    return (
        <View style={styles.mediaContainer}>
            <Video
                ref={videoRef}
                source={{ uri: fileUrl }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                shouldPlay={false}
                useNativeControls={false}
                style={styles.videoContent}
                // Improved buffering for smoother playback
                progressUpdateIntervalMillis={50}
                positionMillis={0}
                onReadyForDisplay={() => {
                    // Video is ready to play
                    console.log("Video ready for display");
                }}
                onPlaybackStatusUpdate={(status) => {
                    if (status.isLoaded) {
                        // Update playing state
                        if (status.isPlaying !== undefined) {
                            setIsPlaying(status.isPlaying);
                        }

                        // Check if video has ended
                        if (status.didJustFinish) {
                            setIsPlaying(false);
                            setHasEnded(true);
                        }
                    }
                }}
            />
            {/* Transparent overlay to prevent video clicks from triggering play/pause */}
            <View style={styles.videoOverlay} />

            {/* Play/Pause button positioned at bottom left */}
            <TouchableOpacity
                style={styles.playPauseButton}
                onPress={handlePlayPause}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons
                    name={isPlaying ? "pause" : hasEnded ? "reload" : "play"}
                    size={36}
                    color="#fff"
                />
            </TouchableOpacity>
        </View>
    );
};

// Audio memory component with playback functionality
const AudioMemory = ({ fileUrl }) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [sound, setSound] = React.useState(null);

    React.useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const handlePlayPause = async () => {
        if (!sound) {
            try {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: fileUrl },
                    { shouldPlay: true },
                    (status) => {
                        if (status.isLoaded) {
                            setIsPlaying(status.isPlaying);
                            if (status.didJustFinish) {
                                setIsPlaying(false);
                            }
                        }
                    }
                );
                setSound(newSound);
                setIsPlaying(true);
            } catch (error) {
                console.error("Error loading sound:", error);
            }
        } else {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
            }
        }
    };

    return (
        <View style={styles.audioContainer}>
            <TouchableOpacity style={styles.audioButton} onPress={handlePlayPause}>
                <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={20}
                    color="#fff"
                />
                <Text style={styles.audioButtonText}>
                    {isPlaying ? "Pause Audio" : "Play Audio"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

// Video memory renderer function that uses the VideoMemory component
export const renderVideoMemory = (fileUrl: string) => {
    return <VideoMemory fileUrl={fileUrl} />;
};

// Audio memory renderer function that uses the AudioMemory component
export const renderAudioMemory = (fileUrl: string) => {
    return <AudioMemory fileUrl={fileUrl} />;
};

// GIF memory renderer
export const renderGifMemory = (fileUrl: string) => {
    return (
        <View style={styles.mediaContainer}>
            <Image
                source={{ uri: fileUrl }}
                style={styles.imageContent}
                contentFit="cover"
            />
        </View>
    );
};

// Main content renderer that determines which specific renderer to use
export const renderMemoryContent = (memory: Response) => {
    switch (memory.content_type) {
        case 'text':
            return renderTextMemory(memory.text_content);
        case 'image':
            return renderImageMemory(memory.file_url);
        case 'video':
            return renderVideoMemory(memory.file_url);
        case 'audio':
            return renderAudioMemory(memory.file_url);
        case 'gif':
            return renderGifMemory(memory.file_url);
        default:
            return <Text style={{ color: '#fff' }}>Unsupported content type</Text>;
    }
};