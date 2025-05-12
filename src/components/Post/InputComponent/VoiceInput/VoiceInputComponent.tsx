import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Easing,
} from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';

interface VoiceInputComponentProps {
    onRecordingComplete?: (recordingData: any) => void;
}

const VoiceInputComponent: React.FC<VoiceInputComponentProps> = ({ onRecordingComplete }) => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [duration, setDuration] = useState<number>(0);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [recordingTime, setRecordingTime] = useState<number>(0);

    // Timer interval ref
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Animation values
    const pulseAnim = new Animated.Value(1);
    const audioLevelAnim = new Animated.Value(0.4);

    useEffect(() => {
        // Request permissions
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Audio permissions not granted');
            }
        })();

        // Cleanup
        return () => {
            if (recording) {
                stopRecording();
            }
            if (sound) {
                sound.unloadAsync();
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    // Setup pulse animation when recording
    useEffect(() => {
        let pulseAnimation: Animated.CompositeAnimation;

        if (isRecording) {
            pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 2000,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true
                    })
                ])
            );

            pulseAnimation.start();

            // Simulate audio level changes when recording
            const audioAnimation = setInterval(() => {
                Animated.timing(audioLevelAnim, {
                    toValue: Math.random() * 0.3 + 0.4, // More subtle random value between 0.4 and 0.7
                    duration: 150,
                    useNativeDriver: false
                }).start();
            }, 150);

            // Start timer for recording
            setRecordingTime(0);
            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1000);
            }, 1000);

            return () => {
                pulseAnimation.stop();
                clearInterval(audioAnimation);
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                }
            };
        }
    }, [isRecording]);

    // Monitor sound playback status
    useEffect(() => {
        if (sound) {
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    setIsPlaying(status.isPlaying);
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                    }
                }
            });
        }
    }, [sound]);

    async function startRecording() {
        try {
            if (audioUri) {
                setAudioUri(null);
                if (sound) {
                    await sound.unloadAsync();
                    setSound(null);
                }
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);
        } catch (error) {
            console.error('Failed to start recording', error);
        }
    }

    async function stopRecording() {
        if (!recording) return;

        try {
            setIsRecording(false);
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            if (uri) {
                setAudioUri(uri);

                // Get recording duration
                const { sound: newSound, status } = await Audio.Sound.createAsync({ uri });
                setSound(newSound);

                if (status.isLoaded) {
                    setDuration(status.durationMillis || 0);
                    setRecordingTime(status.durationMillis || 0);
                }

                // Pass the recording data to parent
                if (onRecordingComplete) {
                    onRecordingComplete({
                        uri,
                        duration: status.durationMillis || 0
                    });
                }
            }
        } catch (error) {
            console.error('Failed to stop recording', error);
        }

        setRecording(null);
    }

    function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    async function togglePlayback() {
        if (!sound) return;

        try {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playFromPositionAsync(0);
            }
        } catch (error) {
            console.error('Failed to toggle playback', error);
        }
    }

    function formatTime(ms: number) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    return (
        <View style={styles.container}>
            {/* Black background with grain texture */}
            <View style={styles.backgroundOverlay}>
                <View style={styles.grainOverlay} />
            </View>

            <View style={styles.contentContainer}>
                {/* Circular audio visualizer */}
                <View style={styles.visualizerContainer}>
                    {/* Outer pulse animation circle */}
                    {isRecording && (
                        <Animated.View
                            style={[
                                styles.pulseCircle,
                                {
                                    transform: [{ scale: pulseAnim }],
                                    opacity: 0.15
                                }
                            ]}
                        />
                    )}

                    {/* Inner audio level circle */}
                    <Animated.View
                        style={[
                            styles.audioLevelCircle,
                            {
                                transform: [
                                    { scale: audioLevelAnim }
                                ]
                            }
                        ]}
                    />
                </View>

                {/* Timer moved above controls panel */}
                <View style={styles.standaloneTimerContainer}>
                    <Text style={styles.timerText}>
                        {isRecording
                            ? formatTime(recordingTime)
                            : audioUri
                                ? formatTime(duration)
                                : "00:00"}
                    </Text>
                </View>

                {/* Controls panel */}
                <View style={styles.controlsPanel}>
                    <View style={styles.controlsRow}>
                        {/* Clear button */}
                        <TouchableOpacity
                            style={[
                                styles.circleButton,
                                styles.sideButton,
                                { opacity: audioUri || isRecording ? 1 : 0 }
                            ]}
                            onPress={() => {
                                if (isRecording) {
                                    stopRecording();
                                }
                                setAudioUri(null);
                                setSound(null);
                            }}
                            disabled={!audioUri && !isRecording}
                        >
                            <FontAwesome name="trash" size={24} color="#e1e1e1" />
                        </TouchableOpacity>

                        {/* Main record button */}
                        <TouchableOpacity
                            style={[
                                styles.circleButton,
                                styles.mainButton,
                                isRecording ? styles.recordingButton : styles.notRecordingButton
                            ]}
                            onPress={toggleRecording}
                        >
                            <FontAwesome
                                name={isRecording ? "stop" : "microphone"}
                                size={32}
                                color={isRecording ? "#e1e1e1" : "#333333"}
                            />
                        </TouchableOpacity>

                        {/* Play/Pause button */}
                        <TouchableOpacity
                            style={[
                                styles.circleButton,
                                styles.sideButton,
                                { opacity: audioUri && !isRecording ? 1 : 0 }
                            ]}
                            onPress={togglePlayback}
                            disabled={!audioUri || isRecording}
                        >
                            <FontAwesome
                                name={isPlaying ? "pause" : "play"}
                                size={24}
                                color="#e1e1e1"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#000000',
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
    grainOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.03,
        // Grain effect would be applied through a pattern or shader
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 40,
    },
    visualizerContainer: {
        width: width * 0.7,
        height: width * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    pulseCircle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 999,
        backgroundColor: '#111',
    },
    audioLevelCircle: {
        width: '70%',
        height: '70%',
        borderRadius: 999,
        backgroundColor: 'rgba(19, 47, 186, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#222",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    standaloneTimerContainer: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    timerText: {
        color: '#e1e1e1',
        fontSize: 18,
        fontWeight: 'bold',
    },
    controlsPanel: {
        width: '100%',
        backgroundColor: 'rgba(10, 10, 10, 0.1)',
        padding: 16,
        bottom:20,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    circleButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
    },
    sideButton: {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(20, 20, 20, 0.9)',
    },
    mainButton: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingButton: {
        // backgroundColor: '#1a1a1a',
    },
    notRecordingButton: {
        backgroundColor: '#d0d0d0',
    }
});

export default VoiceInputComponent;