import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';

const VideoResponse = ({ response }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);

    const handlePlayPress = async (event) => {
        // Stop event propagation to prevent parent TouchableOpacity from triggering
        event.stopPropagation();

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
                isLooping={true}
                useNativeControls={false}
                onPlaybackStatusUpdate={handleVideoEnd}
            />
            {/* Remove the full-screen overlay and just use a button */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayPress}
                    activeOpacity={0.8}
                >
                    {isPlaying ? (
                        <FontAwesome name="pause" size={24} color="white" />
                    ) : (
                        <FontAwesome name="play" size={24} color="white" />
                    )}
                </TouchableOpacity>
            </View>
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
    controlsContainer: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 1,
    },
    playButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default VideoResponse;