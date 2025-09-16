import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Alert,
    Dimensions,
    Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaData {
    uri: string;
    type: 'photo' | 'video';
    location: {
        latitude: number;
        longitude: number;
    };
}

interface BottomSheetCameraProps {
    visible: boolean;
    onClose: () => void;
    onMediaCaptured: (data: MediaData) => void;
    milestoneId: string;
}

const BottomSheetCamera: React.FC<BottomSheetCameraProps> = ({
    visible,
    onClose,
    onMediaCaptured,
}) => {
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

    const [facing, setFacing] = useState<CameraType>('back');
    const [flash, setFlash] = useState<'on' | 'off'>('off');
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);

    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        const requestPermissions = async () => {
            if (!cameraPermission?.granted) {
                await requestCameraPermission();
            }

            const mediaPermission = await MediaLibrary.requestPermissionsAsync();
            setHasMediaLibraryPermission(mediaPermission.status === 'granted');

            const locationPermission = await Location.requestForegroundPermissionsAsync();
            setHasLocationPermission(locationPermission.status === 'granted');

            if (locationPermission.status === 'granted') {
                try {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                    });
                    setCurrentLocation(location);
                } catch (error) {
                    console.warn('Location error:', error);
                }
            }
        };

        if (visible) {
            requestPermissions();
        }
    }, [visible, cameraPermission]);

    const takePicture = async (): Promise<void> => {
        if (!cameraRef.current || !currentLocation) return;

        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
                exif: true,
            });

            if (hasMediaLibraryPermission && photo?.uri) {
                await MediaLibrary.saveToLibraryAsync(photo.uri);
            }

            if (photo?.uri) {
                onMediaCaptured({
                    uri: photo.uri,
                    type: 'photo',
                    location: {
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                    },
                });
            }

            onClose();
        } catch (error) {
            console.error('Photo capture error:', error);
            Alert.alert('Error', 'Failed to take picture');
        }
    };

    const startRecording = async (): Promise<void> => {
        if (!cameraRef.current || !currentLocation || isRecording) return;

        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setIsRecording(true);

            const video = await cameraRef.current.recordAsync({
                maxDuration: 30,
            });

            if (hasMediaLibraryPermission && video?.uri) {
                await MediaLibrary.saveToLibraryAsync(video.uri);
            }

            if (video?.uri) {
                onMediaCaptured({
                    uri: video.uri,
                    type: 'video',
                    location: {
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                    },
                });
            }

            setIsRecording(false);
            onClose();
        } catch (error) {
            console.error('Video recording error:', error);
            Alert.alert('Error', 'Failed to record video');
            setIsRecording(false);
        }
    };

    const stopRecording = async (): Promise<void> => {
        if (!cameraRef.current || !isRecording) return;

        try {
            await cameraRef.current.stopRecording();
            setIsRecording(false);
        } catch (error) {
            console.error('Stop recording error:', error);
        }
    };

    const flipCamera = (): void => {
        setFacing(current => current === 'back' ? 'front' : 'back');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const toggleFlash = (): void => {
        setFlash(current => current === 'off' ? 'on' : 'off');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Loading state
    if (!cameraPermission || hasMediaLibraryPermission === null || hasLocationPermission === null) {
        return <View />;
    }

    // Permission denied states
    if (!cameraPermission.granted) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>Camera permission is required</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={requestCameraPermission}>
                        <Text style={styles.closeButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    if (hasLocationPermission === false) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>Location permission is required</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" statusBarTranslucent>
            <View style={styles.container}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={facing}
                    flash={flash}
                >
                    {/* Header Controls */}
                    <View style={styles.headerControls}>
                        <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                            <Ionicons
                                name={flash === 'on' ? "flash" : "flash-off"}
                                size={24}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Location Info */}
                    {currentLocation && (
                        <View style={styles.locationInfo}>
                            <Ionicons name="location" size={16} color="white" />
                            <Text style={styles.locationText}>
                                {currentLocation.coords.latitude.toFixed(4)}, {currentLocation.coords.longitude.toFixed(4)}
                            </Text>
                        </View>
                    )}

                    {/* Bottom Controls */}
                    <View style={styles.bottomControls}>
                        <TouchableOpacity style={styles.controlButton} onPress={flipCamera}>
                            <Ionicons name="camera-reverse" size={28} color="white" />
                        </TouchableOpacity>

                        <View style={styles.captureContainer}>
                            <TouchableOpacity
                                style={[styles.captureButton, styles.photoButton]}
                                onPress={takePicture}
                                disabled={isRecording}
                            >
                                <Ionicons name="camera" size={32} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.captureButton,
                                    styles.videoButton,
                                    isRecording && styles.recording,
                                ]}
                                onPress={isRecording ? stopRecording : startRecording}
                            >
                                <Ionicons
                                    name={isRecording ? "stop" : "videocam"}
                                    size={32}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.controlButton} />
                    </View>

                    {/* Recording Indicator */}
                    {isRecording && (
                        <View style={styles.recordingIndicator}>
                            <View style={styles.recordingDot} />
                            <Text style={styles.recordingText}>Recording...</Text>
                        </View>
                    )}
                </CameraView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    permissionText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginVertical: 5,
    },
    closeButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
    },
    headerControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
    },
    controlButton: {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationInfo: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 120 : 100,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'center',
    },
    locationText: {
        color: 'white',
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '500',
    },
    bottomControls: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    captureContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    photoButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    videoButton: {
        backgroundColor: 'rgba(255, 0, 0, 0.6)',
    },
    recording: {
        backgroundColor: 'red',
        transform: [{ scale: 1.1 }],
    },
    recordingIndicator: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 160 : 140,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
        marginRight: 8,
    },
    recordingText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default BottomSheetCamera;
