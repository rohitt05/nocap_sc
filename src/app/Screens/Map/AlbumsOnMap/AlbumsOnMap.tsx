// AlbumsOnMap.tsx - MODERN UI/UX DESIGN - 2025 Trends
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, Animated } from 'react-native';
import MapboxGL from '../../../../../MapboxGL';
import { getMediaUrl } from '../utils';
import AlbumOverlay from './AlbumOverlay';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SafePointAnnotation = MapboxGL.PointAnnotation || (() => <></>);

interface Album {
    id: string;
    name: string;
    description?: string;
    location_latitude: number;
    location_longitude: number;
    location_name?: string;
    media_count: number;
    created_at: string;
    preview_media: Array<{
        url: string;
        type: 'photo' | 'video';
    }>;
    album_media?: Array<{
        id: string;
        media_url: string;
        media_type: 'photo' | 'video';
        caption?: string;
        created_at: string;
    }>;
}

interface AlbumsOnMapProps {
    albums: Album[];
    showAlbums: boolean;
    onAlbumPress?: (album: Album) => void;
    onAlbumLongPress?: (album: Album) => void;
}

// ✨ MODERN 2025 DESIGN: Glassmorphism + Micro-interactions + Depth
const ModernAlbumMarker: React.FC<{
    album: Album;
    isSelected: boolean;
    onPress: () => void;
    onLongPress: () => void;
}> = ({ album, isSelected, onPress, onLongPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [imageLoadErrors, setImageLoadErrors] = useState<Record<number, boolean>>({});
    
    // ✨ MODERN: Dynamic sizing with better proportions
    const getDynamicSize = () => {
        const baseSize = 65; // Optimized size
        const mediaCount = album.preview_media?.length || 0;
        
        if (mediaCount >= 10) return { base: baseSize + 15, stack: 8 };
        if (mediaCount >= 5) return { base: baseSize + 8, stack: 6 };
        return { base: baseSize, stack: 5 };
    };

    const { base: dynamicSize, stack: stackOffset } = getDynamicSize();

    // ✨ MODERN: Advanced micro-interactions
    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isSelected ? 1.12 : 1,
                friction: 8,
                tension: 150,
                useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
                toValue: isSelected ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: isSelected ? 1 : 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isSelected]);

    // ✨ Preload images
    useEffect(() => {
        const loadImages = async () => {
            const availableMedia = album.preview_media || [];
            const loadPromises = availableMedia.slice(0, 3).map((media, index) => {
                return new Promise((resolve) => {
                    Image.prefetch(getMediaUrl(media.url))
                        .then(() => resolve(true))
                        .catch(() => {
                            setImageLoadErrors(prev => ({ ...prev, [index]: true }));
                            resolve(false);
                        });
                });
            });
            await Promise.all(loadPromises);
            setImagesLoaded(true);
        };
        loadImages();
    }, [album.preview_media]);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.92,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
                toValue: 0.7,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isSelected ? 1.12 : 1,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
                toValue: isSelected ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
        onPress();
    };

    const availableMedia = album.preview_media || [];
    const imagesToShow = Math.min(availableMedia.length, 3);

    // ✨ MODERN: Enhanced image rendering with gradients
    const renderModernImage = (mediaItem: any, index: number, size: number, zIndex: number, rotation: number) => {
        const rotateInterpolation = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', `${rotation}deg`],
        });

        if (imageLoadErrors[index]) {
            return (
                <Animated.View 
                    style={[
                        styles.modernPhotoContainer,
                        {
                            width: size,
                            height: size,
                            zIndex,
                            transform: [{ rotate: rotateInterpolation }],
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['#FF6B6B', '#FF8E8E']}
                        style={[styles.modernPhoto, { width: size, height: size }]}
                    >
                        <MaterialIcons name="image" size={size * 0.4} color="white" />
                    </LinearGradient>
                </Animated.View>
            );
        }

        return (
            <Animated.View 
                style={[
                    styles.modernPhotoContainer,
                    {
                        width: size,
                        height: size,
                        zIndex,
                        transform: [{ rotate: rotateInterpolation }],
                    }
                ]}
            >
                <Image
                    source={{ uri: getMediaUrl(mediaItem.url) }}
                    style={[styles.modernPhoto, { width: size, height: size }]}
                    resizeMode="cover"
                />
                {/* ✨ MODERN: Gradient overlay for depth */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.1)']}
                    style={[styles.gradientOverlay, { width: size, height: size }]}
                />
                {/* ✨ Video indicator with modern design */}
                {mediaItem?.type === 'video' && (
                    <View style={styles.modernVideoIcon}>
                        <View style={styles.videoIconGlow}>
                            <Ionicons name="play" size={16} color="white" />
                        </View>
                    </View>
                )}
            </Animated.View>
        );
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 2],
    });

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLongPress={onLongPress}
            activeOpacity={1}
            style={styles.modernContainer}
        >
            <Animated.View
                style={[
                    styles.modernMarker,
                    {
                        transform: [
                            { scale: scaleAnim },
                            { rotate: rotation.interpolate({
                                inputRange: [0, 2],
                                outputRange: ['0deg', '2deg']
                            }) }
                        ]
                    }
                ]}
            >
                {/* ✨ MODERN: Glassmorphism background glow */}
                <Animated.View
                    style={[
                        styles.glowBackground,
                        {
                            opacity: glowAnim,
                            width: dynamicSize + 35,
                            height: dynamicSize + 35,
                        }
                    ]}
                />

                {/* ✨ MODERN: Layered photo stack with micro-rotations */}
                <View style={[styles.modernPhotoStack, { width: dynamicSize + 20, height: dynamicSize + 15 }]}>
                    
                    {/* Third photo (background) - slight left rotation */}
                    {imagesToShow >= 3 && (
                        <View style={[
                            styles.photoLayer,
                            {
                                left: 0,
                                top: stackOffset + 2,
                            }
                        ]}>
                            {renderModernImage(availableMedia[2], 2, dynamicSize - 15, 1, -3)}
                        </View>
                    )}

                    {/* Second photo (middle) - slight right rotation */}
                    {imagesToShow >= 2 && (
                        <View style={[
                            styles.photoLayer,
                            {
                                left: stackOffset - 2,
                                top: stackOffset - 1,
                            }
                        ]}>
                            {renderModernImage(availableMedia[1], 1, dynamicSize - 8, 2, 2)}
                        </View>
                    )}

                    {/* Main photo (front) - no rotation */}
                    <View style={[
                        styles.photoLayer,
                        {
                            left: stackOffset + 4,
                            top: 0,
                        }
                    ]}>
                        {renderModernImage(availableMedia[0], 0, dynamicSize, 3, 0)}
                    </View>

                    {/* ✨ MODERN: Floating count badge with glassmorphism */}
                    {album.media_count > 3 && (
                        <View style={[
                            styles.modernCountBadge,
                            {
                                right: -5,
                                top: -8,
                            }
                        ]}>
                            <View style={styles.badgeGlass}>
                                <Text style={styles.modernCountText}>+{album.media_count - 3}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* ✨ MODERN: Floating album type indicator */}
                <View style={styles.albumTypeIndicator}>
                    <View style={styles.typeIconContainer}>
                        <MaterialIcons name="photo-library" size={12} color="white" />
                    </View>
                </View>

                {/* ✨ MODERN: Minimal album name with backdrop blur */}
                <Animated.View
                    style={[
                        styles.modernLabel,
                        {
                            opacity: scaleAnim.interpolate({
                                inputRange: [0.92, 1, 1.12],
                                outputRange: [0.7, 1, 1],
                            }),
                        }
                    ]}
                >
                    <View style={styles.labelGlass}>
                        <Text style={styles.modernLabelText} numberOfLines={1}>
                            {album.name}
                        </Text>
                    </View>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
};

// Main component remains the same structure...
const AlbumsOnMap: React.FC<AlbumsOnMapProps> = ({
    albums,
    showAlbums,
    onAlbumPress,
    onAlbumLongPress
}) => {
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
    const [overlayAlbum, setOverlayAlbum] = useState<Album | null>(null);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const annotationRefs = useRef<Record<string, any>>({});
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const handleAlbumPress = useCallback((album: Album) => {
        setSelectedAlbumId(album.id);
        setOverlayAlbum(album);
        setOverlayVisible(true);
        setTimeout(() => setSelectedAlbumId(null), 3000);
        onAlbumPress?.(album);
    }, [onAlbumPress]);

    const handleAlbumLongPress = useCallback((album: Album) => {
        onAlbumLongPress?.(album);
    }, [onAlbumLongPress]);

    const handleCloseOverlay = useCallback(() => {
        setOverlayVisible(false);
        setOverlayAlbum(null);
    }, []);

    if (!showAlbums || albums.length === 0 || !isMounted) {
        return null;
    }

    return (
        <>
            {albums.map((album) => {
                const availableMedia = album.preview_media || [];
                if (availableMedia.length === 0) return null;

                const isSelected = selectedAlbumId === album.id;

                return (
                    <SafePointAnnotation
                        key={`modern-album-${album.id}`}
                        id={`modern-album-${album.id}`}
                        coordinate={[album.location_longitude, album.location_latitude]}
                        onSelected={() => handleAlbumPress(album)}
                        ref={(ref) => {
                            annotationRefs.current[album.id] = ref;
                        }}
                    >
                        <ModernAlbumMarker
                            album={album}
                            isSelected={isSelected}
                            onPress={() => handleAlbumPress(album)}
                            onLongPress={() => handleAlbumLongPress(album)}
                        />
                    </SafePointAnnotation>
                );
            })}

            <AlbumOverlay
                album={overlayAlbum}
                visible={overlayVisible}
                onClose={handleCloseOverlay}
            />
        </>
    );
};

const styles = StyleSheet.create({
    modernContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    modernMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ✨ GLASSMORPHISM: Subtle glow effect
    glowBackground: {
        position: 'absolute',
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },

    modernPhotoStack: {
        position: 'relative',
    },

    photoLayer: {
        position: 'absolute',
    },

    // ✨ MODERN: Photo containers with advanced shadows
    modernPhotoContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 12,
    },

    modernPhoto: {
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ✨ MODERN: Subtle gradient overlay for depth
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: 16,
    },

    // ✨ MODERN: Video icon with glow effect
    modernVideoIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },

    videoIconGlow: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },

    // ✨ MODERN: Glassmorphism count badge
    modernCountBadge: {
        position: 'absolute',
        zIndex: 10,
    },

    badgeGlass: {
        backgroundColor: 'rgba(255, 107, 107, 0.9)',
        borderRadius: 14,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
    },

    modernCountText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    // ✨ MODERN: Floating type indicator
    albumTypeIndicator: {
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 5,
    },

    typeIconContainer: {
        backgroundColor: 'rgba(0, 122, 255, 0.9)',
        borderRadius: 10,
        padding: 4,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
    },

    // ✨ MODERN: Minimal label with backdrop blur effect
    modernLabel: {
        marginTop: 12,
        alignItems: 'center',
    },

    labelGlass: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },

    modernLabelText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
        textAlign: 'center',
    },
});

export default AlbumsOnMap;
