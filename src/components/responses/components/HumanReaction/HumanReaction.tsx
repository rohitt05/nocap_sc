import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Animated,
    Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';
import {
    HumanReactionState,
    CapturedMedia,
    createPanResponder,
    capturePhoto,
    toggleCameraType,
} from './utils';

interface HumanReactionProps {
    isVisible: boolean;
    onClose: () => void;
    responseId: string;
    userId: string;
    onMediaCaptured: (mediaUri: string, mediaType: 'image') => void;
}

const HumanReaction: React.FC<HumanReactionProps> = ({
    isVisible,
    onClose,
    responseId,
    userId,
    onMediaCaptured,
}) => {
    const [permission, requestPermission] = useCameraPermissions();

    const [state, setState] = useState<HumanReactionState>({
        cameraType: 'front',
        flashMode: 'off',
        capturedMedia: null,
        showPreview: false,
    });

    const cameraRef = useRef<CameraView>(null);
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = createPanResponder(pan);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const handleCapturePhoto = async () => {
        const media = await capturePhoto(cameraRef, permission, requestPermission);
        if (media) {
            setState(prev => ({ ...prev, capturedMedia: media, showPreview: true }));
        }
    };

    const handlePost = () => {
        if (state.capturedMedia) {
            onMediaCaptured(state.capturedMedia.uri, 'image');
            onClose();
            resetPreviewState();
        }
    };

    const handleRetake = () => {
        resetPreviewState();
    };

    const resetPreviewState = () => {
        setState(prev => ({
            ...prev,
            capturedMedia: null,
            showPreview: false,
        }));
    };

    const handleClose = () => {
        resetPreviewState();
        onClose();
    };

    const handleToggleCameraType = () => {
        console.log('Camera flipped, current:', state.cameraType);
        setState(prev => ({ ...prev, cameraType: toggleCameraType(prev.cameraType) }));
    };

    if (!isVisible) return null;

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white' }}>Requesting camera permission...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white' }}>No access to camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={{ color: 'white' }}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.fullContainer}>
            {/* Close Button - Outside Camera */}
            <TouchableOpacity style={styles.externalCloseButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [{ translateX: pan.x }, { translateY: pan.y }],
                    },
                ]}
                {...panResponder.panHandlers}
            >
                <View style={styles.cameraContainer}>
                    {state.showPreview && state.capturedMedia ? (
                        // Preview Mode
                        <View style={styles.previewContainer}>
                            <Image
                                source={{ uri: state.capturedMedia.uri }}
                                style={[
                                    styles.previewImage,
                                    state.cameraType === 'front' && { transform: [{ scaleX: -1 }] }
                                ]}
                                resizeMode="cover"
                            />

                            {/* Retake button in preview */}
                            <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                                <MaterialIcons name="refresh" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Camera Mode
                        <CameraView
                            ref={cameraRef}
                            style={styles.camera}
                            facing={state.cameraType}
                            flash={state.flashMode}
                        />
                    )}
                </View>
            </Animated.View>

            {/* Controls - Camera controls or Post button */}
            {state.showPreview ? (
                // Post Button (when in preview mode)
                <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                    <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
            ) : (
                // Camera Controls (when in camera mode)
                <View style={styles.controlsCapsule}>
                    {/* Capture Button */}
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={handleCapturePhoto}
                    >
                        <MaterialIcons name="camera" size={28} color="white" />
                    </TouchableOpacity>

                    {/* Camera Flip Button */}
                    <TouchableOpacity
                        style={styles.flipButton}
                        onPress={handleToggleCameraType}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="flip-camera-ios" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default HumanReaction;