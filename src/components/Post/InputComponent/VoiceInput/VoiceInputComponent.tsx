import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const VoiceInputComponent = ({ onRecordingComplete }) => {
    const [recording, setRecording] = useState(null);
    const [recordingStatus, setRecordingStatus] = useState('idle');
    const [audioUri, setAudioUri] = useState(null);
    const [sound, setSound] = useState(null);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Request permissions
        Audio.requestPermissionsAsync();
        Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        // Cleanup
        return () => {
            if (recording) {
                stopRecording();
            }
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    async function startRecording() {
        try {
            // Clear previous recording
            if (audioUri) {
                setAudioUri(null);
                if (sound) {
                    await sound.unloadAsync();
                    setSound(null);
                }
            }

            // Start recording
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setRecordingStatus('recording');
        } catch (error) {
            console.error('Failed to start recording', error);
        }
    }

    async function stopRecording() {
        if (!recording) return;

        try {
            setRecordingStatus('stopping');
            await recording.stopAndUnloadAsync();

            const uri = recording.getURI();
            setAudioUri(uri);

            // Get recording duration
            const { sound: newSound } = await Audio.Sound.createAsync({ uri });
            const status = await newSound.getStatusAsync();
            setDuration(status.durationMillis / 1000); // Convert to seconds
            setSound(newSound);

            // Pass the recording to the parent component
            if (onRecordingComplete) {
                onRecordingComplete({
                    file: await fetchAudioFile(uri),
                    uri: uri,
                    duration: status.durationMillis / 1000
                });
            }
        } catch (error) {
            console.error('Failed to stop recording', error);
        }

        setRecording(null);
        setRecordingStatus('idle');
    }

    // Helper function to fetch the audio file as a blob
    async function fetchAudioFile(uri) {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    }

    async function playSound() {
        if (!sound) return;

        try {
            setIsPlaying(true);
            await sound.replayAsync();
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                }
            });
        } catch (error) {
            console.error('Failed to play sound', error);
            setIsPlaying(false);
        }
    }

    async function pauseSound() {
        if (!sound) return;

        try {
            await sound.pauseAsync();
            setIsPlaying(false);
        } catch (error) {
            console.error('Failed to pause sound', error);
        }
    }

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    return (
        <View style={styles.container}>
            {audioUri ? (
                <View style={styles.playbackContainer}>
                    <Text style={styles.durationText}>
                        {formatDuration(duration)}
                    </Text>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={isPlaying ? pauseSound : playSound}
                    >
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.recordAgainButton}
                        onPress={startRecording}
                    >
                        <Text style={styles.recordAgainText}>Record Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.recordButton,
                        recordingStatus === 'recording' && styles.recordingButton
                    ]}
                    onPress={recordingStatus === 'recording' ? stopRecording : startRecording}
                >
                    <Ionicons
                        name={recordingStatus === 'recording' ? "stop" : "mic"}
                        size={24}
                        color="white"
                    />
                    <Text style={styles.recordText}>
                        {recordingStatus === 'recording' ? 'Stop Recording' : 'Start Recording'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6441A5',
        padding: 15,
        borderRadius: 30,
        width: '80%',
    },
    recordingButton: {
        backgroundColor: '#ff4040',
    },
    recordText: {
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    playbackContainer: {
        alignItems: 'center',
        width: '100%',
    },
    durationText: {
        color: 'white',
        fontSize: 24,
        marginBottom: 15,
    },
    playButton: {
        backgroundColor: '#6441A5',
        padding: 15,
        borderRadius: 50,
        marginBottom: 15,
    },
    recordAgainButton: {
        padding: 10,
    },
    recordAgainText: {
        color: '#6441A5',
        fontWeight: 'bold',
    },
});

export default VoiceInputComponent;