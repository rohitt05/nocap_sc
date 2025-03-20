import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface CameraScreenProps {
    onMediaCapture?: (mediaInfo: {
        uri: string;
        type: 'image' | 'video';
        isFrontFacing: boolean;
    }) => void;
}

export default function CameraScreen({ onMediaCapture }: CameraScreenProps) {
    const [facing, setFacing] = useState<CameraType>('back');
    const [flash, setFlash] = useState<string>('off');
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();

    // New state for video mode and recording
    const [isVideoMode, setIsVideoMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Timer effect for recording duration
    useEffect(() => {
        if (isRecording) {
            setRecordingDuration(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

            return () => {
                if (recordingIntervalRef.current) {
                    clearInterval(recordingIntervalRef.current);
                }
            };
        } else {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            setRecordingDuration(0);
        }
    }, [isRecording]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    function toggleFlash() {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    }

    // Toggle between photo and video mode
    function toggleVideoMode() {
        setIsVideoMode(!isVideoMode);
    }

    // Format duration to MM:SS
    function formatDuration(seconds: number) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    async function takePictureOrStartRecording() {
        if (isVideoMode) {
            // Video recording logic
            if (cameraRef.current) {
                if (!isRecording) {
                    try {
                        setIsRecording(true);
                        const video = await cameraRef.current.recordAsync();
                        if (onMediaCapture) {
                            onMediaCapture({
                                uri: video.uri,
                                type: 'video',
                                isFrontFacing: facing === 'front'
                            });
                        }
                        setIsRecording(false);
                    } catch (error) {
                        console.error('Recording failed', error);
                        setIsRecording(false);
                    }
                } else {
                    if (cameraRef.current) {
                        cameraRef.current.stopRecording();
                        setIsRecording(false);
                    }
                }
            }
        } else {
            // Photo capture logic
            if (cameraRef.current) {
                const photo = await cameraRef.current.takePictureAsync();
                if (photo && onMediaCapture) {
                    onMediaCapture({
                        uri: photo.uri,
                        type: 'image',
                        isFrontFacing: facing === 'front'
                    });
                } else {
                    console.error('Failed to capture photo');
                }
            }
        }
    }

    async function openPhotoLibrary() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert('Sorry, we need media library permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const isVideo = asset.uri.endsWith('.mp4') ||
                asset.uri.endsWith('.mov') ||
                asset.uri.endsWith('.avi') ||
                (asset.type && asset.type.startsWith('video'));

            if (onMediaCapture) {
                onMediaCapture({
                    uri: asset.uri,
                    type: isVideo ? 'video' : 'image',
                    isFrontFacing: false
                });
            }
        }
    }

    return (
        <CameraView
            style={styles.camera}
            facing={facing}
            flash={flash}
            shutterSound={false}
            ref={cameraRef}
            mode={isVideoMode ? "video" : "picture"}
        >
            {/* Mode Indicator now in top left */}
            {isVideoMode && (
                <View style={styles.topLeftContainer}>
                    <Text style={[styles.text, styles.videoModeText]}>
                        Video Mode
                    </Text>
                </View>
            )}

            {/* Recording Duration now horizontally centered */}
            {isVideoMode && isRecording && (
                <View style={styles.horizontalCenterContainer}>
                    <Text style={[styles.text, styles.recordingDurationText]}>
                        {formatDuration(recordingDuration)}
                    </Text>
                </View>
            )}

            <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                    <Ionicons
                        name={flash === 'off' ? "flash-off" : "flash"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
                    <Ionicons
                        name="camera-reverse"
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={toggleVideoMode}>
                    <MaterialIcons
                        name={isVideoMode ? "videocam-off" : "videocam"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.captureContainer}>
                <TouchableOpacity
                    style={[
                        styles.captureButton,
                        isRecording && styles.recordingButton
                    ]}
                    onPress={takePictureOrStartRecording}
                >
                    <View style={styles.captureInner}></View>
                </TouchableOpacity>
            </View>

            <View style={styles.galleryContainer}>
                <TouchableOpacity style={styles.controlButton} onPress={openPhotoLibrary}>
                    <Entypo
                        name="folder-images"
                        size={20}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
        </CameraView>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
        borderRadius: 25,
        overflow: 'hidden',
    },
    controlsContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'column',
        alignItems: 'center',
    },
    topLeftContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    horizontalCenterContainer: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    galleryContainer: {
        position: 'absolute',
        bottom: 1,
        left: 10,
    },
    controlButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 50,
        padding: 12,
        marginVertical: 10,
    },
    captureContainer: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    videoModeText: {
        fontSize: 12,
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 25,
    },
    recordingDurationText: {
        fontSize: 12,
        color: 'white',
    },
    recordingButton: {
        borderWidth: 3,
        borderColor: 'red',
    },
});