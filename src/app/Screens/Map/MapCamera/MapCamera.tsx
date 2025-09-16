import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    Modal,
    StatusBar,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ ADD THIS
import Map from '../Map';
import BottomSheetMap from '../BottomSheetMap';
import CameraComponent, { CameraComponentRef } from './CameraComponent';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LocationData {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
}

interface MediaWithLocation {
    uri: string;
    type: 'photo' | 'video';
    location: LocationData | null;
    timestamp: number;
    id: string;
    isFrontCamera?: boolean;
    albumLocation?: LocationData;
    isAlbumMedia?: boolean;
}

const MapCamera: React.FC = () => {
    const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
    const insets = useSafeAreaInsets(); // ✅ ADD THIS

    const [previewVisible, setPreviewVisible] = useState(false);
    const [capturedMediaUri, setCapturedMediaUri] = useState<string | null>(null);
    const [capturedMediaType, setCapturedMediaType] = useState<'photo' | 'video' | null>(null);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [storiesVisible, setStoriesVisible] = useState(false);

    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
    const [capturedMediaWithLocation, setCapturedMediaWithLocation] = useState<MediaWithLocation | null>(null);

    const [isAlbumCreationMode, setIsAlbumCreationMode] = useState(false);
    const [albumLocation, setAlbumLocation] = useState<LocationData | null>(null);

    const cameraComponentRef = useRef<CameraComponentRef>(null);
    const captureScale = useRef(new Animated.Value(1)).current;

    const handleLocationUpdate = useCallback((location: LocationData) => {
        setCurrentLocation(prevLocation => {
            if (!prevLocation ||
                Math.abs(prevLocation.latitude - location.latitude) > 0.0005 ||
                Math.abs(prevLocation.longitude - location.longitude) > 0.0005) {
                return location;
            }
            return prevLocation;
        });
    }, []);

    const handleCreateAlbumFromMap = useCallback((location: LocationData) => {
        setIsAlbumCreationMode(true);
        setAlbumLocation(location);
    }, []);

    const handleMediaCaptured = (mediaWithLocation: MediaWithLocation) => {
        if (isAlbumCreationMode && albumLocation) {
            const albumMedia: MediaWithLocation = {
                ...mediaWithLocation,
                albumLocation: albumLocation,
                isAlbumMedia: true
            };
            setCapturedMediaWithLocation(albumMedia);
        } else {
            setCapturedMediaWithLocation(mediaWithLocation);
        }
        
        setCapturedMediaUri(mediaWithLocation.uri);
        setCapturedMediaType(mediaWithLocation.type);
        setPreviewVisible(true);
    };

    const openFullScreenMap = useCallback(() => {
        setMapModalVisible(true);
    }, []);

    const closeFullScreenMap = useCallback(() => {
        setMapModalVisible(false);
    }, []);

    const handleOpenFolder = () => {
        console.log('🗂️ Opening Friends Glimpse folder...');
        setBottomSheetVisible(true);
    };

    const handleOpenStories = () => {
        console.log('📚 Opening My Stories...');
        // Close other modals first to prevent conflicts
        setBottomSheetVisible(false);
        setPreviewVisible(false);
        setMapModalVisible(false); // ✅ Also close map modal
        
        // Small delay to ensure other modals are closed
        setTimeout(() => {
            setStoriesVisible(true);
        }, 100);
    };

    const handleBottomSheetClose = () => {
        console.log('🗂️ Closing Friends Glimpse...');
        setBottomSheetVisible(false);
    };

    const handleStoriesClose = () => {
        console.log('📚 Closing My Stories...');
        setStoriesVisible(false);
    };

    const handlePreviewClose = () => {
        setPreviewVisible(false);
        setCapturedMediaUri(null);
        setCapturedMediaType(null);
        setCapturedMediaWithLocation(null);
    };

    const handleCaptureStart = () => {
        Animated.spring(captureScale, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();

        if (cameraComponentRef.current) {
            cameraComponentRef.current.handleCaptureStart();
        }
    };

    const handleCaptureEnd = () => {
        Animated.spring(captureScale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();

        if (cameraComponentRef.current) {
            cameraComponentRef.current.handleCaptureEnd();
        }
    };

    useEffect(() => {
        (async () => {
            if (!mediaLibraryPermission?.granted) {
                await requestMediaLibraryPermission();
            }
        })();
    }, []);

    const isRecording = cameraComponentRef.current?.isRecording || false;
    const isCameraReady = cameraComponentRef.current?.isCameraReady || false;

    const SmallMapComponent = useMemo(() => (
        <Map 
            onLocationUpdate={handleLocationUpdate}
            zoomLevel={14}
            isFullScreen={false}
        />
    ), [handleLocationUpdate]);

    const FullScreenMapComponent = useMemo(() => (
        <Map
            onLocationUpdate={handleLocationUpdate}
            isFullScreen={true}
            onClose={closeFullScreenMap}
            onCreateAlbum={handleCreateAlbumFromMap}
        />
    ), [handleLocationUpdate, handleCreateAlbumFromMap]);

    // Debug modal states
    console.log('🔍 Modal States:', {
        previewVisible,
        bottomSheetVisible,
        storiesVisible,
        mapModalVisible
    });

    return (
        <View style={styles.container}>
            {/* ✅ UPDATED: StatusBar configuration */}
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="transparent" 
                translucent 
            />

            {isAlbumCreationMode && albumLocation && (
                <View style={[styles.albumModeIndicator, { top: insets.top + 10 }]}>
                    <Text style={styles.albumModeText}>
                        📸 Creating Album at {albumLocation.latitude.toFixed(4)}, {albumLocation.longitude.toFixed(4)}
                    </Text>
                    <TouchableOpacity 
                        style={styles.exitAlbumMode}
                        onPress={() => {
                            setIsAlbumCreationMode(false);
                            setAlbumLocation(null);
                        }}
                    >
                        <Text style={styles.exitAlbumModeText}>✕</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.cameraSection}>
                <CameraComponent
                    ref={cameraComponentRef}
                    currentLocation={currentLocation}
                    onMediaCaptured={handleMediaCaptured}
                    onOpenFolder={handleOpenFolder}
                    onOpenStories={handleOpenStories}
                />
            </View>

            <View style={styles.bottomSection}>
                <View style={styles.bottomControlsContainer}>
                    <TouchableOpacity
                        style={styles.mapSection}
                        onPress={openFullScreenMap}
                        activeOpacity={0.8}
                    >
                        <View style={styles.rectangularMapContainer}>
                            {SmallMapComponent}
                        </View>
                    </TouchableOpacity>

                    <View style={styles.captureSection}>
                        <Animated.View style={{ transform: [{ scale: captureScale }] }}>
                            <TouchableOpacity
                                style={[
                                    styles.captureButton,
                                    isRecording && styles.captureButtonRecording,
                                    !isCameraReady && styles.captureButtonDisabled,
                                ]}
                                onPressIn={handleCaptureStart}
                                onPressOut={handleCaptureEnd}
                                activeOpacity={1}
                                disabled={!isCameraReady}
                            >
                                <View
                                    style={[styles.captureButtonInner, isRecording && styles.captureButtonInnerRecording]}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            </View>

            {/* Full Screen Map Modal */}
            <Modal
                animationType="slide"
                visible={mapModalVisible}
                transparent={false}
                onRequestClose={closeFullScreenMap}
                presentationStyle="fullScreen"
            >
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <View style={styles.fullScreenMapContainer}>
                    {FullScreenMapComponent}
                </View>
            </Modal>

            {/* ✅ UPDATED: Media Preview Modal with proper StatusBar handling */}
            {previewVisible && (
                <BottomSheetMap
                    visible={previewVisible}
                    onClose={handlePreviewClose}
                    mediaUri={capturedMediaUri}
                    mediaType={capturedMediaType}
                    mediaWithLocation={capturedMediaWithLocation}
                    mode="media"
                />
            )}

            {/* ✅ UPDATED: Friends Folder Modal with proper StatusBar handling */}
            {bottomSheetVisible && (
                <BottomSheetMap
                    visible={bottomSheetVisible}
                    onClose={handleBottomSheetClose}
                    mediaUri={null}
                    mediaType={null}
                    mediaWithLocation={null}
                    mode="friends"
                />
            )}

            {/* ✅ UPDATED: Stories Modal with proper StatusBar handling */}
            {storiesVisible && (
                <BottomSheetMap
                    visible={storiesVisible}
                    onClose={handleStoriesClose}
                    mediaUri={null}
                    mediaType={null}
                    mediaWithLocation={null}
                    mode="stories"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    albumModeIndicator: {
        position: 'absolute',
        alignSelf: 'center',
        width: '55%',
        backgroundColor: 'rgba(0, 122, 255, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    albumModeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
        flex: 1,
    },
    exitAlbumMode: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    exitAlbumModeText: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
    },
    cameraSection: {
        flex: 1,
        padding: 5,
        paddingTop: 25,
        paddingBottom: 10,
    },
    bottomSection: {
        backgroundColor: '#000',
        paddingHorizontal: 5,
        paddingBottom: 10,
    },
    bottomControlsContainer: {
        height: 160,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
        backgroundColor: '#000',
        borderRadius: 25,
        paddingVertical: 10,
    },
    mapSection: {
        flex: 3,
        height: 160,
    },
    rectangularMapContainer: {
        flex: 1,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    captureSection: {
        flex: 1,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 85,
        height: 85,
        borderRadius: 42.5,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 3,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 10,
    },
    captureButtonRecording: {
        borderColor: '#FF0000',
        backgroundColor: 'rgba(255, 0, 0, 0.2)'
    },
    captureButtonDisabled: {
        borderColor: 'rgba(255,255,255,0.4)',
        backgroundColor: 'rgba(128, 128, 128, 0.2)',
        opacity: 0.6
    },
    captureButtonInner: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: 'white'
    },
    captureButtonInnerRecording: {
        backgroundColor: '#FF0000',
        borderRadius: 8,
        width: 38,
        height: 38
    },
    fullScreenMapContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
});

export default MapCamera;
