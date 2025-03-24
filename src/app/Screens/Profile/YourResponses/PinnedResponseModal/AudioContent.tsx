import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AudioContentProps {
    fileUrl?: string;
    responseId: string;
    playAudio?: (url: string, id: string) => void;
    isPlaying?: boolean;
    playingId?: string | null;
}

const AudioContent = ({ fileUrl, responseId, playAudio, isPlaying, playingId }: AudioContentProps) => {
    return (
        <View style={styles.audioContainer}>
            <LinearGradient
                colors={['#87CEFA', '#1E90FF', '#0000CD', '#000033']}
                style={styles.gradient}
                locations={[0, 0.3, 0.7, 1]}
            >
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity
                        style={styles.audioButton}
                        onPress={() => playAudio && playAudio(fileUrl || "", responseId)}
                    >
                        <Ionicons
                            name={isPlaying && playingId === responseId ? "pause-circle" : "play-circle"}
                            size={60}
                            color="#ffffff"
                        />
                        <Text style={styles.audioText}>
                            {isPlaying && playingId === responseId ? "Pause Audio" : "Play Audio"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    audioContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        overflow: 'hidden',
    },
    gradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end', // Changed to align content to the bottom
        alignItems: 'center',
    },
    buttonWrapper: {
        paddingBottom: 24, // Add some padding at the bottom
        width: '100%',
        alignItems: 'center',
    },
    audioButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    audioText: {
        marginTop: 12,
        fontSize: 16,
        color: '#ffffff',
    },
});

export default AudioContent;