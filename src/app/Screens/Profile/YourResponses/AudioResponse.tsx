import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AudioResponse = ({ response, isPlaying, onPlayPress, id, playingId }) => {
    return (
        <TouchableOpacity
            style={styles.mediaPreviewContainer}
            onPress={() => onPlayPress(response, id)}
        >
            <LinearGradient
                colors={['#87CEFA', '#1E90FF', '#0000CD', '#000033']}
                style={styles.gradient}
                locations={[0, 0.3, 0.7, 1]}
            >
                <View style={styles.controlsContainer}>
                    {isPlaying && playingId === id ? (
                        <FontAwesome name="pause" size={24} color="white" style={styles.previewIcon} />
                    ) : (
                        <FontAwesome name="play" size={24} color="white" style={styles.previewIcon} />
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    mediaPreviewContainer: {
        height: 180,
        position: 'relative',
        overflow: 'hidden',
    },
    gradient: {
        width: '100%',
        height: '100%',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        padding: 16,
    },
    previewIcon: {
        opacity: 0.9,
    }
});

export default AudioResponse;