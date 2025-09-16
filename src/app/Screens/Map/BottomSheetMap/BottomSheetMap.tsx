// BottomSheetMap.tsx - Updated with Better Spacing for Stories Mode
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, Pressable, Image, StatusBar, TextInput, TouchableOpacity, Alert, Switch, StyleSheet } from 'react-native';
import { MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';
import { Video, AVPlaybackStatus } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FriendsGlimpse from './FriendsGlimpse';
import MyStories from './MyStories';
import AlbumNamingModal from './AlbumNamingModal';

// Import your custom MapboxGL wrapper
import MapboxGL from '../../../../../MapboxGL';

// Local imports
import { styles, screenHeight } from './styles';
import {
    uploadMediaToStorageBucket,
    createStoryInDatabase,
    createAlbumInDatabase,
    addMediaToExistingAlbum,
    getLocationNameFromCoordinates,
    formatTime,
    generateMediaId,
    determineContentMode,
    getMediaInfo,
    getCurrentUser,
} from './utils';
import { supabase } from '../../../../../lib/supabase';

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number;
}

interface MediaWithLocation {
    uri: string;
    type: 'photo' | 'video';
    location: LocationData | null;
    timestamp: number;
    id: string;
}

interface BottomSheetMapProps {
    visible: boolean;
    onClose: () => void;
    mediaUri: string | null;
    mediaType: 'photo' | 'video' | null;
    mediaWithLocation: MediaWithLocation | null;
    mode?: 'media' | 'friends' | 'stories';
    onAlbumCreated?: () => void;
}

const BottomSheetMap: React.FC<BottomSheetMapProps> = ({
    visible,
    onClose,
    mediaUri,
    mediaType,
    mediaWithLocation,
    mode = 'media',
    onAlbumCreated
}) => {
    // State management
    const [showDropdown, setShowDropdown] = useState(false);
    const [caption, setCaption] = useState('');
    const [locationName, setLocationName] = useState<string>('Getting location...');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isLocationEnabled, setIsLocationEnabled] = useState(true);

    // Mapbox token state management
    const [mapboxToken, setMapboxToken] = useState<string | null>(null);
    const [tokenReady, setTokenReady] = useState(false);

    // Loading states for database operations
    const [isCreatingStory, setIsCreatingStory] = useState(false);
    const [isProcessingAlbum, setIsProcessingAlbum] = useState(false);

    // Album modal states with enhanced functionality
    const [showAlbumModal, setShowAlbumModal] = useState(false);

    // Video player states
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const videoRef = useRef<Video>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Mapbox token from your wrapper
    useEffect(() => {
        const initializeMapboxToken = async () => {
            try {
                console.log('🗺️ Initializing Mapbox token from MapboxGL wrapper...');

                const token =
                    process.env.MAPBOX_DOWNLOAD_TOKEN ||
                    process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
                    process.env.MAPBOX_ACCESS_TOKEN;

                if (token && token.startsWith('sk.')) {
                    console.log('✅ Secret token found for location services');
                    setMapboxToken(token);
                    setTokenReady(true);
                } else if (token && token.startsWith('pk.')) {
                    console.warn('⚠️ Found public token, but need secret token for location services');
                    setTokenReady(true);
                    setMapboxToken(token);
                } else {
                    console.error('❌ No valid Mapbox token found');
                    setTokenReady(true);
                }
            } catch (error) {
                console.error('❌ Error initializing Mapbox token:', error);
                setTokenReady(true);
            }
        };

        if (visible) {
            initializeMapboxToken();
        }
    }, [visible]);

    // Determine content mode and media info
    const contentMode = determineContentMode(mode, mediaUri, mediaType);
    const mediaInfo = getMediaInfo(contentMode, mediaWithLocation, mediaUri, mediaType);

    // Auto-hide controls after 3 seconds
    const resetControlsTimeout = () => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        setShowControls(true);
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    // Handle video playback status updates
    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setIsMuted(status.isMuted);
            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);
            setIsLoading(false);

            if (status.didJustFinish && !status.isLooping) {
                videoRef.current?.replayAsync();
            }
        } else if (status.error) {
            console.error('Video playback error:', status.error);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    };

    // Toggle play/pause
    const togglePlayPause = async () => {
        if (!videoRef.current) return;
        resetControlsTimeout();
        if (isPlaying) {
            await videoRef.current.pauseAsync();
        } else {
            await videoRef.current.playAsync();
        }
    };

    // Toggle mute/unmute
    const toggleMute = async () => {
        if (!videoRef.current) return;
        resetControlsTimeout();
        await videoRef.current.setIsMutedAsync(!isMuted);
    };

    // Handle video container tap to show/hide controls
    const handleVideoTap = () => {
        if (showControls) {
            setShowControls(false);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        } else {
            resetControlsTimeout();
        }
    };

    // Clean up video timers on unmount
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    // Reset video state when modal opens/closes
    useEffect(() => {
        if (visible && mediaInfo?.type === 'video') {
            setIsPlaying(false);
            setPosition(0);
            resetControlsTimeout();
        }
    }, [visible, mediaInfo?.type]);

    // Get location name with proper token management
    useEffect(() => {
        const fetchLocationName = async () => {
            if (visible && mediaWithLocation?.location && tokenReady && isLocationEnabled) {
                const { latitude, longitude } = mediaWithLocation.location;
                console.log(`🎯 Getting location name for: ${latitude}, ${longitude}`);

                setIsLoadingLocation(true);
                try {
                    if (mapboxToken) {
                        console.log(`🗺️ Using Mapbox token (${mapboxToken.startsWith('sk.') ? 'SECRET' : 'PUBLIC'}) for location lookup`);
                        const name = await getLocationNameFromCoordinates(latitude, longitude, mapboxToken);
                        setLocationName(name);
                        console.log('✅ Location name retrieved:', name);
                    } else {
                        console.warn('⚠️ No Mapbox token available, using fallback location');
                        setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                } catch (error) {
                    console.error('❌ Error getting location name:', error);
                    setLocationName('Location unavailable');
                } finally {
                    setIsLoadingLocation(false);
                }
            } else if (!tokenReady) {
                setLocationName('Initializing location services...');
            } else if (!mapboxToken) {
                setLocationName('Location services unavailable');
            } else if (!isLocationEnabled) {
                setLocationName('Location disabled');
            } else {
                setLocationName('No location data');
            }
        };

        fetchLocationName();
    }, [visible, mediaWithLocation?.location, isLocationEnabled, tokenReady, mapboxToken]);

    // Create media data when media is selected from library
    useEffect(() => {
        if (visible && mediaUri && mediaType && !mediaWithLocation) {
            console.log('📚 Library media selected, creating mediaWithLocation object');
            setLocationName('No location data');
            setIsLocationEnabled(false);
        }
    }, [visible, mediaUri, mediaType, mediaWithLocation]);

    // Handle Share function
    const handleShare = async () => {
        if (!mediaInfo?.uri) return;

        try {
            setIsCreatingStory(true);
            console.log('📱 Starting story creation process...');

            // Upload media to storage bucket
            const mediaPath = await uploadMediaToStorageBucket(mediaInfo.uri, mediaInfo.type);
            console.log('📤 Media uploaded to path:', mediaPath);

            // Create story in database
            await createStoryInDatabase(
                mediaPath,
                mediaInfo.type,
                caption,
                mediaInfo.hasLocation ? mediaWithLocation?.location || null : null,
                locationName,
                isLocationEnabled && mediaInfo.hasLocation
            );

            Alert.alert('Success', 'Your story has been shared!');
            setShowDropdown(false);
            onClose();

        } catch (error) {
            console.error('❌ Error sharing story:', error);
            Alert.alert('Error', `Failed to share your story: ${error.message}`);
        } finally {
            setIsCreatingStory(false);
        }
    };

    // Handle Create Album button press (shows enhanced modal)
    const handleCreateAlbum = () => {
        console.log('📸 Create Album button clicked!');

        if (!mediaInfo?.uri || !mediaWithLocation?.location) {
            console.log('❌ Missing required data for album creation');
            Alert.alert('Error', 'Location data is required to create an album');
            return;
        }

        setShowAlbumModal(true);
    };

    // Handle creating a new album from enhanced modal
    const handleCreateNewAlbum = async (albumName: string) => {
        try {
            setIsProcessingAlbum(true);
            console.log('📸 Creating new album with name:', albumName);

            // Upload media to storage bucket
            const mediaPath = await uploadMediaToStorageBucket(mediaInfo!.uri, mediaInfo!.type);
            console.log('📤 Album media uploaded to path:', mediaPath);

            // Create album in database
            await createAlbumInDatabase(
                mediaPath,
                mediaInfo!.type,
                caption,
                mediaWithLocation!.location!,
                locationName,
                albumName
            );

            // Trigger map refresh via callback
            if (onAlbumCreated) {
                console.log('📂 Triggering map refresh for new album...');
                onAlbumCreated();
            }

            // Close modals and show success
            setShowAlbumModal(false);
            Alert.alert('Success', `Album "${albumName}" has been created and will appear on the map!`);
            onClose();

        } catch (error) {
            console.error('❌ Error creating album:', error);
            Alert.alert('Error', `Failed to create album: ${error.message}`);
        } finally {
            setIsProcessingAlbum(false);
        }
    };

    // Handle adding media to existing album from enhanced modal
    const handleAddToExistingAlbum = async (albumId: string, albumName: string) => {
        try {
            setIsProcessingAlbum(true);
            console.log('📸 Adding media to existing album:', albumName);

            // Upload media to storage bucket
            const mediaPath = await uploadMediaToStorageBucket(mediaInfo!.uri, mediaInfo!.type);
            console.log('📤 Media uploaded to path:', mediaPath);

            // Add media to existing album
            await addMediaToExistingAlbum(
                albumId,
                mediaPath,
                mediaInfo!.type,
                caption,
                mediaWithLocation!.location!,
                locationName
            );

            // Trigger map refresh via callback
            if (onAlbumCreated) {
                console.log('📂 Triggering map refresh for updated album...');
                onAlbumCreated();
            }

            // Close modals and show success
            setShowAlbumModal(false);
            Alert.alert('Success', `Media added to "${albumName}" album!`);
            onClose();

        } catch (error) {
            console.error('❌ Error adding media to album:', error);
            Alert.alert('Error', `Failed to add media to album: ${error.message}`);
        } finally {
            setIsProcessingAlbum(false);
        }
    };

    // Close album modal
    const handleCloseAlbumModal = () => {
        setShowAlbumModal(false);
    };

    // Keep handleSave for backwards compatibility
    const handleSave = async () => {
        if (!mediaInfo?.uri) return;

        try {
            await MediaLibrary.saveToLibraryAsync(mediaInfo.uri);

            const existingMedia = await AsyncStorage.getItem('capturedMedia');
            const mediaArray = existingMedia ? JSON.parse(existingMedia) : [];

            const mediaDataWithCaption = {
                uri: mediaInfo.uri,
                type: mediaInfo.type,
                location: mediaInfo.hasLocation ? mediaWithLocation?.location : null,
                timestamp: Date.now(),
                id: generateMediaId(),
                caption: caption.trim(),
                locationName: mediaInfo.hasLocation && isLocationEnabled ? locationName : null,
                isLocationEnabled: mediaInfo.hasLocation ? isLocationEnabled : false,
                savedAt: Date.now(),
                isFromCapture: mediaInfo.isFromCapture,
            };

            mediaArray.push(mediaDataWithCaption);
            await AsyncStorage.setItem('capturedMedia', JSON.stringify(mediaArray));

            Alert.alert('Success', 'Media saved to device successfully!');
            setShowDropdown(false);
            onClose();
        } catch (error) {
            console.error('Error saving media:', error);
            Alert.alert('Error', 'Failed to save media');
        }
    };

    const handleDiscard = () => {
        setShowDropdown(false);
        setCaption('');
        onClose();
    };

    const handleDotsPress = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLocationToggle = (value: boolean) => {
        setIsLocationEnabled(value);
        console.log('📍 Location toggle:', value ? 'ON' : 'OFF');
    };

    return (
        <>
            <Modal
                animationType="slide"
                visible={visible}
                transparent={true}
                onRequestClose={onClose}
                presentationStyle="overFullScreen"
            >
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.topSection} onPress={onClose} />

                    <View style={[
                        styles.bottomSheet,
                        { height: contentMode === 'stories' ? screenHeight * 0.96 : screenHeight * 0.98 }
                    ]}>

                        {/* ✅ CONDITIONAL: Only show drag indicator when NOT in stories mode */}
                        {contentMode !== 'stories' && (
                            <View style={styles.dragIndicator} />
                        )}

                        {(() => {
                            if (contentMode === 'stories') {
                                return (
                                    <>
                                        {/* ✅ UPDATED: More compact header with better left alignment */}
                                        <View style={storiesStyles.storiesHeaderContainer}>
                                            <Text style={storiesStyles.storiesHeaderText}>Glimpse of my day</Text>
                                        </View>
                                        {/* ✅ UPDATED: MyStories with reduced top margin */}
                                        <View style={storiesStyles.storiesContentContainer}>
                                            <MyStories onCreateFirstStory={onClose} />
                                        </View>
                                    </>
                                );
                            }

                            if (contentMode === 'media' && mediaInfo) {
                                return (
                                    <>
                                        <View style={styles.header}>
                                            <Text style={styles.headerText}>Share Your Glimpse</Text>
                                        </View>

                                        {/* Location Info Section */}
                                        {mediaInfo.hasLocation && mediaWithLocation?.location && (
                                            <View style={styles.locationInfoContainer}>
                                                {isLocationEnabled && (
                                                    <View style={styles.previewLocationInfo}>
                                                        <Entypo name="location" size={16} color="#fff" />
                                                        <Text style={styles.previewLocationText}>
                                                            {isLoadingLocation ? 'Getting location...' : locationName}
                                                        </Text>
                                                        {!tokenReady && (
                                                            <Text style={[styles.previewLocationText, { fontSize: 10, color: '#666' }]}>
                                                                (initializing...)
                                                            </Text>
                                                        )}
                                                    </View>
                                                )}

                                                {!isLocationEnabled && (
                                                    <View style={styles.previewLocationInfo}>
                                                        <Entypo name="location-pin" size={16} color="#666" />
                                                        <Text style={styles.previewLocationTextDisabled}>
                                                            Location disabled
                                                        </Text>
                                                    </View>
                                                )}

                                                <View style={styles.rightControls}>
                                                    <View style={styles.switchContainer}>
                                                        <Switch
                                                            value={isLocationEnabled}
                                                            onValueChange={handleLocationToggle}
                                                            thumbColor={isLocationEnabled ? '#fff' : '#666'}
                                                            trackColor={{ false: '#333', true: '#333' }}
                                                            style={styles.locationSwitch}
                                                        />
                                                    </View>

                                                    <TouchableOpacity onPress={handleDotsPress} style={styles.dotsButton}>
                                                        <Entypo name="dots-two-horizontal" size={20} color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                        {/* Gallery media indicator */}
                                        {!mediaInfo.hasLocation && (
                                            <View style={styles.locationInfoContainer}>
                                                <View style={styles.previewLocationInfo}>
                                                    <Entypo name="image" size={16} color="#666" />
                                                    <Text style={styles.previewLocationTextDisabled}>
                                                        From Gallery
                                                    </Text>
                                                </View>

                                                <View style={styles.rightControls}>
                                                    <TouchableOpacity onPress={handleDotsPress} style={styles.dotsButton}>
                                                        <Entypo name="dots-two-horizontal" size={20} color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                        {/* Dropdown Menu */}
                                        {showDropdown && (
                                            <View style={styles.dropdown}>
                                                <TouchableOpacity onPress={handleSave} style={styles.dropdownItem}>
                                                    <Text style={styles.dropdownText}>Save to Device</Text>
                                                </TouchableOpacity>
                                                <View style={styles.dropdownDivider} />
                                                <TouchableOpacity onPress={handleDiscard} style={styles.dropdownItem}>
                                                    <Text style={styles.dropdownText}>Discard</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {/* Media Container */}
                                        <View style={styles.mediaContainer}>
                                            {mediaInfo.type === 'photo' ? (
                                                <Image
                                                    source={{ uri: mediaInfo.uri }}
                                                    style={styles.previewMedia}
                                                    resizeMode="cover"
                                                />
                                            ) : mediaInfo.type === 'video' ? (
                                                <TouchableOpacity
                                                    style={styles.videoContainer}
                                                    onPress={handleVideoTap}
                                                    activeOpacity={1}
                                                >
                                                    <Video
                                                        ref={videoRef}
                                                        source={{ uri: mediaInfo.uri }}
                                                        style={styles.previewMedia}
                                                        resizeMode="cover"
                                                        shouldPlay={false}
                                                        isLooping={true}
                                                        isMuted={isMuted}
                                                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                                    />

                                                    {/* VIDEO CONTROLS */}
                                                    {showControls && (
                                                        <>
                                                            <View style={styles.centerControls}>
                                                                <TouchableOpacity
                                                                    style={styles.playPauseButton}
                                                                    onPress={togglePlayPause}
                                                                    activeOpacity={0.8}
                                                                >
                                                                    <Ionicons
                                                                        name={isPlaying ? "pause" : "play"}
                                                                        size={40}
                                                                        color="rgba(255, 255, 255, 0.9)"
                                                                    />
                                                                </TouchableOpacity>
                                                            </View>

                                                            <View style={styles.bottomVideoControls}>
                                                                <View style={styles.timeContainer}>
                                                                    <Text style={styles.timeText}>
                                                                        {formatTime(position)} / {formatTime(duration)}
                                                                    </Text>
                                                                </View>

                                                                <TouchableOpacity
                                                                    style={styles.muteButton}
                                                                    onPress={toggleMute}
                                                                    activeOpacity={0.8}
                                                                >
                                                                    <Ionicons
                                                                        name={isMuted ? "volume-mute" : "volume-high"}
                                                                        size={20}
                                                                        color="rgba(255, 255, 255, 0.9)"
                                                                    />
                                                                </TouchableOpacity>
                                                            </View>

                                                            <View style={styles.progressContainer}>
                                                                <View style={styles.progressBar}>
                                                                    <View
                                                                        style={[
                                                                            styles.progressFill,
                                                                            { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }
                                                                        ]}
                                                                    />
                                                                </View>
                                                            </View>
                                                        </>
                                                    )}

                                                    {isLoading && (
                                                        <View style={styles.loadingContainer}>
                                                            <MaterialIcons name="refresh" size={30} color="white" />
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            ) : null}
                                        </View>

                                        {/* Caption Box */}
                                        <View style={styles.captionContainer}>
                                            <TextInput
                                                style={styles.captionInput}
                                                placeholder="wanna say something?"
                                                placeholderTextColor="#666"
                                                value={caption}
                                                onChangeText={setCaption}
                                                multiline
                                                maxLength={200}
                                            />
                                        </View>

                                        {/* Action Buttons */}
                                        <View style={styles.actionButtonsContainer}>
                                            <TouchableOpacity
                                                onPress={handleShare}
                                                style={[
                                                    styles.shareButton,
                                                    !(mediaInfo?.isFromCapture && mediaInfo?.hasLocation) && styles.shareButtonSolo,
                                                    isCreatingStory && styles.buttonDisabled
                                                ]}
                                                disabled={isCreatingStory}
                                            >
                                                <Text style={styles.shareButtonText}>
                                                    {isCreatingStory ? 'Sharing...' : 'Share'}
                                                </Text>
                                                <Ionicons
                                                    name={isCreatingStory ? "hourglass" : "paper-plane"}
                                                    size={18}
                                                    color="black"
                                                />
                                            </TouchableOpacity>

                                            {mediaInfo?.isFromCapture && mediaInfo?.hasLocation && (
                                                <TouchableOpacity
                                                    onPress={handleCreateAlbum}
                                                    style={[
                                                        styles.createAlbumButtonNew,
                                                        isProcessingAlbum && styles.buttonDisabled
                                                    ]}
                                                    disabled={isProcessingAlbum}
                                                >
                                                    <Text style={styles.createAlbumTextNew}>
                                                        {isProcessingAlbum ? 'Processing...' : 'Create Album'}
                                                    </Text>
                                                    <Ionicons
                                                        name={isProcessingAlbum ? "hourglass" : "add"}
                                                        size={22}
                                                        color="white"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        <View style={styles.bottomEmpty} />
                                    </>
                                );
                            }

                            // Default: Friends Glimpse
                            return (
                                <>
                                    <View style={styles.header}>
                                        <MaterialIcons name="people" size={24} color="white" />
                                        <Text style={styles.headerText}>Friends Glimpse</Text>
                                    </View>
                                    <FriendsGlimpse />
                                </>
                            );
                        })()}
                    </View>
                </View>
            </Modal>

            {/* Enhanced Album Naming Modal */}
            <AlbumNamingModal
                visible={showAlbumModal}
                onClose={handleCloseAlbumModal}
                onCreateAlbum={handleCreateNewAlbum}
                onAddToExistingAlbum={handleAddToExistingAlbum}
                locationName={locationName}
                isCreating={isProcessingAlbum}
            />
        </>
    );
};
// Update the storiesStyles in BottomSheetMap.tsx:
const storiesStyles = StyleSheet.create({
    storiesHeaderContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8, // ✅ Slightly increased
        paddingTop: 12, // ✅ More top padding to prevent cutoff
        paddingBottom: 4,
    },
    storiesHeaderText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'left',
        fontWeight: '500',
        marginLeft: 0,
        alignSelf: 'flex-start',
    },
    storiesContentContainer: {
        flex: 1,
        marginTop: -2, // ✅ Less aggressive negative margin
    },
});


export default BottomSheetMap;
