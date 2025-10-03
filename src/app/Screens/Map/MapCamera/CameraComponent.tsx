import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from "react";
import {
    View,
    TouchableOpacity,
    Text,
    PanResponder,
    Animated,
    Alert,
    Dimensions,
    TouchableWithoutFeedback,
    Image,
} from "react-native";
import {
    CameraView,
    CameraType,
    FlashMode,
    useCameraPermissions,
} from "expo-camera";
import {
    MaterialIcons,
    Ionicons,
    Entypo,
    MaterialCommunityIcons,
    FontAwesome,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import { styles } from "./styles";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface LocationData {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
}

interface MediaWithLocation {
    uri: string;
    type: "photo" | "video";
    location: LocationData | null;
    timestamp: number;
    id: string;
    isFrontCamera?: boolean;
}

interface CameraComponentProps {
    currentLocation: LocationData | null;
    onMediaCaptured: (mediaWithLocation: MediaWithLocation) => void;
    onOpenFolder: () => void;
    onOpenStories: () => void;
}

export interface CameraComponentRef {
    handleCaptureStart: () => void;
    handleCaptureEnd: () => void;
    isRecording: boolean;
    isCameraReady: boolean;
    recordingDuration: number;
    formatDuration: (seconds: number) => string;
}

const CameraComponent = forwardRef<CameraComponentRef, CameraComponentProps>(
    (
        { currentLocation, onMediaCaptured, onOpenFolder, onOpenStories },
        ref
    ) => {
        const [permission, requestPermission] = useCameraPermissions();
        const [audioPermission, setAudioPermission] = useState<boolean>(false);

        const [facing, setFacing] = useState<CameraType>("back");
        const [flashMode, setFlashMode] = useState<FlashMode>("off");
        const [zoom, setZoom] = useState(0);
        const [recordingDuration, setRecordingDuration] = useState(0);
        const [isCameraReady, setIsCameraReady] = useState(false);
        const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
        const [showFocusAnimation, setShowFocusAnimation] = useState(false);
        const [autofocus, setAutofocus] = useState<'on' | 'off'>('on');
        const [selectedTab, setSelectedTab] = useState<'snap' | 'video'>('snap');
        const [isRecording, setIsRecording] = useState(false);
        const [latestMedia, setLatestMedia] = useState<string | null>(null);

        // Label animation states
        const [showLabels, setShowLabels] = useState(true);
        const labelOpacity = useRef(new Animated.Value(1)).current;

        // Animation and gesture refs
        const focusAnimatedValue = useRef(new Animated.Value(1)).current;
        const focusOpacity = useRef(new Animated.Value(0)).current;
        const cameraOverlayOpacity = useRef(new Animated.Value(0)).current;
        const focusHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
        const zoomRef = useRef(0);
        const initialDistanceRef = useRef(0);
        const isZoomingRef = useRef(false);
        const lastZoomUpdateRef = useRef(0);
        const zoomUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
        const cameraRef = useRef<CameraView>(null);
        const recordingTimer = useRef<NodeJS.Timeout | null>(null);
        const captureScale = useRef(new Animated.Value(1)).current;

        // Fetch latest gallery media on mount
        useEffect(() => {
            const fetchLatestMedia = async () => {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status !== 'granted') return;
                const assets = await MediaLibrary.getAssetsAsync({
                    sortBy: 'creationTime',
                    mediaType: ['photo', 'video'],
                    first: 1,
                });
                if (assets.assets.length > 0) {
                    setLatestMedia(assets.assets[0].uri);
                }
            };
            fetchLatestMedia();
        }, []);

        // Animate and hide labels after 3 seconds
        useEffect(() => {
            if (showLabels) {
                setTimeout(() => {
                    Animated.timing(labelOpacity, {
                        toValue: 0,
                        duration: 700,
                        useNativeDriver: true,
                    }).start(() => setShowLabels(false));
                }, 3000);
            }
        }, [showLabels, labelOpacity]);

        // Focus animation
        const handleTapToFocus = useCallback(async (x: number, y: number) => {
            if (focusHideTimeoutRef.current) {
                clearTimeout(focusHideTimeoutRef.current);
            }
            setFocusPoint({ x, y });
            setShowFocusAnimation(true);
            setAutofocus('on');
            focusOpacity.setValue(1);
            focusAnimatedValue.setValue(1.2);
            cameraOverlayOpacity.setValue(0.1);

            Animated.parallel([
                Animated.spring(focusAnimatedValue, {
                    toValue: 1,
                    tension: 150,
                    friction: 10,
                    useNativeDriver: true,
                }),
                Animated.timing(cameraOverlayOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(focusOpacity, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ]).start();

            focusHideTimeoutRef.current = setTimeout(() => {
                setShowFocusAnimation(false);
                setFocusPoint(null);
            }, 1200);
        }, []);

        const handleTouchEnd = useCallback((event: any) => {
            if (!isCameraReady || isZoomingRef.current) return;
            const { locationX, locationY } = event.nativeEvent;
            handleTapToFocus(locationX, locationY);
        }, [isCameraReady, handleTapToFocus]);

        const updateZoomState = useCallback((newZoom: number) => {
            const now = Date.now();
            if (zoomUpdateTimeoutRef.current) {
                clearTimeout(zoomUpdateTimeoutRef.current);
            }
            if (now - lastZoomUpdateRef.current > 100) {
                setZoom(newZoom);
                lastZoomUpdateRef.current = now;
            } else {
                zoomUpdateTimeoutRef.current = setTimeout(() => {
                    setZoom(newZoom);
                    lastZoomUpdateRef.current = Date.now();
                }, 50);
            }
        }, []);

        const getDistance = (touches: any[]) => {
            if (touches.length < 2) return 0;
            const [touch1, touch2] = touches;
            const dx = touch1.pageX - touch2.pageX;
            const dy = touch1.pageY - touch2.pageY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const panResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
                onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
                onPanResponderGrant: (evt) => {
                    if (evt.nativeEvent.touches.length === 2) {
                        const distance = getDistance(evt.nativeEvent.touches);
                        initialDistanceRef.current = distance;
                        isZoomingRef.current = true;
                    }
                },
                onPanResponderMove: (evt) => {
                    if (evt.nativeEvent.touches.length === 2 && isZoomingRef.current) {
                        const distance = getDistance(evt.nativeEvent.touches);

                        if (initialDistanceRef.current > 0) {
                            const scale = distance / initialDistanceRef.current;
                            let newZoom = zoomRef.current;

                            if (scale > 1.05) {
                                newZoom = Math.min(zoomRef.current + 0.08, 1);
                                initialDistanceRef.current = distance;
                            } else if (scale < 0.95) {
                                newZoom = Math.max(zoomRef.current - 0.08, 0);
                                initialDistanceRef.current = distance;
                            }

                            if (newZoom !== zoomRef.current) {
                                zoomRef.current = newZoom;
                                updateZoomState(newZoom);
                            }
                        }
                    }
                },
                onPanResponderRelease: () => {
                    isZoomingRef.current = false;
                    initialDistanceRef.current = 0;
                    updateZoomState(zoomRef.current);
                },
                onPanResponderTerminate: () => {
                    isZoomingRef.current = false;
                    initialDistanceRef.current = 0;
                    updateZoomState(zoomRef.current);
                },
            })
        ).current;

        useEffect(() => {
            return () => {
                if (focusHideTimeoutRef.current) clearTimeout(focusHideTimeoutRef.current);
                if (zoomUpdateTimeoutRef.current) clearTimeout(zoomUpdateTimeoutRef.current);
            };
        }, []);

        const checkAudioPermission = async (): Promise<boolean> => {
            try {
                const { status } = await Audio.requestPermissionsAsync();
                const granted = status === 'granted';
                setAudioPermission(granted);
                return granted;
            } catch (error) {
                return false;
            }
        };

        const takePicture = async () => {
            if (!cameraRef.current || !isCameraReady) return;
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                    skipProcessing: false,
                    mirrorImage: false,
                });

                if (photo) {
                    const mediaWithLocation: MediaWithLocation = {
                        uri: photo.uri,
                        type: "photo",
                        location: currentLocation,
                        timestamp: Date.now(),
                        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        isFrontCamera: facing === "front",
                    };
                    onMediaCaptured(mediaWithLocation);
                }
            } catch (error) {
                Alert.alert("Error", "Failed to take picture");
            }
        };

        const handleVideoRecording = async () => {
            if (!cameraRef.current || !isCameraReady) return;
            if (!isRecording) {
                const hasAudioPermission = await checkAudioPermission();
                if (!hasAudioPermission) {
                    Alert.alert(
                        "Permission Required",
                        "Microphone permission is required for video recording"
                    );
                    return;
                }

                try {
                    setIsRecording(true);
                    const video = await cameraRef.current.recordAsync({
                        quality: "720p",
                        maxDuration: 60,
                        mute: false,
                        mirror: false,
                    });

                    if (video) {
                        const mediaWithLocation: MediaWithLocation = {
                            uri: video.uri,
                            type: "video",
                            location: currentLocation,
                            timestamp: Date.now(),
                            id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            isFrontCamera: facing === "front",
                        };
                        onMediaCaptured(mediaWithLocation);
                    }
                    setIsRecording(false);
                } catch (error) {
                    Alert.alert("Recording Error", "Failed to record video");
                    setIsRecording(false);
                }
            } else {
                if (cameraRef.current) {
                    cameraRef.current.stopRecording();
                    setIsRecording(false);
                }
            }
        };

        const handleCapturePress = () => {
            Animated.spring(captureScale, {
                toValue: 0.9,
                useNativeDriver: true,
            }).start();

            if (selectedTab === "snap") {
                takePicture();
            } else {
                handleVideoRecording();
            }

            setTimeout(() => {
                Animated.spring(captureScale, {
                    toValue: 1,
                    useNativeDriver: true,
                }).start();
            }, 150);
        };

        const handleTabSwitch = (tab: "snap" | "video") => {
            setSelectedTab(tab);
        };

        const resetZoom = () => {
            setZoom(0);
            zoomRef.current = 0;
        };

        const formatDuration = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        };

        useImperativeHandle(ref, () => ({
            handleCaptureStart: handleCapturePress,
            handleCaptureEnd: () => { },
            isRecording,
            isCameraReady,
            recordingDuration,
            formatDuration,
        }));

        const openMediaLibrary = async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert("Permission Required", "Camera roll access is required!");
                return;
            }

            let pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: false,
                quality: 1,
            });

            if (!pickerResult.canceled) {
                const selectedAsset = pickerResult.assets[0];
                const mediaWithLocation: MediaWithLocation = {
                    uri: selectedAsset.uri,
                    type: selectedAsset.type === "video" ? "video" : "photo",
                    location: null,
                    timestamp: Date.now(),
                    id: `gallery_${Date.now()}`,
                    isFrontCamera: false,
                };
                onMediaCaptured(mediaWithLocation);
            }

            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === "granted") {
                const assets = await MediaLibrary.getAssetsAsync({
                    sortBy: "creationTime",
                    mediaType: ["photo", "video"],
                    first: 1,
                });
                if (assets.assets.length > 0) {
                    setLatestMedia(assets.assets[0].uri);
                }
            }
        };

        useEffect(() => {
            checkAudioPermission();
        }, []);

        useEffect(() => {
            zoomRef.current = zoom;
        }, [zoom]);

        useEffect(() => {
            if (isRecording) {
                setRecordingDuration(0);
                recordingTimer.current = setInterval(() => {
                    setRecordingDuration((prev) => prev + 1);
                }, 1000);

                return () => {
                    if (recordingTimer.current) {
                        clearInterval(recordingTimer.current);
                    }
                };
            } else {
                if (recordingTimer.current) {
                    clearInterval(recordingTimer.current);
                }
                setRecordingDuration(0);
            }
        }, [isRecording]);

        const handleCameraReady = () => {
            setIsCameraReady(true);
        };

        const toggleCameraFacing = () => {
            if (!isRecording) {
                setFacing((current) => (current === "back" ? "front" : "back"));
                resetZoom();
            }
        };

        const toggleFlashMode = () => {
            setFlashMode((current) => {
                switch (current) {
                    case "off":
                        return "on";
                    case "on":
                        return "auto";
                    case "auto":
                        return "off";
                    default:
                        return "off";
                }
            });
        };

        const getFlashIconName = (): string => {
            switch (flashMode) {
                case "off":
                    return "flash-off";
                case "on":
                    return "flash-on";
                case "auto":
                    return "flash-auto";
                default:
                    return "flash-off";
            }
        };

        if (!permission) {
            return (
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>Loading camera...</Text>
                </View>
            );
        }

        if (!permission.granted) {
            return (
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>Camera access is required</Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.cameraWrapper} {...panResponder.panHandlers}>
                <TouchableWithoutFeedback onPress={handleTouchEnd}>
                    <View style={styles.cameraContainer}>
                        <CameraView
                            ref={cameraRef}
                            style={styles.camera}
                            facing={facing}
                            flash={flashMode}
                            zoom={zoom}
                            mode={selectedTab === "snap" ? "picture" : "video"}
                            autofocus={autofocus}
                            onCameraReady={handleCameraReady}
                        />
                        <Animated.View
                            style={[
                                styles.cameraOverlay,
                                {
                                    opacity: cameraOverlayOpacity,
                                    backgroundColor: "white",
                                },
                            ]}
                        />
                    </View>
                </TouchableWithoutFeedback>

                {showFocusAnimation && focusPoint && (
                    <Animated.View
                        style={[
                            styles.iphoneFocusIndicator,
                            {
                                left: focusPoint.x - 30,
                                top: focusPoint.y - 30,
                                opacity: focusOpacity,
                                transform: [{ scale: focusAnimatedValue }],
                            },
                        ]}
                    >
                        <View style={styles.iphoneFocusBox}>
                            <View style={styles.iphoneFocusCornerTL} />
                            <View style={styles.iphoneFocusCornerTR} />
                            <View style={styles.iphoneFocusCornerBL} />
                            <View style={styles.iphoneFocusCornerBR} />
                        </View>
                    </Animated.View>
                )}

                {!isCameraReady && (
                    <View style={styles.loadingOverlay}>
                        <Text style={styles.loadingText}>Camera Loading...</Text>
                    </View>
                )}

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        onPress={() => handleTabSwitch("snap")}
                        style={styles.tabButton}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, selectedTab === "snap" && styles.tabTextSelected]}>
                            Snap
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.tabSeparator}>|</Text>
                    <TouchableOpacity
                        onPress={() => handleTabSwitch("video")}
                        style={styles.tabButton}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, selectedTab === "video" && styles.tabTextSelected]}>
                            Video
                        </Text>
                    </TouchableOpacity>
                </View>

                {selectedTab === "video" && isRecording && (
                    <View style={styles.recordingIndicator}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.recordingText}>{formatDuration(recordingDuration)}</Text>
                    </View>
                )}

                {/* Right Controls - All perfectly right-aligned */}
                <View style={styles.rightControls}>
                    <View style={styles.rightControlsRow}>
                        <TouchableOpacity style={styles.sideButton} onPress={toggleFlashMode} activeOpacity={0.6}>
                            <MaterialIcons name={getFlashIconName()} size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rightControlsRow}>
                        <TouchableOpacity
                            style={styles.sideButton}
                            onPress={toggleCameraFacing}
                            activeOpacity={0.6}
                            disabled={isRecording}
                        >
                            <Ionicons name="camera-reverse" size={22} color={isRecording ? "rgba(255,255,255,0.4)" : "white"} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rightControlsRow}>
                        {showLabels && (
                            <Animated.Text style={[styles.iconLabel, { opacity: labelOpacity }]}>
                                My Friends
                            </Animated.Text>
                        )}
                        <TouchableOpacity style={styles.folderIconButton} onPress={onOpenFolder} activeOpacity={0.6}>
                            <FontAwesome name="users" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rightControlsRow}>
                        {showLabels && (
                            <Animated.Text style={[styles.iconLabel, { opacity: labelOpacity }]}>
                                My Story
                            </Animated.Text>
                        )}
                        <TouchableOpacity style={styles.sideButton} onPress={onOpenStories} activeOpacity={0.6}>
                            <MaterialCommunityIcons name="shape-circle-plus" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom left gallery */}
                <TouchableOpacity style={styles.galleryButton} onPress={openMediaLibrary} activeOpacity={0.8}>
                    {latestMedia ? (
                        <Image
                            source={{ uri: latestMedia }}
                            style={{ width: 36, height: 36, borderRadius: 7 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Entypo name="folder-images" size={22} color="white" />
                    )}
                </TouchableOpacity>

                {zoom > 0 && (
                    <TouchableOpacity onPress={resetZoom} style={styles.zoomIndicator} activeOpacity={0.8}>
                        <Text style={styles.zoomText}>{(zoom * 10 + 1).toFixed(1)}x</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }
);

export default CameraComponent;
