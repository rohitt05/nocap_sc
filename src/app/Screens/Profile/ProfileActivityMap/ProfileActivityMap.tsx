// ProfileActivityMap.tsx - COMPLETE UPDATED VERSION WITH REFRESH SUPPORT & PROPER INTEGRATION
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Switch, Alert } from 'react-native';
import MapboxGL from '../../../../../MapboxGL';
import { MaterialIcons, FontAwesome, EvilIcons } from '@expo/vector-icons';
import { ActivityLocation, UserLocation, ProfileActivityMapProps, MapStyleType } from './types';
import { styles } from './styles';
import {
    formatDate,
    getMapStyleURL,
    getNextMapStyle,
    calculateMapCenter,
    initializeUserLocation,
    fetchUserAlbumsArchive
} from './utils';
import { supabase } from '../../../../../lib/supabase';
import HorizontalStoryList from './HorizontalStoryList';

const SafeCamera = MapboxGL.Camera || (() => <></>);
const SafePointAnnotation = MapboxGL.PointAnnotation || (() => <></>);

const ProfileActivityMap: React.FC<ProfileActivityMapProps> = ({
    userId,
    isOwnProfile = false,
    isVisible = true,
    refreshTrigger, // ✅ Refresh trigger from parent
    onMapInteractionStart,
    onMapInteractionEnd,
}) => {
    // State management
    const [mapStyle, setMapStyle] = useState<MapStyleType>('outdoors');
    const [locationSharingEnabled, setLocationSharingEnabled] = useState<boolean>(false);
    const [activitySharingEnabled, setActivitySharingEnabled] = useState<boolean>(true);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [activityLocations, setActivityLocations] = useState<ActivityLocation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [friendLocationTimestamp, setFriendLocationTimestamp] = useState<string | null>(null);

    const cameraRef = useRef<any>(null);
    const mapRef = useRef<any>(null);

    // Safe location sharing preference getter
    const getSafeLocationSharingPreference = async (userId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('location_sharing_enabled')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.log('📍 Could not fetch location sharing preference:', error);
                return false;
            }

            return data?.location_sharing_enabled ?? false;
        } catch (error) {
            console.log('📍 Exception fetching location sharing preference:', error);
            return false;
        }
    };

    // ✅ PULL-TO-REFRESH: Extract data loading logic into reusable function
    const loadAlbumsData = async () => {
        if (!userId || !isVisible) return;

        setLoading(true);
        try {
            console.log('📱 Loading albums...');

            if (isOwnProfile) {
                await initializeUserLocation(userId, setUserLocation, () => { }, () => { });
            } else {
                try {
                    console.log('📍 Fetching friend\'s location data...');

                    const { data: locationData, error: locationError } = await supabase
                        .from('user_locations')
                        .select('latitude, longitude, updated_at')
                        .eq('user_id', userId)
                        .order('updated_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (!locationError && locationData) {
                        console.log('✅ Found friend\'s location:', locationData);
                        setUserLocation({
                            latitude: locationData.latitude,
                            longitude: locationData.longitude
                        });
                        setFriendLocationTimestamp(locationData.updated_at);
                    } else {
                        console.log('📍 No location data found for friend');
                    }
                } catch (error) {
                    console.log('📍 Could not fetch friend\'s location:', error);
                }
            }

            // Fetch albums (signed URLs already created in utils)
            const albums = await fetchUserAlbumsArchive(userId);
            setActivityLocations(albums);
            console.log(`✅ Loaded ${albums.length} albums`);

            const preference = await getSafeLocationSharingPreference(userId);
            setLocationSharingEnabled(preference);

        } catch (error) {
            console.error('❌ Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load activity sharing preference from database
    useEffect(() => {
        const loadActivitySharingPreference = async () => {
            if (!userId) return;

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('activity_sharing_enabled')
                    .eq('id', userId)
                    .maybeSingle();

                if (error) {
                    console.error('Error loading activity sharing preference:', error);
                    return;
                }

                setActivitySharingEnabled(data?.activity_sharing_enabled ?? true);
            } catch (error) {
                console.error('Exception loading activity sharing preference:', error);
            }
        };

        loadActivitySharingPreference();
    }, [userId]);

    // ✅ PULL-TO-REFRESH: Listen for refresh trigger from parent
    useEffect(() => {
        if (refreshTrigger && refreshTrigger > 0) {
            console.log('🔄 ProfileActivityMap: Refreshing due to pull-to-refresh...');
            loadAlbumsData();
        }
    }, [refreshTrigger]);

    // ✅ SIMPLIFIED: Load albums data (using extracted function)
    useEffect(() => {
        loadAlbumsData();
    }, [userId, isVisible, isOwnProfile]);

    // Handle activity sharing toggle
    const handleActivitySharingToggle = async () => {
        if (!userId || !isOwnProfile) return;

        try {
            const newValue = !activitySharingEnabled;

            const { error } = await supabase
                .from('users')
                .update({ activity_sharing_enabled: newValue })
                .eq('id', userId);

            if (error) {
                console.error('Error updating activity sharing preference:', error);
                Alert.alert('Error', 'Failed to update activity sharing preference');
                return;
            }

            setActivitySharingEnabled(newValue);
        } catch (error) {
            console.error('Exception updating activity sharing preference:', error);
            Alert.alert('Error', 'Failed to update activity sharing preference');
        }
    };

    // Handle stories update (for delete functionality)
    const handleStoriesUpdate = useCallback((updatedStories: ActivityLocation[]) => {
        setActivityLocations(updatedStories);
    }, []);

    // Calculate map center
    const mapCenter = useMemo(() =>
        calculateMapCenter(userLocation, activityLocations),
        [userLocation, activityLocations]
    );

    // Handlers
    const toggleMapStyle = () => {
        setMapStyle(getNextMapStyle(mapStyle));
    };

    const handleLocationSharingToggle = async () => {
        if (!userId || !isOwnProfile) return;

        try {
            const newValue = !locationSharingEnabled;

            const { error } = await supabase
                .from('users')
                .update({ location_sharing_enabled: newValue })
                .eq('id', userId);

            if (error) {
                console.error('Error updating location sharing preference:', error);
                Alert.alert('Error', 'Failed to update location sharing preference');
                return;
            }

            setLocationSharingEnabled(newValue);
        } catch (error) {
            console.error('Exception updating location sharing preference:', error);
            Alert.alert('Error', 'Failed to update location sharing preference');
        }
    };

    const handleViewOnMap = (coordinates: [number, number]) => {
        console.log('🗺️ Animating map to coordinates:', coordinates);

        if (cameraRef.current) {
            cameraRef.current.setCamera({
                centerCoordinate: coordinates,
                zoomLevel: 16,
                animationDuration: 2000,
                animationMode: 'flyTo'
            });
        }
    };

    const formatLocationTimestamp = (timestamp: string | null) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Last seen: Less than an hour ago';
        if (diffInHours < 24) return `Last seen: ${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `Last seen: ${diffInDays} days ago`;

        return `Last seen: ${date.toLocaleDateString()}`;
    };

    if (!isVisible) return null;

    if (!isOwnProfile && !activitySharingEnabled) {
        return null;
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                    <Text style={styles.loadingText}>
                        {isOwnProfile ? 'Loading your albums...' : 'Loading albums...'}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { overflow: 'visible' }]}>
            {/* Header with Toggle Switch */}
            <View style={styles.headerSection}>
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>
                        {isOwnProfile ? 'My Albums' : 'Their Albums'}
                    </Text>
                    {!isOwnProfile && userLocation && friendLocationTimestamp && locationSharingEnabled && (
                        <Text style={styles.lastSeenText}>
                            {formatLocationTimestamp(friendLocationTimestamp)}
                        </Text>
                    )}
                </View>

                {isOwnProfile && (
                    <View style={styles.activityToggleContainer}>
                        <Switch
                            value={activitySharingEnabled}
                            onValueChange={handleActivitySharingToggle}
                            thumbColor={activitySharingEnabled ? '#4A90E2' : '#f4f3f4'}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                        />
                    </View>
                )}
            </View>

            {/* Map with simplified controls */}
            <View style={styles.mapSection}>
                <MapboxGL.MapView
                    ref={mapRef}
                    key="activity-map"
                    style={styles.bigMap}
                    styleURL={getMapStyleURL(mapStyle)}
                    logoEnabled={false}
                    scaleBarEnabled={false}
                    attributionEnabled={false}
                    compassEnabled={false}
                    pitchEnabled={true}
                    rotateEnabled={true}
                    scrollEnabled={true}
                    zoomEnabled={true}
                >
                    <SafeCamera
                        ref={cameraRef}
                        centerCoordinate={mapCenter}
                        zoomLevel={13}
                        animationDuration={1000}
                        animationMode="ease"
                    />

                    {userLocation && locationSharingEnabled && (
                        <SafePointAnnotation
                            key="userLocation"
                            id="userLocation"
                            coordinate={[userLocation.longitude, userLocation.latitude]}
                        >
                            <View style={styles.locationMarkerContainer}>
                                <FontAwesome
                                    name="location-arrow"
                                    size={16}
                                    color="white"
                                />
                            </View>
                        </SafePointAnnotation>
                    )}

                    {/* Album markers */}
                    {activityLocations.map((album) => (
                        <SafePointAnnotation
                            key={album.id}
                            id={album.id}
                            coordinate={[album.longitude, album.latitude]}
                        >
                            <View style={styles.storyMarkerContainer}>
                                <EvilIcons name="location" size={24} color="black" />
                            </View>
                        </SafePointAnnotation>
                    ))}
                </MapboxGL.MapView>

                {/* Owner-specific controls */}
                {isOwnProfile && (
                    <View style={styles.controlsOverlay}>
                        <View style={styles.topRightControls}>
                            <TouchableOpacity
                                style={[
                                    styles.mapControlButton,
                                    locationSharingEnabled && styles.locationSharingActive
                                ]}
                                onPress={handleLocationSharingToggle}
                            >
                                <MaterialIcons
                                    name={locationSharingEnabled ? 'visibility' : 'visibility-off'}
                                    size={18}
                                    color="white"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.mapControlButton}
                                onPress={toggleMapStyle}
                            >
                                <MaterialIcons name="layers" size={18} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.mapControlButton}
                                onPress={() => console.log('Update location pressed')}
                            >
                                <MaterialIcons name="my-location" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* ✅ UPDATED: Horizontal album list with proper props */}
            <View style={{ overflow: 'visible', paddingVertical: 10 }}>
                <HorizontalStoryList
                    stories={activityLocations}
                    onViewOnMap={handleViewOnMap}
                    onStoriesUpdate={handleStoriesUpdate} // ✅ NEW: Handle story updates
                    isOwnProfile={isOwnProfile} // ✅ CRITICAL: Pass profile ownership flag
                />
            </View>
        </View>
    );
};

export default ProfileActivityMap;
