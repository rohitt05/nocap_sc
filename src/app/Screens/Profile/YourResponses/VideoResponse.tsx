import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';

const VideoResponse = ({ response }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);

    const handlePlayPress = async () => {
        if (videoRef.current) {
            const status = await videoRef.current.getStatusAsync();

            if (status.isPlaying) {
                await videoRef.current.pauseAsync();
                setIsPlaying(false);
            } else {
                await videoRef.current.playAsync();
                setIsPlaying(true);
            }
        }
    };

    const handleVideoEnd = (status) => {
        if (status.didJustFinish) {
            setIsPlaying(false);
        }
    };

    return (
        <View style={styles.mediaPreviewContainer}>
            <Video
                ref={videoRef}
                source={{ uri: response }}
                style={styles.videoPreview}
                resizeMode="cover"
                shouldPlay={false}
                isLooping={false}
                useNativeControls={false}
                onPlaybackStatusUpdate={handleVideoEnd}
            />
            <TouchableOpacity
                style={styles.videoOverlay}
                onPress={handlePlayPress}
                activeOpacity={0.8}
            >
                <View style={styles.controlsContainer}>
                    {isPlaying ? (
                        <FontAwesome name="pause" size={24} color="white" style={styles.playIcon} />
                    ) : (
                        <FontAwesome name="play" size={24} color="white" style={styles.playIcon} />
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    mediaPreviewContainer: {
        height: 180,
        position: 'relative',
        overflow: 'hidden',
    },
    videoPreview: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        padding: 16,
    },
    playIcon: {
        opacity: 0.9,
    }
});

export default VideoResponse;