import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import { VoiceInputUtils, RecordingData } from './VoiceInputUtils';

interface VoiceInputComponentProps {
    onRecordingComplete?: (recordingData: RecordingData) => void;
}

const VoiceInputComponent: React.FC<VoiceInputComponentProps> = ({ onRecordingComplete }) => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [duration, setDuration] = useState<number>(0);
    const [isRecording, setIsRecording] = useState<boolean>(false);

    useEffect(() => {
        // Request permissions
        VoiceInputUtils.requestAudioPermissions();

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

    async function toggleRecording() {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    }

    async function startRecording() {
        // Clear previous recording if exists
        if (audioUri) {
            setAudioUri(null);
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }
        }

        // Start recording
        const newRecording = await VoiceInputUtils.startRecording();
        if (newRecording) {
            setRecording(newRecording);
            setIsRecording(true);
        }
    }

    async function stopRecording() {
        if (!recording) return;

        const recordingData = await VoiceInputUtils.stopRecording(recording);

        if (recordingData) {
            setAudioUri(recordingData.uri);
            setDuration(recordingData.duration);

            const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordingData.uri });
            setSound(newSound);

            // Pass the recording to the parent component
            if (onRecordingComplete) {
                onRecordingComplete(recordingData);
            }
        }

        setRecording(null);
        setIsRecording(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <FontAwesome
                    name={isRecording ? "microphone-slash" : "microphone"}
                    size={100}
                    color={isRecording ? "#ff4040" : "#fff"}
                />
            </View>

            <Text style={styles.instructionText}>
                {isRecording
                    ? "Recording in progress..."
                    : "Tap the microphone to start recording"}
            </Text>

            <TouchableOpacity
                style={styles.recordButton}
                onPress={toggleRecording}
            >
                <Text style={styles.recordButtonText}>
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </Text>
            </TouchableOpacity>

            {audioUri && (
                <View style={styles.recordingInfoContainer}>
                    <Text style={styles.durationText}>
                        Recorded: {VoiceInputUtils.formatDuration(duration)}
                    </Text>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                            setAudioUri(null);
                            setSound(null);
                        }}
                    >
                        <Text style={styles.clearButtonText}>Clear Recording</Text>
                    </TouchableOpacity>
                </View>
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
    iconContainer: {
        marginBottom: 20,
    },
    instructionText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    recordButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#132fba',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
    },
    recordButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    recordingInfoContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    durationText: {
        color: '#666',
        marginBottom: 10,
    },
    clearButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ff4040',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    clearButtonText: {
        color: '#ff4040',
        fontSize: 12,
    },
});

export default VoiceInputComponent;