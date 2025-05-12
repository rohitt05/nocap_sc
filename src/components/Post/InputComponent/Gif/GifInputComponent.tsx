import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

const GIPHY_API_KEY = '2xMFIZQe6dKrdxU0Sz2c6Y3iQIYGbcmq';

const GifInputComponent = ({ onGifSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [gifs, setGifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGif, setSelectedGif] = useState(null);
    const [caption, setCaption] = useState('');
    const [offset, setOffset] = useState(0);
    const [hasMoreGifs, setHasMoreGifs] = useState(true);

    // Define max character limit - same as in MediaInput
    const MAX_CAPTION_LENGTH = 200;

    // Fetch trending GIFs when component mounts
    useEffect(() => {
        fetchTrendingGifs();
    }, []);

    // Fetch trending GIFs from Giphy API
    const fetchTrendingGifs = async (loadMore = false) => {
        if (selectedGif) return; // Don't fetch if we're in selection mode

        setLoading(true);
        setError(null);

        const currentOffset = loadMore ? offset : 0;

        try {
            const response = await fetch(
                `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=50&offset=${currentOffset}&rating=g`
            );
            const data = await response.json();

            // Check if we received fewer GIFs than requested, indicating we've reached the end
            const hasMore = data.data && data.data.length === 50;
            setHasMoreGifs(hasMore);

            // If loading more, append to existing GIFs; otherwise replace them
            setGifs(prevGifs => loadMore ? [...prevGifs, ...(data.data || [])] : (data.data || []));

            // Update offset for next load
            if (loadMore) {
                setOffset(currentOffset + 50);
            } else {
                setOffset(50);
            }
        } catch (err) {
            console.error('Error fetching trending gifs:', err);
            setError('Failed to load trending GIFs');
        } finally {
            setLoading(false);
        }
    };

    // Search for GIFs using the Giphy API
    const searchGifs = async (query, loadMore = false) => {
        if (!query.trim()) {
            fetchTrendingGifs();
            return;
        }

        setLoading(true);
        setError(null);

        const currentOffset = loadMore ? offset : 0;

        try {
            const response = await fetch(
                `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=50&offset=${currentOffset}&rating=g`
            );
            const data = await response.json();

            // Check if we received fewer GIFs than requested, indicating we've reached the end
            const hasMore = data.data && data.data.length === 50;
            setHasMoreGifs(hasMore);

            // If loading more, append to existing GIFs; otherwise replace them
            setGifs(prevGifs => loadMore ? [...prevGifs, ...(data.data || [])] : (data.data || []));

            // Update offset for next load
            if (loadMore) {
                setOffset(currentOffset + 50);
            } else {
                setOffset(50);
            }
        } catch (err) {
            console.error('Error searching for gifs:', err);
            setError('Failed to search for GIFs');
        } finally {
            setLoading(false);
        }
    };

    // Debounce search to avoid making too many API calls
    useEffect(() => {
        if (selectedGif) return; // Don't search if we're in selection mode

        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                searchGifs(searchQuery);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handle text input changes
    const handleSearch = (query) => {
        setSearchQuery(query);
        // Reset pagination when search query changes
        setOffset(0);
        setHasMoreGifs(true);
    };

    // Handle clear search input
    const handleClearSearch = () => {
        setSearchQuery('');
        setOffset(0);
        setHasMoreGifs(true);
        fetchTrendingGifs();
    };

    // Handle caption changes
    const handleCaptionChange = (text) => {
        // Limit text to max character length
        if (text.length <= MAX_CAPTION_LENGTH) {
            setCaption(text);

            // If we already have a GIF selected, update the parent with the new caption
            if (selectedGif && onGifSelect) {
                onGifSelect({
                    ...selectedGif,
                    caption: text
                });
            }
        }
    };

    // Handle GIF selection
    const handleGifSelect = (gif) => {
        setSelectedGif(gif);
        if (onGifSelect) {
            onGifSelect({
                ...gif,
                caption: caption, // Include any existing caption
                type: 'gif' // Add content type identifier
            });
        }
    };

    // Handle closing the selected GIF view
    const handleCloseSelected = () => {
        setSelectedGif(null);
        setCaption('');
    };

    // Render an empty state
    const renderEmptyState = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color="#666" />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchTrendingGifs} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (gifs.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.placeholderText}>
                        {searchQuery ? 'No GIFs found' : 'Search for a GIF to share'}
                    </Text>
                </View>
            );
        }

        return null;
    };

    // Render a GIF item
    const renderGifItem = ({ item }) => (
        <TouchableOpacity
            style={styles.gifItem}
            onPress={() => handleGifSelect(item)}
        >
            <Image
                source={{ uri: item.images.fixed_height.url }}
                style={styles.gifImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
            />
        </TouchableOpacity>
    );

    // Render the selected GIF view with caption input
    const renderSelectedGifView = () => {
        if (!selectedGif) return null;

        return (
            <View style={styles.selectedGifContainer}>
                <Image
                    source={{ uri: selectedGif.images.original.url }}
                    style={styles.selectedGifImage}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                />

                {/* Caption input area at the bottom */}
                <View style={captionStyles.captionOuterContainer}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                        style={captionStyles.keyboardAvoid}
                    >
                        <View style={captionStyles.captionWrapper}>
                            <TextInput
                                style={captionStyles.captionInput}
                                placeholder="Add a caption..."
                                placeholderTextColor="rgba(255, 255, 255, 0.9)"
                                value={caption}
                                onChangeText={handleCaptionChange}
                                multiline
                                maxLength={MAX_CAPTION_LENGTH}
                            />

                            {/* Character counter */}
                            <View style={captionStyles.counterContainer}>
                                <Text style={[
                                    captionStyles.characterCount,
                                    caption.length > MAX_CAPTION_LENGTH * 0.8 && captionStyles.characterCountWarning
                                ]}>
                                    {caption.length}/{MAX_CAPTION_LENGTH}
                                </Text>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleCloseSelected}
                >
                    <Ionicons name="close-circle" size={32} color="white" />
                </TouchableOpacity>
            </View>
        );
    };

    // If a GIF is selected, show only that GIF with caption input
    if (selectedGif) {
        return renderSelectedGifView();
    }

    // Handle loading more GIFs when scrolling to the end
    const handleLoadMore = () => {
        if (!loading && hasMoreGifs) {
            if (searchQuery) {
                searchGifs(searchQuery, true);
            } else {
                fetchTrendingGifs(true);
            }
        }
    };

    // Otherwise show the search interface
    return (
        <View style={styles.gifContainer}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.gifSearchInput, searchQuery ? { paddingRight: 40 } : {}]}
                    placeholder="Search for a GIF..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                {searchQuery ? (
                    <TouchableOpacity
                        style={searchBarStyles.clearButton}
                        onPress={handleClearSearch}
                    >
                        <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {gifs.length > 0 ? (
                <FlatList
                    data={gifs}
                    renderItem={renderGifItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.gifGrid}
                    onEndReachedThreshold={0.5}
                    onEndReached={handleLoadMore}
                    ListFooterComponent={
                        loading ? (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator size="small" color="#666" />
                                <Text style={styles.loaderText}>Loading more GIFs...</Text>
                            </View>
                        ) : (!hasMoreGifs && gifs.length > 20) ? (
                            <Text style={styles.endOfResultsText}>End of results</Text>
                        ) : null
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            ) : (
                renderEmptyState()
            )}
        </View>
    );
};

// Search bar styles for the clear button
const searchBarStyles = StyleSheet.create({
    clearButton: {
        position: 'absolute',
        right: 15,
        top: 25,
        transform: [{ translateY: -10 }],
        padding: 2,
        zIndex: 2,
    }
});

// Caption styles - same as in MediaInput
const captionStyles = StyleSheet.create({
    captionOuterContainer: {
        backgroundColor: 'transparent', // Transparent background
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 15,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    keyboardAvoid: {
        width: '100%',
    },
    captionWrapper: {
        width: '100%',
        backgroundColor: 'transparent', // Ensure wrapper is also transparent
    },
    captionInput: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        paddingVertical: 8,
        paddingHorizontal: 10,
        width: '100%',
        backgroundColor: 'transparent', // Transparent input background
        textShadowColor: 'rgba(0, 0, 0, 0.75)', // Add text shadow for better visibility on any background
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    counterContainer: {
        alignItems: 'flex-end',
        marginTop: 2,
        paddingRight: 4,
    },
    characterCount: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.5)', // Text shadow for counter too
        textShadowOffset: { width: 0.5, height: 0.5 },
        textShadowRadius: 1,
    },
    characterCountWarning: {
        color: '#FF4D4D',
    }
});

export default GifInputComponent;