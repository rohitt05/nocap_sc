// StripContent.tsx - Updated with larger thumbnails and reduced padding
import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { getMediaUrl } from '../../utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MediaItem {
    url: string;
    type: 'photo' | 'video';
}

interface StripProps {
    media: MediaItem[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

const StripContent: React.FC<StripProps> = ({ media, selectedIndex, onSelect }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(media.length / itemsPerPage);

    // Auto-navigate to page containing selected item
    useEffect(() => {
        const targetPage = Math.floor(selectedIndex / itemsPerPage);
        if (targetPage !== currentPage) {
            setCurrentPage(targetPage);
        }
    }, [selectedIndex]);

    const renderItem = (item: MediaItem, index: number) => {
        const isSelected = index === selectedIndex;
        return (
            <TouchableOpacity
                key={index}
                onPress={() => onSelect(index)}
                style={styles.item}
                activeOpacity={0.7}
            >
                <View style={[styles.thumb, isSelected && styles.selected]}>
                    {item.type === 'video' ? (
                        <Video
                            source={{ uri: getMediaUrl(item.url) }}
                            style={styles.media}
                            resizeMode="cover"
                            shouldPlay={false}
                            isMuted
                            useNativeControls={false}
                        />
                    ) : (
                        <Image source={{ uri: getMediaUrl(item.url) }} style={styles.media} />
                    )}
                    {item.type === 'video' && (
                        <MaterialIcons name="play-circle-filled" size={24} color="#fff" style={styles.playIcon} />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (media.length <= 1) return null;

    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, media.length);
    const pageItems = media.slice(startIndex, endIndex);

    return (
        <View style={styles.container}>
            {/* Items Row */}
            <View style={styles.itemsRow}>
                {pageItems.map((item, localIndex) =>
                    renderItem(item, startIndex + localIndex)
                )}
            </View>

            {/* Page Navigation */}
            {totalPages > 1 && (
                <View style={styles.pagination}>
                    <TouchableOpacity
                        onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        style={[styles.pageButton, currentPage === 0 && styles.disabled]}
                    >
                        <MaterialIcons name="chevron-left" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.pageIndicators}>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => setCurrentPage(i)}
                                style={[styles.dot, i === currentPage && styles.activeDot]}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage === totalPages - 1}
                        style={[styles.pageButton, currentPage === totalPages - 1 && styles.disabled]}
                    >
                        <MaterialIcons name="chevron-right" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // ✅ REDUCED PADDING CONTAINER
    container: {
        paddingVertical: 12, // Reduced from 20
        backgroundColor: 'rgba(0,0,0,0.25)', // Lighter background
    },
    itemsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8, // Reduced from 10
    },
    // ✅ LARGER THUMBNAILS
    item: {
        margin: 6, // Reduced margin
    },
    thumb: {
        width: 76, // Increased from 60
        height: 76, // Increased from 60
        borderRadius: 16, // Larger radius for bigger thumbs
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1a1a1a', // Better loading state
    },
    // ✅ THICKER SELECTION BORDER
    selected: {
        borderWidth: 4, // Thicker border
        borderColor: '#fff',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 8,
    },
    media: {
        width: '100%',
        height: '100%',
    },
    // ✅ BETTER POSITIONED PLAY ICON
    playIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 16,
        padding: 2,
    },
    // ✅ IMPROVED PAGINATION
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12, // Reduced from 15
    },
    pageButton: {
        padding: 10, // Larger touch area
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 24,
        marginHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    disabled: {
        opacity: 0.3,
    },
    pageIndicators: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    // ✅ BIGGER DOT INDICATORS
    dot: {
        width: 10, // Increased from 8
        height: 10, // Increased from 8
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginHorizontal: 5, // Increased spacing
    },
    activeDot: {
        backgroundColor: '#fff',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 4,
    },
});

export default StripContent;
