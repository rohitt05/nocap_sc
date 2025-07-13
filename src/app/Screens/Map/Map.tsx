import { View, Text, Alert, Animated, TouchableOpacity, Keyboard, StatusBar, Dimensions } from 'react-native'
import Mapbox, { Camera, LocationPuck, MapView, StyleURL, UserTrackingModes } from '@rnmapbox/maps'
import React, { useEffect, useState, useRef } from 'react'
import * as Location from 'expo-location'
import { FontAwesome6 } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import SearchBar from './SearchBar'
import BottomSheetMap from './BottomSheetMap'
import MapFilters from './MapFilters'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const accessToken = 'pk.eyJ1Ijoicm9oaXR0MDA1IiwiYSI6ImNtY3Vic3dwNzAxZnUycXNsNjgwbnZkZjkifQ.mPD8CSkhwFA78k2IDUrVnw';
Mapbox.setAccessToken(accessToken);

const Map: React.FC = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [bottomSheetPosition, setBottomSheetPosition] = useState<'closed' | 'half' | 'full'>('closed');
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
    const [previousBottomSheetPosition, setPreviousBottomSheetPosition] = useState<'closed' | 'half' | 'full'>('closed');
    const [selectedFilter, setSelectedFilter] = useState<string>('discover');

    // Enhanced animations
    const pulseAnimation = useRef(new Animated.Value(1)).current;
    const filtersOpacity = useRef(new Animated.Value(1)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const loadingRotation = useRef(new Animated.Value(0)).current;
    const mapOpacity = useRef(new Animated.Value(0)).current;
    const cameraRef = useRef<Mapbox.Camera>(null);

    useEffect(() => {
        // Set status bar style
        StatusBar.setBarStyle('light-content', true);
        StatusBar.setBackgroundColor('#000000', true);

        (async () => {
            try {
                // Request location permissions
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    Alert.alert('Permission Required', 'Location permission is required to show your position on the map');
                    return;
                }

                setPermissionGranted(true);

                // Get current location
                let currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setLocation(currentLocation);

                // Fade in map once location is ready
                Animated.timing(mapOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }).start();

            } catch (error) {
                setErrorMsg('Error getting location');
                console.error('Error getting location:', error);
            }
        })();

        // Enhanced pulse animation
        const startPulse = (): void => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnimation, {
                        toValue: 1.15,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnimation, {
                        toValue: 1,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        // Loading rotation animation
        const startLoadingRotation = (): void => {
            Animated.loop(
                Animated.timing(loadingRotation, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ).start();
        };

        startPulse();
        startLoadingRotation();
    }, []);

    const handleLocationPress = async (): Promise<void> => {
        // Button press animation
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        try {
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setLocation(currentLocation);

            // Subtle success feedback
            Alert.alert('📍 Location Updated', 'Map centered to your current location');
        } catch (error) {
            Alert.alert('⚠️ Error', 'Could not get your current location');
            console.error('Error getting location:', error);
        }
    };

    const handleSearch = async (query: string): Promise<void> => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&limit=1`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const [longitude, latitude] = feature.center;

                setSearchResults([feature]);
                Alert.alert('🎯 Location Found', `Found: ${feature.place_name}`);

                // Move camera to searched location
                if (cameraRef.current) {
                    cameraRef.current.setCamera({
                        centerCoordinate: [longitude, latitude],
                        zoomLevel: 15,
                        animationDuration: 1000,
                    });
                }
            } else {
                Alert.alert('🔍 No Results', 'No locations found for your search');
            }
        } catch (error) {
            Alert.alert('❌ Search Error', 'Could not search for location');
            console.error('Search error:', error);
        }
    };

    const handleBottomSheetPositionChange = (position: 'closed' | 'half' | 'full'): void => {
        setBottomSheetPosition(position);

        if (!isSearchFocused) {
            setPreviousBottomSheetPosition(position);
        }

        // Smooth filters opacity animation
        const targetOpacity = position === 'full' ? 0 : 1;
        Animated.timing(filtersOpacity, {
            toValue: targetOpacity,
            duration: 250,
            useNativeDriver: true,
        }).start();

        // Adjust camera position based on bottom sheet state
        if (location && cameraRef.current) {
            const { latitude, longitude } = location.coords;
            let adjustedLatitude = latitude;

            if (position === 'half') {
                adjustedLatitude = latitude + 0.015;
            }

            cameraRef.current.setCamera({
                centerCoordinate: [longitude, adjustedLatitude],
                zoomLevel: 15,
                animationDuration: 400,
            });
        }
    };

    const handleSearchFocus = (): void => {
        setIsSearchFocused(true);
        setPreviousBottomSheetPosition(bottomSheetPosition);

        Animated.timing(filtersOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    const handleSearchBlur = (): void => {
        setIsSearchFocused(false);
        const targetOpacity = previousBottomSheetPosition === 'full' ? 0 : 1;

        Animated.timing(filtersOpacity, {
            toValue: targetOpacity,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    const handleMapPress = (): void => {
        if (isSearchFocused) {
            Keyboard.dismiss();
            setIsSearchFocused(false);
        }
    };

    const handleFilterSelect = (filter: string): void => {
        setSelectedFilter(filter);
        console.log('Filter selected:', filter);
    };

    const handleDiscoverOptionSelect = (option: string): void => {
        console.log('Discover option selected:', option);
        if (option === 'map-settings') {
            Alert.alert('⚙️ Map Settings', 'Map settings would open here');
        } else if (option === 'bucketlist') {
            Alert.alert('📋 My Bucketlist', 'Your bucketlist would open here');
        }
    };

    const spin = loadingRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            flex: 1,
            backgroundColor: '#000000',
        }}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            {permissionGranted ? (
                <>
                    {/* Enhanced Map View with fade-in animation */}
                    <Animated.View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: mapOpacity,
                    }}>
                        <MapView
                            style={{
                                flex: 1,
                                zIndex: 1,
                            }}
                            styleURL="mapbox://styles/mapbox/dark-v11"
                            compassEnabled={false}
                            scaleBarEnabled={false}
                            attributionEnabled={false}
                            showUserLocation={true}
                            userTrackingMode={UserTrackingModes.None}
                            rotateEnabled={true}
                            pitchEnabled={true}
                            scrollEnabled={true}
                            zoomEnabled={true}
                            logoEnabled={false}
                            onPress={handleMapPress}
                        >
                            {location && (
                                <Camera
                                    ref={cameraRef}
                                    followUserLocation={false}
                                    zoomLevel={15}
                                    animationDuration={1000}
                                    centerCoordinate={[
                                        location.coords.longitude,
                                        bottomSheetPosition === 'half'
                                            ? location.coords.latitude + 0.015
                                            : location.coords.latitude
                                    ]}
                                />
                            )}

                            <LocationPuck
                                puckBearing="heading"
                                puckBearingEnabled={true}
                                pulsing={{
                                    isEnabled: true,
                                    color: '#FFFFFF',
                                    radius: 80
                                }}
                                visible={true}
                            />
                        </MapView>
                    </Animated.View>

                    {/* Enhanced Search Bar with gradient background */}
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        pointerEvents: 'box-none',
                    }}>
                        <LinearGradient
                            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 120,
                                zIndex: -1,
                            }}
                        />
                        <SearchBar
                            onLocationPress={handleLocationPress}
                            onSearch={handleSearch}
                            onFocus={handleSearchFocus}
                            onBlur={handleSearchBlur}
                        />
                    </View>

                    {/* Enhanced Floating Bookmark Button */}
                    <View style={{
                        position: 'absolute',
                        top: 85,
                        right: 15,
                        zIndex: 90,
                        pointerEvents: 'box-none',
                    }}>
                        <Link href="/Screens/Map/MyChecklist" asChild>
                            <Animated.View style={{
                                transform: [{ scale: buttonScale }],
                            }}>
                                <TouchableOpacity
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 26,
                                        backgroundColor: 'rgba(0,0,0,0.9)',
                                        justifyContent: 'center',
                                        alignItems: 'center',

                                    }}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        // Button press animation
                                        Animated.sequence([
                                            Animated.timing(buttonScale, {
                                                toValue: 0.9,
                                                duration: 100,
                                                useNativeDriver: true,
                                            }),
                                            Animated.timing(buttonScale, {
                                                toValue: 1,
                                                duration: 100,
                                                useNativeDriver: true,
                                            }),
                                        ]).start();
                                    }}
                                >
                                    <FontAwesome6 name="box-archive" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </Animated.View>
                        </Link>
                    </View>

                    {/* Enhanced Filters with smooth animations */}
                    <Animated.View style={{
                        position: 'absolute',
                        bottom: bottomSheetPosition === 'closed' ? 200 :
                            bottomSheetPosition === 'half' ? 450 : 740,
                        left: 0,
                        right: 0,
                        zIndex: 75,
                        pointerEvents: 'box-none',
                        opacity: filtersOpacity,
                    }}>
                        <View>
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 80,
                                    zIndex: -1,
                                }}
                            />
                            <MapFilters
                                onFilterSelect={handleFilterSelect}
                                onDiscoverOptionSelect={handleDiscoverOptionSelect}
                            />
                        </View>
                    </Animated.View>

                    {/* Enhanced Bottom Sheet */}
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        pointerEvents: 'auto',
                    }}>
                        <BottomSheetMap
                            onPositionChange={handleBottomSheetPositionChange}
                            title="Map Information"
                            forcePosition={isSearchFocused ? 'hidden' : previousBottomSheetPosition}
                            location={location}
                            selectedFilter={selectedFilter}
                            searchResults={searchResults}
                            onLocationPress={handleLocationPress}
                        />
                    </View>
                </>
            ) : (
                // Enhanced loading screen
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000000',
                    paddingHorizontal: 40,
                }}>
                    <Animated.View style={{
                        transform: [
                            { scale: pulseAnimation },
                            { rotate: spin }
                        ],
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 60,
                        padding: 25,
                        marginBottom: 30,
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.2)',
                    }}>
                        <Text style={{
                            color: '#FFFFFF',
                            fontSize: 32,
                            textAlign: 'center',
                        }}>📍</Text>
                    </Animated.View>

                    <Text style={{
                        color: '#FFFFFF',
                        fontSize: 22,
                        fontWeight: '700',
                        textAlign: 'center',
                        marginBottom: 12,
                        letterSpacing: 0.5,
                    }}>
                        {errorMsg || 'Getting your location...'}
                    </Text>

                    <Text style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 15,
                        textAlign: 'center',
                        lineHeight: 22,
                        fontWeight: '400',
                    }}>
                        We need location access to show you the map
                    </Text>

                    {/* Loading dots animation */}
                    <View style={{
                        flexDirection: 'row',
                        marginTop: 20,
                        justifyContent: 'center',
                    }}>
                        {[0, 1, 2].map((i) => (
                            <Animated.View
                                key={i}
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'rgba(255,255,255,0.5)',
                                    marginHorizontal: 4,
                                    opacity: pulseAnimation,
                                }}
                            />
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

export default Map;