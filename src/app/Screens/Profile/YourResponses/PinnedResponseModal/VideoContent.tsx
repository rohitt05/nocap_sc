import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface VideoContentProps {
    fileUrl?: string;
}

const VideoContent = ({ fileUrl }: VideoContentProps) => {
    const [status, setStatus] = useState<any>({});
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<Video>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const fadeTimeout = useRef<NodeJS.Timeout | null>(null);

    // Handle play/pause toggle
    const togglePlayback = async () => {
        if (videoRef.current) {
            if (status.isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
            setIsPlaying(!isPlaying);
            showControls();
        }
    };

    // Handle status updates
    const onPlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
        setStatus(() => status);

        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);

            // Check if video has ended and restart it
            if (status.didJustFinish) {
                // Reset position to beginning
                await videoRef.current?.setPositionAsync(0);
                // Play again
                await videoRef.current?.playAsync();
                showControls();
            }
        }
    };

    // Show controls and set up fade out
    const showControls = () => {
        // Clear any existing timeout
        if (fadeTimeout.current) {
            clearTimeout(fadeTimeout.current);
        }

        // Make controls visible
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Set timeout to fade out controls
        fadeTimeout.current = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
            }).start();
        }, 3000);
    };

    // Set up looping using the isLooping property
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.setIsLoopingAsync(true);
        }
    }, []);

    // Show controls on mount
    useEffect(() => {
        showControls();

        // Clean up timeout when component unmounts
        return () => {
            if (fadeTimeout.current) {
                clearTimeout(fadeTimeout.current);
            }
        };
    }, []);

    return (
        <TouchableOpacity
            style={styles.mediaContainer}
            activeOpacity={1}
            onPress={showControls}
        >
            <Video
                ref={videoRef}
                source={{ uri: fileUrl }}
                style={styles.mediaContent}
                resizeMode="cover"
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                shouldPlay={false}
                isLooping={true}
            />
            <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradientOverlay}
                locations={[0, 0.2, 0.8, 1]}
                pointerEvents="none"
            />

            {/* Play/Pause controls */}
            <Animated.View
                style={[
                    styles.controlsContainer,
                    { opacity: fadeAnim }
                ]}
                pointerEvents="box-none"
            >
                <TouchableOpacity
                    style={styles.playButtonContainer}
                    onPress={togglePlayback}
                >
                    <Ionicons
                        name={isPlaying ? "pause-circle" : "play-circle"}
                        size={50}
                        color="white"
                    />
                    <Text style={styles.playButtonText}>
                        {isPlaying ? "Pause" : "Play"}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    mediaContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        position: 'relative',
    },
    mediaContent: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        zIndex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButtonText: {
        color: 'white',
        fontSize: 16,
        marginTop: 8,
        fontWeight: '600',
    },
});

export default VideoContent;