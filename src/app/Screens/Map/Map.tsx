// Map.tsx - CLEAN VERSION with Albums Inactive by Default
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import MapboxGL from '../../../../MapboxGL';
import * as Location from 'expo-location';
import { FontAwesome5, MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import MapHeader from './MapHeader';
import MapControls from './MapControls';
import AlbumsOnMap from './AlbumsOnMap';
import friendsData from './friends_data.json';

// ✅ SPACING FUNCTION - Prevents album overlap
const spaceOutAlbums = (albums: any[], zoomLevel: number) => {
    if (albums.length <= 1) return albums;

    const minDistance = zoomLevel > 15 ? 0.0008 : 0.002;
    const processedAlbums = [...albums];

    for (let i = 0; i < processedAlbums.length; i++) {
        for (let j = i + 1; j < processedAlbums.length; j++) {
            const album1 = processedAlbums[i];
            const album2 = processedAlbums[j];

            const distance = Math.sqrt(
                Math.pow(album1.location_latitude - album2.location_latitude, 2) +
                Math.pow(album1.location_longitude - album2.location_longitude, 2)
            );

            if (distance < minDistance) {
                const angle = Math.random() * 2 * Math.PI;
                const offset = minDistance * 1.2;

                processedAlbums[j] = {
                    ...album2,
                    location_latitude: album2.location_latitude + offset * Math.cos(angle),
                    location_longitude: album2.location_longitude + offset * Math.sin(angle)
                };
            }
        }
    }

    return processedAlbums;
};

// Local imports from your utils
import { LocationData, Friend, MapProps } from './types';
import {
    getWeatherIcon,
    getCurrentUser,
    getUserLocationSharingPreference,
    getLocationQuickly,
    createLocationUpdateHandler,
    createGPSPressHandler,
    createAlbumHandler,
    createLocationSharingToggleHandler,
    createAnimateToFriendHandler,
    calculateCameraCoords,
    calculateMarkerCoordinate,
    getMapStyle,
    getBirdsEyeZoomLevel,
    fetchUserAlbums,
    fetchWeatherData
} from './utils';
import { styles } from './styles';
import MumbaiPOIOverlay from './MumbaiPOIOverlay';

const SafeCamera = MapboxGL.Camera || (() => <></>);
const SafeMarkerView = MapboxGL.MarkerView || (() => <></>);
const SafePointAnnotation = MapboxGL.PointAnnotation || (() => <></>);

interface MapPropsExtended extends MapProps {
    onAlbumCreated?: () => void;
}

const Map: React.FC<MapPropsExtended> = React.memo(({
    onLocationUpdate,
    style,
    zoomLevel = 14,
    isFullScreen = false,
    onClose,
    onCreateAlbum,
    onAlbumCreated
}) => {
    // State management
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
    const [locationSharingEnabled, setLocationSharingEnabled] = useState<boolean>(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Album and Friends visibility controls
    const [albums, setAlbums] = useState<any[]>([]);
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
    const [showAlbums, setShowAlbums] = useState(false); // ✅ CHANGED: Albums inactive by default
    const [showFriends, setShowFriends] = useState(false);

    // ✅ Track zoom for spacing algorithm
    const [currentZoomLevel, setCurrentZoomLevel] = useState(zoomLevel);

    // ✅ Weather data state
    const [weatherData, setWeatherData] = useState<any>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);

    // Map ready state
    const [mapReady, setMapReady] = useState(false);

    const cameraRef = useRef<any>(null);
    const friends: Friend[] = friendsData;

    // Map initialization delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setMapReady(true);
            console.log('🗺️ Map ready state set to true');
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Load albums function
    const loadAlbums = useCallback(async () => {
        if (!isFullScreen) return;
        try {
            setIsLoadingAlbums(true);
            const userAlbums = await fetchUserAlbums();
            setAlbums(userAlbums);
            console.log('📂 Loaded albums on map:', userAlbums.length);
        } catch (error) {
            console.error('❌ Error loading albums:', error);
        } finally {
            setIsLoadingAlbums(false);
        }
    }, [isFullScreen]);

    // ✅ Load weather data using your utils function
    const loadWeatherData = useCallback(async () => {
        if (!location || !isFullScreen) return;
        try {
            setIsLoadingWeather(true);
            const weather = await fetchWeatherData(
                location.coords.latitude,
                location.coords.longitude
            );
            if (weather) {
                setWeatherData(weather);
                console.log('🌤️ Weather data loaded successfully:', weather.main.temp + '°C');
            }
        } catch (error) {
            console.error('❌ Error loading weather:', error);
        } finally {
            setIsLoadingWeather(false);
        }
    }, [location, isFullScreen]);

    // ✅ Spaced out albums to prevent overlap
    const spacedAlbums = useMemo(() => {
        return spaceOutAlbums(albums, currentZoomLevel);
    }, [albums, currentZoomLevel]);

    // User initialization
    useEffect(() => {
        const initializeUser = async () => {
            const userId = await getCurrentUser();
            if (userId) {
                setCurrentUserId(userId);
                const preference = await getUserLocationSharingPreference(userId);
                setLocationSharingEnabled(preference);
            }
        };
        initializeUser();
    }, []);

    useEffect(() => {
        if (isFullScreen) {
            loadAlbums();
            loadWeatherData();
        }
    }, [isFullScreen, loadAlbums, loadWeatherData]);

    React.useEffect(() => {
        if (onAlbumCreated) {
            console.log('📂 Album created callback received, refreshing albums...');
            loadAlbums();
        }
    }, [onAlbumCreated]);

    // Load weather when location changes
    useEffect(() => {
        if (location && isFullScreen) {
            loadWeatherData();
        }
    }, [location, loadWeatherData, isFullScreen]);

    // ✅ USING UTILS: Create handlers using your util functions
    const handleLocationUpdate = useMemo(() =>
        createLocationUpdateHandler(onLocationUpdate, currentUserId),
        [onLocationUpdate, currentUserId]
    );

    const handleGPSPress = useMemo(() =>
        createGPSPressHandler(location, cameraRef),
        [location]
    );

    const handleCreateAlbum = useMemo(() =>
        createAlbumHandler(location, onClose, onCreateAlbum),
        [location, onClose, onCreateAlbum]
    );

    const handleLocationSharingToggle = useMemo(() =>
        createLocationSharingToggleHandler(currentUserId, locationSharingEnabled, setLocationSharingEnabled),
        [currentUserId, locationSharingEnabled]
    );

    const animateToFriend = useMemo(() =>
        createAnimateToFriendHandler(cameraRef, setSelectedFriendId),
        [cameraRef]
    );

    const handleAlbumPress = useCallback((album: any) => {
        console.log('📂 Album pressed for detailed view:', album.name);
    }, []);

    const handleAlbumLongPress = useCallback((album: any) => {
        console.log('📂 Album long pressed for options:', album.name);
    }, []);

    const handleAlbumsToggle = useCallback(() => {
        setShowAlbums(prev => {
            const newState = !prev;
            console.log(`📂 Albums visibility: ${newState ? 'ON' : 'OFF'}`);
            return newState;
        });
    }, []);

    const handleFriendsToggle = useCallback(() => {
        setShowFriends(prev => {
            const newState = !prev;
            console.log(`👥 Friends visibility: ${newState ? 'ON' : 'OFF'}`);
            return newState;
        });
    }, []);

    // ✅ FIXED: Use onMapIdle instead of deprecated onRegionDidChange
    const handleMapIdle = useCallback((state: any) => {
        if (state && state.properties && state.properties.zoom !== currentZoomLevel) {
            setCurrentZoomLevel(state.properties.zoom);
            console.log('🗺️ Map zoom level changed:', state.properties.zoom);
        }
    }, [currentZoomLevel]);

    // ✅ USING UTILS: Computed values from your utils
    const cameraCoords = useMemo(() => calculateCameraCoords(location), [location]);
    const markerCoordinate = useMemo(() => calculateMarkerCoordinate(location), [location]);
    const mapStyle = useMemo(() => getMapStyle(), []);
    const birdsEyeZoomLevel = useMemo(() => getBirdsEyeZoomLevel(isFullScreen, zoomLevel), [isFullScreen, zoomLevel]);

    // ✅ USING UTILS: Location initialization
    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            getLocationQuickly(
                setLocation,
                setPermissionGranted,
                setIsLoading,
                setError,
                handleLocationUpdate
            );
        }
        return () => {
            isMounted = false;
        };
    }, [handleLocationUpdate]);

    // Location watching
    useEffect(() => {
        if (!isFullScreen || !permissionGranted || isLoading) return;

        let locationSubscription: Location.LocationSubscription | null = null;
        let isMounted = true;

        const watchLocation = async () => {
            try {
                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 10000,
                        distanceInterval: 50,
                    },
                    (newLocation) => {
                        if (isMounted && newLocation) {
                            setLocation(newLocation);
                            handleLocationUpdate({
                                latitude: newLocation.coords.latitude,
                                longitude: newLocation.coords.longitude,
                                timestamp: newLocation.timestamp,
                                accuracy: newLocation.coords.accuracy || undefined
                            });
                        }
                    }
                );
            } catch (error) {
                console.log('Error watching location:', error);
            }
        };

        const watchTimer = setTimeout(watchLocation, 2000);

        return () => {
            isMounted = false;
            if (locationSubscription) {
                locationSubscription.remove();
            }
            if (watchTimer) {
                clearTimeout(watchTimer);
            }
        };
    }, [permissionGranted, isLoading, handleLocationUpdate, isFullScreen]);

    // Early returns
    if (isLoading && !location) {
        return (
            <View style={[styles.container, styles.centerContent, style]}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>
                    Loading...
                </Text>
            </View>
        );
    }

    if (error && !location) {
        return (
            <View style={[styles.container, styles.centerContent, style]}>
                <Text style={styles.errorText}>{error || 'No location'}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <MapHeader
                isVisible={isFullScreen}
                onClose={onClose}
            />

            {mapReady && (
                <MapboxGL.MapView
                    key="mapbox-view-stable"
                    style={styles.map}
                    styleURL={mapStyle}
                    logoEnabled={false}
                    scaleBarEnabled={false}
                    attributionEnabled={false}
                    compassEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    localizeLabels={false}
                    preferredFramesPerSecond={60}
                    optimizeForTerrain={true}
                    surfaceView={true}
                    renderWorldCopies={false}
                    maxZoomLevel={18}
                    minZoomLevel={8}
                    onTouchStart={() => setIsUserInteracting(true)}
                    onTouchEnd={() => setTimeout(() => setIsUserInteracting(false), 1000)}
                    onMapIdle={handleMapIdle} // ✅ FIXED: Using onMapIdle instead of deprecated onRegionDidChange
                >
                    <SafeCamera
                        ref={cameraRef}
                        centerCoordinate={cameraCoords}
                        zoomLevel={birdsEyeZoomLevel}
                        animationDuration={800}
                        animationMode="flyTo"
                        followUserLocation={false}
                        followUserMode="normal"
                    />
                    {/* <MumbaiPOIOverlay /> */}

                    {/* ✅ Your existing location marker */}
                    <SafeMarkerView
                        coordinate={markerCoordinate}
                        allowOverlapWithPuck={true}
                    >
                        <View style={styles.locationMarkerContainer}>
                            <Text style={styles.youAreHereText}>you are here rn</Text>
                            <View style={styles.locationMarker}>
                                <FontAwesome5
                                    name="location-arrow"
                                    size={isFullScreen ? 24 : 18}
                                    color="#000"
                                    solid
                                />
                            </View>
                        </View>
                    </SafeMarkerView>

                    {/* ✅ Your existing friends markers */}
                    {showFriends && friends.map((friend) => (
                        <SafePointAnnotation
                            key={`friend-${friend.id}`}
                            id={`friend-${friend.id}`}
                            coordinate={[friend.location.longitude, friend.location.latitude]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.friendMarker,
                                    selectedFriendId === friend.id && styles.selectedFriendMarker
                                ]}
                                onPress={() => animateToFriend(friend)}
                            >
                                <Image
                                    source={{ uri: friend.profile_pic }}
                                    style={styles.friendProfilePic}
                                />
                                <View style={[
                                    styles.storyIndicator,
                                    friend.story.type === 'video' ? styles.videoStory : styles.photoStory
                                ]}>
                                    <MaterialIcons
                                        name={friend.story.type === 'video' ? 'videocam' : 'camera-alt'}
                                        size={8}
                                        color="white"
                                    />
                                </View>
                            </TouchableOpacity>
                        </SafePointAnnotation>
                    ))}

                    {/* ✅ Albums with proper spacing */}
                    <AlbumsOnMap
                        albums={spacedAlbums}
                        showAlbums={showAlbums}
                        onAlbumPress={handleAlbumPress}
                        onAlbumLongPress={handleAlbumLongPress}
                    />
                </MapboxGL.MapView>
            )}

            {!mapReady && (
                <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Initializing Map...</Text>
                </View>
            )}

            {/* ✅ Weather Data Overlay */}
            {weatherData && isFullScreen && (
                <View style={styles.weatherInfo}>
                    <View style={styles.weatherTopRow}>
                        <View style={styles.weatherIcon}>
                            <MaterialCommunityIcons
                                name={getWeatherIcon(weatherData.weather[0].main.toLowerCase())}
                                size={24}
                                color="white"
                            />
                        </View>
                        <Text style={styles.weatherTemp}>
                            {Math.round(weatherData.main.temp)}°
                        </Text>
                    </View>
                    <Text style={styles.weatherDescription}>
                        {weatherData.weather[0].description}
                    </Text>
                </View>
            )}

            {/* ✅ Weather Loading Indicator */}
            {isLoadingWeather && isFullScreen && (
                <View style={[styles.weatherInfo, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="small" color="#007AFF" />
                </View>
            )}

            {/* ✅ Map Controls */}
            <MapControls
                isFullScreen={isFullScreen}
                locationSharingEnabled={locationSharingEnabled}
                showAlbums={showAlbums}
                showFriends={showFriends}
                onGPSPress={handleGPSPress}
                onLocationSharingToggle={handleLocationSharingToggle}
                onAlbumsToggle={handleAlbumsToggle}
                onFriendsToggle={handleFriendsToggle}
            />

            {/* ✅ Create Album Button */}
            {isFullScreen && (
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity
                        style={styles.liquidGlassButton}
                        onPress={handleCreateAlbum}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.liquidGlassText}>Create Album</Text>
                        <Ionicons name="add" size={20} color="rgba(255, 255, 255, 0.9)" />
                    </TouchableOpacity>
                </View>
            )}

            {/* ✅ Album Loading Indicator */}
            {isLoadingAlbums && isFullScreen && (
                <View style={styles.albumLoadingIndicator}>
                    <ActivityIndicator size="small" color="#FF6B6B" />
                    <Text style={styles.albumLoadingText}>Loading albums...</Text>
                </View>
            )}
        </View>
    );
});

Map.displayName = 'Map';
export default Map;
