import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Entypo, Feather, FontAwesome } from '@expo/vector-icons';
import { fonts } from '../../../../utils/Fonts/fonts';
import { ResponseItemProps } from '../../types';
import { styles } from './styles';
import { Link } from 'expo-router';

const MediaResponse: React.FC<ResponseItemProps> = ({ item }) => {
    // State management
    const [videoState, setVideoState] = useState({
        playing: false,
        uri: "",
        error: null as string | null,
        loaded: false
    });

    const videoRef = useRef<Video>(null);
    const mediaUrl = item.content;

    // Helper function to format timestamp
    const formatTimestamp = (timestamp: string | number): string => {
        const date = new Date(timestamp);

        // Get day, month, hours and minutes
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const hours = date.getHours();
        const minutes = date.getMinutes();

        // Format hours for 12-hour clock
        const formattedHours = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';

        // Pad minutes with leading zero if needed
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        // Return formatted string: "17 Mar · 5:30 PM"
        return `${day} ${month} · ${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    // Transform Giphy URLs to direct GIF URLs
    const getDirectGiphyUrl = useCallback((url: string): string => {
        const matches = url.match(/giphy\.com\/gifs\/[\w-]+-([a-zA-Z0-9]+)$/);
        return matches && matches[1]
            ? `https://media.giphy.com/media/${matches[1]}/giphy.gif`
            : url;
    }, []);

    // Initialize video when component mounts
    useEffect(() => {
        if (item.type === 'video' && mediaUrl) {
            console.log('Initializing video with media_url:', mediaUrl);
            resolveVideoUri(mediaUrl);
        }
    }, [item, mediaUrl]);

    // Resolve video URI based on path format
    const resolveVideoUri = useCallback((uri: string): void => {
        console.log('Resolving video URI:', uri);

        // Handle different URI formats based on platform
        let resolvedUri = uri;
        if (uri.startsWith('/')) {
            resolvedUri = Platform.OS === 'android'
                ? `file://${uri}`
                : `${FileSystem.documentDirectory}${uri.substring(1)}`;
        }

        setVideoState(prev => ({
            ...prev,
            uri: resolvedUri,
            error: null,
            loaded: false,
            playing: false
        }));

        // Validate local file existence
        if (resolvedUri.startsWith('file://') || resolvedUri.includes(FileSystem.documentDirectory)) {
            validateFileExists(resolvedUri, uri);
        }
    }, []);

    // Validate if file exists at the resolved path
    const validateFileExists = useCallback((resolvedUri: string, originalUri: string): void => {
        const filePath = resolvedUri.replace('file://', '');

        FileSystem.getInfoAsync(filePath)
            .then(info => {
                if (!info.exists) {
                    console.log('File does not exist, trying alternate formats');
                    tryAlternateUriFormats(originalUri);
                } else {
                    console.log('File exists at path, proceeding with video');
                }
            })
            .catch(error => {
                console.log('Error checking file existence:', error);
                tryAlternateUriFormats(originalUri);
            });
    }, []);

    // Try different URI formats as fallbacks
    const tryAlternateUriFormats = useCallback((originalUri: string): void => {
        const alternateFormats = [
            `asset://${originalUri.replace(/^\//, '')}`,
            originalUri.replace(/^file:\/\//, ''),
            `content://media${originalUri}`,
            Platform.OS === 'ios' ? `asset:/${originalUri}` : null,
            `${FileSystem.cacheDirectory}${originalUri.replace(/^\//, '')}`,
            !originalUri.includes('://') && !originalUri.startsWith('/') ? `https://${originalUri}` : null,
            originalUri // Original as last resort
        ].filter(Boolean) as string[];

        console.log('Trying alternate URI formats:', alternateFormats);
        loadVideoWithFallbacks(alternateFormats, 0);
    }, []);

    // Attempt to load video with fallback URIs
    const loadVideoWithFallbacks = useCallback((uriList: string[], index: number): void => {
        if (index >= uriList.length) {
            console.log('All URI formats failed');
            setVideoState(prev => ({
                ...prev,
                error: "Could not load video with any URI format"
            }));
            return;
        }

        console.log(`Trying URI at index ${index}:`, uriList[index]);
        setVideoState(prev => ({
            ...prev,
            uri: uriList[index],
            error: null
        }));
    }, []);

    // Toggle video playback
    const toggleVideoPlayback = useCallback(async (): Promise<void> => {
        if (!videoRef.current) {
            console.log('Video reference is null');
            return;
        }

        try {
            if (!videoState.playing) {
                try {
                    const playResult = await videoRef.current.playAsync();
                    console.log('Play result:', playResult);
                    setVideoState(prev => ({ ...prev, playing: true }));
                } catch (playError) {
                    console.log('Direct play failed, attempting reload approach:', playError);

                    // Full reload approach
                    await videoRef.current.unloadAsync().catch(e => console.log('Unload error:', e));
                    await videoRef.current.loadAsync(
                        { uri: videoState.uri },
                        { shouldPlay: true, positionMillis: 0 },
                        false
                    );

                    setVideoState(prev => ({ ...prev, playing: true }));
                }
            } else {
                await videoRef.current.pauseAsync();
                setVideoState(prev => ({ ...prev, playing: false }));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error playing video";
            console.error('VIDEO PLAYBACK ERROR:', errorMessage);

            setVideoState(prev => ({ ...prev, error: errorMessage }));
        }
    }, [videoState.playing, videoState.uri]);

    // Handle video status updates
    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus): void => {
        if (!status.isLoaded) {
            setVideoState(prev => ({
                ...prev,
                error: status.error || "Video failed to load",
                loaded: false
            }));
            return;
        }

        // Update load and play states
        setVideoState(prev => ({
            ...prev,
            loaded: true,
            error: null,
            playing: status.isPlaying
        }));

        // Handle video completion
        if (status.didJustFinish) {
            console.log('Video playback finished');
            setVideoState(prev => ({ ...prev, playing: false }));
            videoRef.current?.setPositionAsync(0);
        }
    }, []);

    // Handle video loading errors
    const handleVideoError = useCallback((error: string): void => {
        console.log('Video error:', error);
        setVideoState(prev => ({ ...prev, error: `Error: ${error}` }));

        // Try alternate URIs if initial load fails
        if (videoState.uri === mediaUrl ||
            videoState.uri === `file://${mediaUrl}` ||
            videoState.uri.includes(FileSystem.documentDirectory)) {
            console.log('Initial URI failed, trying alternates');
            tryAlternateUriFormats(mediaUrl || "");
        }
    }, [mediaUrl, tryAlternateUriFormats, videoState.uri]);

    // Retry loading video after error
    const retryVideoLoad = useCallback((): void => {
        resolveVideoUri(mediaUrl || "");
    }, [mediaUrl, resolveVideoUri]);

    // Render appropriate media based on item type
    const renderMedia = useCallback(() => {
        if (!mediaUrl) return null;

        switch (item.type) {
            case 'image':
                return (
                    <Image
                        source={{ uri: mediaUrl }}
                        style={styles.mediaContent}
                        contentFit="cover"
                        transition={200}
                    />
                );

            case 'gif':
                return (
                    <Image
                        source={{ uri: getDirectGiphyUrl(mediaUrl) }}
                        style={styles.mediaContent}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                    />
                );

            case 'video':
                return (
                    <>
                        <Video
                            ref={videoRef}
                            source={{ uri: videoState.uri }}
                            style={styles.mediaContent}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={false}
                            isLooping={false}
                            useNativeControls={false}
                            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                            onError={handleVideoError}
                            onLoad={(status) => {
                                if (status.isLoaded) {
                                    setVideoState(prev => ({ ...prev, loaded: true, error: null }));
                                }
                            }}
                            posterSource={{ uri: mediaUrl }}
                            usePoster={true}
                            posterStyle={styles.mediaPoster}
                        />

                        {videoState.error && (
                            <View style={styles.errorOverlay}>
                                <Ionicons name="alert-circle" size={24} color="#FF5252" />
                                <Text style={styles.errorText}>
                                    {videoState.error.includes('Error:') ? 'Failed to load video' : videoState.error}
                                </Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={retryVideoLoad}
                                >
                                    <Ionicons name="refresh" size={16} color="white" />
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                );

            default:
                return null;
        }
    }, [
        item.type,
        mediaUrl,
        getDirectGiphyUrl,
        videoState,
        onPlaybackStatusUpdate,
        handleVideoError,
        retryVideoLoad
    ]);

    return (
        <View style={styles.mediaResponseItem}>
            {/* Media content */}
            <View style={styles.mediaContainer}>
                {renderMedia()}
            </View>

            {/* Gradient overlay */}
            <View style={styles.gradientOverlay} />

            {/* Header overlay */}

            <View style={styles.overlayHeader}>
                <Link href={`/Screens/user/users?id=${item.user.id}`} asChild>
                    <TouchableOpacity>
                        <Image
                            source={{ uri: item.user.avatar || 'https://via.placeholder.com/40' }}
                            style={styles.profilePic}
                            contentFit="cover"
                            transition={100}
                        />
                    </TouchableOpacity>
                </Link>
                <View style={styles.headerInfo}>
                    <Link href={`/Screens/user/users?id=${item.user.id}`} asChild>
                        <TouchableOpacity>
                            <Text style={styles.overlayUsername}>{item.user.username}</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* Timestamp now appears here */}
                <Text style={styles.overlayTimestamp}>{formatTimestamp(item.timestamp)}</Text>

                {/* Menu dots in top right corner */}
                <TouchableOpacity style={styles.menuDotsContainer}>
                    <Entypo name="dots-two-vertical" size={24} color="white" style={styles.menuDots} />
                </TouchableOpacity>
            </View>

            {/* Bottom bar with reactions */}
            <View style={styles.bottomBar}>
                <View style={styles.reactionsGroup}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="send" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reactionButton}>
                        <Entypo name="emoji-flirt" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reactionButton}>
                        <Entypo name="emoji-happy" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Play/Pause button */}
            {item.type === 'video' && (
                <TouchableOpacity
                    style={styles.debugButton}
                    onPress={toggleVideoPlayback}
                >
                    <FontAwesome
                        name={videoState.playing ? "pause" : "play"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};



export default MediaResponse;