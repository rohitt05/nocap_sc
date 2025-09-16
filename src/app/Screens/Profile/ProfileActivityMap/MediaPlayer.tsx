import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface MediaPlayerProps {
    mediaUrl: string;
    type: 'photo' | 'video';
    locationName: string;
    onClose?: () => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({
    mediaUrl,
    type,
    locationName,
    onClose
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [mediaLoading, setMediaLoading] = useState(true);
    const [mediaError, setMediaError] = useState<string | null>(null);

    const videoRef = useRef<Video>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ✅ DEBUG: Log media URL to check if it's valid
    useEffect(() => {
        console.log(`🎬 MediaPlayer rendering ${type}:`, mediaUrl);

        // Reset loading state
        setMediaLoading(true);
        setMediaError(null);

        // ✅ Check if URL is valid
        if (!mediaUrl || mediaUrl.trim() === '') {
            console.error('❌ Empty media URL');
            setMediaError('No media URL provided');
            setMediaLoading(false);
            return;
        }

    }, [mediaUrl, type]);

    // Handle image loading
    const handleImageLoad = () => {
        console.log('✅ Image loaded successfully');
        setMediaLoading(false);
        setMediaError(null);
    };

    const handleImageError = (error: any) => {
        console.error('❌ Image loading error:', error.nativeEvent?.error || error);
        setMediaLoading(false);
        setMediaError('Failed to load image');
    };

    // Handle video playback status
    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setIsMuted(status.isMuted);
            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);
            setMediaLoading(false);
            setMediaError(null);

            if (status.didJustFinish && !status.isLooping) {
                videoRef.current?.replayAsync();
            }
        } else if (status.error) {
            console.error('❌ Video error:', status.error);
            setMediaLoading(false);
            setMediaError('Failed to load video');
        }
    };

    // Toggle play/pause
    const togglePlayPause = async () => {
        if (!videoRef.current) return;
        try {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    };

    // Retry loading media
    const handleRetry = () => {
        setMediaError(null);
        setMediaLoading(true);
    };

    // Format time
    const formatTime = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // ✅ Show error state if media fails
    if (mediaError) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={40} color="#666" />
                <Text style={styles.errorText}>{mediaError}</Text>
                <Text style={styles.urlDebug}>URL: {mediaUrl}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <MaterialIcons name="refresh" size={16} color="white" />
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {type === 'photo' ? (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: mediaUrl }}
                        style={styles.image}
                        resizeMode="cover"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        onLoadStart={() => {
                            console.log('📸 Image loading started');
                            setMediaLoading(true);
                        }}
                    />

                    {mediaLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    )}

                    {!mediaLoading && !mediaError && (
                        <LinearGradient
                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
                            style={styles.overlay}
                        >
                            <View style={styles.info}>
                                <MaterialIcons name="camera-alt" size={14} color="white" />
                                <Text style={styles.locationText}>{locationName}</Text>
                            </View>
                        </LinearGradient>
                    )}
                </View>
            ) : (
                <View style={styles.videoContainer}>
                    <Video
                        ref={videoRef}
                        source={{ uri: mediaUrl }}
                        style={styles.video}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isLooping={true}
                        isMuted={isMuted}
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        onLoad={() => {
                            console.log('📹 Video loaded successfully');
                            setMediaLoading(false);
                        }}
                        onError={(error) => {
                            console.error('❌ Video error:', error);
                            setMediaError('Failed to load video');
                            setMediaLoading(false);
                        }}
                    />

                    {mediaLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    )}

                    {!mediaLoading && !mediaError && showControls && (
                        <View style={styles.videoControls}>
                            <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                                <MaterialIcons
                                    name={isPlaying ? "pause" : "play-arrow"}
                                    size={32}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
    },

    imageContainer: {
        width: '100%',
        height: 250, // Fixed height
        position: 'relative',
        backgroundColor: '#1a1a1a',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    videoContainer: {
        width: '100%',
        height: 250, // Fixed height
        position: 'relative',
        backgroundColor: '#1a1a1a',
    },

    video: {
        width: '100%',
        height: '100%',
    },

    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingText: {
        color: 'white',
        fontSize: 12,
        marginTop: 8,
    },

    errorContainer: {
        height: 250,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    errorText: {
        color: '#999',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 8,
    },

    urlDebug: {
        color: '#666',
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 12,
    },

    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },

    retryText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },

    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
        justifyContent: 'flex-end',
        paddingHorizontal: 12,
        paddingBottom: 8,
    },

    info: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    locationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },

    videoControls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },

    playButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 30,
        padding: 15,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
});

export default MediaPlayer;
