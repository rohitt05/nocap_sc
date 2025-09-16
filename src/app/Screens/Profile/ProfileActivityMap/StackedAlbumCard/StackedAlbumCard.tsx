// components/StackedAlbumCard.tsx - FIXED VERSION
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Animated, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDate } from '../utils';

interface MediaItem {
    id: string;
    media_url: string;
    media_type: 'photo' | 'video';
    caption?: string;
}

interface StackedAlbumCardProps {
    album: {
        id: string;
        name: string;
        description?: string;
        timestamp: number;
        latitude: number;
        longitude: number;
        mediaItems: MediaItem[];
        signedUrl?: string;
        mediaUrl?: string;
    };
    onViewOnMap: (coordinates: [number, number]) => void;
    onMediaPress?: (mediaItems: MediaItem[], currentIndex: number) => void;
}

const StackedAlbumCard: React.FC<StackedAlbumCardProps> = ({
    album,
    onViewOnMap,
    onMediaPress
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const mediaCount = album.mediaItems?.length || 0;
    const displayItems = album.mediaItems?.slice(0, Math.min(4, mediaCount)) || [];

    const toggleExpanded = () => {
        const toValue = isExpanded ? 0 : 1;

        Animated.spring(animation, {
            toValue,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();

        setIsExpanded(!isExpanded);
    };

    // ✅ FIXED: Get display image URI with fallbacks
    const getDisplayImageUri = (item?: MediaItem, fallback?: string): string => {
        if (item?.media_type === 'photo' && item?.media_url) {
            return item.media_url;
        }
        if (item?.media_type === 'video' && item?.media_url) {
            // For videos, you need to generate thumbnails beforehand
            // For now, we'll use a placeholder or the original URI won't work
            console.warn('Video thumbnail needed for:', item.media_url);
            return ''; // This will trigger the fallback
        }
        return fallback || album.signedUrl || album.mediaUrl || '';
    };

    const renderStackedCards = () => {
        // ✅ FIXED: Handle no media case properly
        if (mediaCount === 0) {
            return (
                <View style={styles.emptyCard}>
                    <MaterialIcons name="photo-library" size={48} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.emptyText}>No media</Text>
                </View>
            );
        }

        if (mediaCount === 1) {
            // Single card - no stack effect
            const imageUri = getDisplayImageUri(album.mediaItems[0], album.signedUrl);

            return (
                <TouchableOpacity
                    style={styles.singleCard}
                    onPress={() => onMediaPress?.(album.mediaItems, 0)}
                    activeOpacity={0.9}
                >
                    {imageUri ? (
                        <ImageBackground
                            source={{ uri: imageUri }}
                            style={styles.cardBackground}
                            imageStyle={styles.cardImage}
                            defaultSource={require('../../../../../../assets/hattori.webp')} // Add a placeholder image
                        >
                            <LinearGradient
                                colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                                style={styles.cardGradient}
                            >
                                <View style={styles.cardContent}>
                                    <Text style={styles.albumTitle} numberOfLines={1}>
                                        {album.name}
                                    </Text>
                                    <Text style={styles.albumDate}>
                                        {formatDate(album.timestamp)}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    ) : (
                        // ✅ FIXED: Fallback for when no image is available
                        <View style={[styles.cardBackground, styles.fallbackCard]}>
                            <MaterialIcons name="photo" size={64} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.albumTitle} numberOfLines={1}>
                                {album.name}
                            </Text>
                            <Text style={styles.albumDate}>
                                {formatDate(album.timestamp)}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            );
        }

        // Multiple cards - stacked effect
        return (
            <TouchableOpacity
                style={styles.stackContainer}
                onPress={toggleExpanded}
                activeOpacity={0.9}
            >
                {displayItems.map((item, index) => {
                    const isTopCard = index === displayItems.length - 1;
                    const stackOffset = (displayItems.length - 1 - index) * 4;
                    const rotateOffset = (displayItems.length - 1 - index) * 1.5;

                    const expandTranslateX = animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, index * 70 - (displayItems.length - 1) * 35],
                    });

                    const expandRotateZ = animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [`${rotateOffset}deg`, `${index * 10 - (displayItems.length - 1) * 5}deg`],
                    });

                    const imageUri = getDisplayImageUri(item);

                    return (
                        <Animated.View
                            key={item.id}
                            style={[
                                styles.stackedCard,
                                {
                                    zIndex: index,
                                    top: -stackOffset,
                                    left: stackOffset,
                                    transform: [
                                        { translateX: expandTranslateX },
                                        { rotateZ: expandRotateZ },
                                    ],
                                },
                            ]}
                        >
                            {imageUri ? (
                                <ImageBackground
                                    source={{ uri: imageUri }}
                                    style={styles.cardBackground}
                                    imageStyle={styles.cardImage}
                                >
                                    {isTopCard && (
                                        <LinearGradient
                                            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                                            style={styles.cardGradient}
                                        >
                                            <View style={styles.cardContent}>
                                                <View style={styles.cardHeader}>
                                                    <Text style={styles.albumTitle} numberOfLines={1}>
                                                        {album.name}
                                                    </Text>
                                                    <View style={styles.mediaCount}>
                                                        <MaterialIcons name="photo-library" size={16} color="white" />
                                                        <Text style={styles.mediaCountText}>{mediaCount}</Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.albumDate}>
                                                    {formatDate(album.timestamp)}
                                                </Text>
                                            </View>
                                        </LinearGradient>
                                    )}
                                    {item.media_type === 'video' && (
                                        <View style={styles.videoIndicator}>
                                            <MaterialIcons name="play-circle-filled" size={24} color="white" />
                                        </View>
                                    )}
                                </ImageBackground>
                            ) : (
                                // ✅ FIXED: Fallback card design
                                <View style={[styles.cardBackground, styles.fallbackCard]}>
                                    <MaterialIcons
                                        name={item.media_type === 'video' ? 'videocam' : 'photo'}
                                        size={40}
                                        color="rgba(255,255,255,0.4)"
                                    />
                                    {isTopCard && (
                                        <View style={styles.fallbackContent}>
                                            <Text style={styles.albumTitle} numberOfLines={1}>
                                                {album.name}
                                            </Text>
                                            <View style={styles.mediaCount}>
                                                <MaterialIcons name="photo-library" size={16} color="white" />
                                                <Text style={styles.mediaCountText}>{mediaCount}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </Animated.View>
                    );
                })}

                {mediaCount > 4 && (
                    <View style={styles.moreIndicator}>
                        <Text style={styles.moreText}>+{mediaCount - 4}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.albumCard}>
            {renderStackedCards()}

            {/* View on Map Button */}
            <TouchableOpacity
                style={styles.viewOnMapButton}
                onPress={() => onViewOnMap([album.longitude, album.latitude])}
            >
                <Text style={styles.viewOnMapText}>View on Map</Text>
            </TouchableOpacity>

            {album.description && (
                <Text style={styles.albumDescription} numberOfLines={2}>
                    {album.description}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    albumCard: {
        width: 200, // ✅ FIXED: Increased width
        marginRight: 16,
        marginBottom: 12,
    },

    emptyCard: {
        width: '100%',
        height: 180, // ✅ FIXED: Explicit height
        borderRadius: 12,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },

    emptyText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginTop: 8,
    },

    singleCard: {
        width: '100%',
        height: 180, // ✅ FIXED: Explicit height
        borderRadius: 12,
        overflow: 'hidden',
    },

    stackContainer: {
        width: '100%',
        height: 180, // ✅ FIXED: Explicit height
        position: 'relative',
    },

    stackedCard: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },

    cardBackground: {
        width: '100%',
        height: '100%',
    },

    // ✅ NEW: Fallback card styling
    fallbackCard: {
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },

    fallbackContent: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    cardImage: {
        borderRadius: 12,
    },

    cardGradient: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 12,
    },

    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },

    albumTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },

    mediaCount: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
    },

    mediaCountText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 3,
    },

    albumDate: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },

    videoIndicator: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 12,
        padding: 4,
    },

    moreIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 100,
    },

    moreText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },

    viewOnMapButton: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },

    viewOnMapText: {
        color: '#4A90E2',
        fontSize: 14,
        fontWeight: '600',
    },

    albumDescription: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 4,
        lineHeight: 16,
    },
});

export default StackedAlbumCard;
