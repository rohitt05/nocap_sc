import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Helper function to format timestamp
export const formatTimestamp = (timestamp: string | number): string => {
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
export const getDirectGiphyUrl = (url: string): string => {
    const matches = url.match(/giphy\.com\/gifs\/[\w-]+-([a-zA-Z0-9]+)$/);
    return matches && matches[1]
        ? `https://media.giphy.com/media/${matches[1]}/giphy.gif`
        : url;
};

// Video URI utility functions
export const resolveVideoUri = (uri: string): string => {
    console.log('Resolving video URI:', uri);

    // Handle different URI formats based on platform
    let resolvedUri = uri;
    if (uri.startsWith('/')) {
        resolvedUri = Platform.OS === 'android'
            ? `file://${uri}`
            : `${FileSystem.documentDirectory}${uri.substring(1)}`;
    }

    return resolvedUri;
};

// Validate if file exists at the resolved path
export const validateFileExists = async (resolvedUri: string): Promise<boolean> => {
    const filePath = resolvedUri.replace('file://', '');

    try {
        const info = await FileSystem.getInfoAsync(filePath);
        return info.exists;
    } catch (error) {
        console.log('Error checking file existence:', error);
        return false;
    }
};

// Generate alternate URI formats for fallbacks
export const generateAlternateUriFormats = (originalUri: string): string[] => {
    return [
        `asset://${originalUri.replace(/^\//, '')}`,
        originalUri.replace(/^file:\/\//, ''),
        `content://media${originalUri}`,
        Platform.OS === 'ios' ? `asset:/${originalUri}` : null,
        `${FileSystem.cacheDirectory}${originalUri.replace(/^\//, '')}`,
        !originalUri.includes('://') && !originalUri.startsWith('/') ? `https://${originalUri}` : null,
        originalUri // Original as last resort
    ].filter(Boolean) as string[];
};

// Use custom hook to manage video state
import { useState, useEffect, useRef } from 'react';
import { Video, AVPlaybackStatus } from 'expo-av';

interface VideoState {
    playing: boolean;
    uri: string;
    error: string | null;
    loaded: boolean;
}

export const useVideoPlayer = (initialUri: string) => {
    const [videoState, setVideoState] = useState<VideoState>({
        playing: false,
        uri: "",
        error: null,
        loaded: false
    });

    const videoRef = useRef<Video>(null);

    // Initialize video when component mounts
    useEffect(() => {
        if (initialUri) {
            initializeVideo(initialUri);
        }
    }, [initialUri]);

    const initializeVideo = (uri: string) => {
        const resolvedUri = resolveVideoUri(uri);

        setVideoState(prev => ({
            ...prev,
            uri: resolvedUri,
            error: null,
            loaded: false,
            playing: false
        }));

        // Validate local file existence
        if (resolvedUri.startsWith('file://') || resolvedUri.includes(FileSystem.documentDirectory)) {
            checkAndHandleFile(resolvedUri, uri);
        }
    };

    const checkAndHandleFile = async (resolvedUri: string, originalUri: string) => {
        const exists = await validateFileExists(resolvedUri);

        if (!exists) {
            console.log('File does not exist, trying alternate formats');
            const alternateFormats = generateAlternateUriFormats(originalUri);
            loadVideoWithFallbacks(alternateFormats, 0);
        } else {
            console.log('File exists at path, proceeding with video');
        }
    };

    const loadVideoWithFallbacks = (uriList: string[], index: number) => {
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
    };

    const togglePlayback = async () => {
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
    };

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
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
    };

    const handleVideoError = (error: string) => {
        console.log('Video error:', error);
        setVideoState(prev => ({ ...prev, error: `Error: ${error}` }));

        // Try alternate URIs if initial load fails
        if (videoState.uri === initialUri ||
            videoState.uri === `file://${initialUri}` ||
            videoState.uri.includes(FileSystem.documentDirectory)) {
            console.log('Initial URI failed, trying alternates');
            const alternateFormats = generateAlternateUriFormats(initialUri);
            loadVideoWithFallbacks(alternateFormats, 0);
        }
    };

    const retryVideoLoad = () => {
        initializeVideo(initialUri);
    };

    return {
        videoState,
        videoRef,
        togglePlayback,
        onPlaybackStatusUpdate,
        handleVideoError,
        retryVideoLoad
    };
};