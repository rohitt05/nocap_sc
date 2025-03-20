import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = width - 40; // Card width with margins
const cardHeight = cardWidth * (5 / 4); // 4:5 aspect ratio

const MemoryCard = ({ memory }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Handle play/pause for video and audio
    const togglePlayback = async (videoRef) => {
        if (videoRef) {
            const status = await videoRef.getStatusAsync();
            if (status.isPlaying) {
                await videoRef.pauseAsync();
                setIsPlaying(false);
            } else {
                await videoRef.playAsync();
                setIsPlaying(true);
            }
        }
    };

    // Handle mute/unmute
    const toggleMute = async (videoRef) => {
        if (videoRef) {
            setIsMuted(!isMuted);
            await videoRef.setIsMutedAsync(!isMuted);
        }
    };

    // Render content based on type
    const renderContent = () => {
        switch (memory.content_type) {
            case 'image':
                return (
                    <Image
                        source={{ uri: memory.file_url }}
                        style={styles.mediaContent}
                        contentFit="cover"
                        transition={300}
                        onLoadStart={() => setIsLoading(true)}
                        onLoad={() => setIsLoading(false)}
                    />
                );

            case 'video':
                return (
                    <View style={styles.videoContainer}>
                        <Video
                            ref={(ref) => (videoRef = ref)}
                            source={{ uri: memory.file_url }}
                            style={styles.mediaContent}
                            resizeMode="cover"
                            shouldPlay={false}
                            isMuted={isMuted}
                            isLooping
                            onLoadStart={() => setIsLoading(true)}
                            onLoad={() => setIsLoading(false)}
                        />
                        <View style={styles.videoControls}>
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={() => togglePlayback(videoRef)}
                            >
                                <Ionicons
                                    name={isPlaying ? "pause" : "play"}
                                    size={24}
                                    color="white"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={() => toggleMute(videoRef)}
                            >
                                <Ionicons
                                    name={isMuted ? "volume-mute" : "volume-medium"}
                                    size={20}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'audio':
                return (
                    <View style={styles.audioContainer}>
                        <Video
                            ref={(ref) => (audioRef = ref)}
                            source={{ uri: memory.file_url }}
                            style={{ height: 0 }} // Hide video element for audio
                            shouldPlay={false}
                            isLooping
                            onLoadStart={() => setIsLoading(true)}
                            onLoad={() => setIsLoading(false)}
                        />
                        <View style={styles.audioContent}>
                            <Ionicons name="musical-notes" size={48} color="#fff" />
                            <Text style={styles.audioText}>Audio Memory</Text>
                            <TouchableOpacity
                                style={styles.audioPlayButton}
                                onPress={() => togglePlayback(audioRef)}
                            >
                                <Ionicons
                                    name={isPlaying ? "pause-circle" : "play-circle"}
                                    size={60}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'gif':
                return (
                    <Image
                        source={{ uri: memory.file_url }}
                        style={styles.mediaContent}
                        contentFit="cover"
                        transition={300}
                        onLoadStart={() => setIsLoading(true)}
                        onLoad={() => setIsLoading(false)}
                    />
                );

            case 'text':
                return (
                    <View style={styles.textContainer}>
                        <Text style={styles.textContent}>{memory.text_content}</Text>
                    </View>
                );

            default:
                return (
                    <View style={styles.fallbackContainer}>
                        <Ionicons name="image-outline" size={48} color="#555" />
                        <Text style={styles.fallbackText}>Memory</Text>
                    </View>
                );
        }
    };

    // Show loading indicator
    const renderLoading = () => {
        if (isLoading && (memory.content_type === 'image' || memory.content_type === 'video' || memory.content_type === 'gif')) {
            return (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.memoryCardContainer}>
            <View style={[styles.memoryCard, { height: cardHeight }]}>
                {renderContent()}
                {renderLoading()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    memoryCardContainer: {
        width: width,
        paddingHorizontal: 20,
    },
    memoryCard: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#111',
    },
    mediaContent: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222',
    },
    textContent: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 24,
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoControls: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 8,
    },
    controlButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    audioContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222',
    },
    audioContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    audioText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 12,
        marginBottom: 20,
    },
    audioPlayButton: {
        marginTop: 16,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    fallbackText: {
        color: '#666',
        fontSize: 16,
        marginTop: 12,
    },
});

export default MemoryCard;