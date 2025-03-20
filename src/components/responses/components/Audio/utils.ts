import { Audio } from 'expo-av';
import { useState, useCallback, useEffect } from 'react';

// Format timestamp to display as "DD MMM · h:mm AM/PM"
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

// Format time to display mm:ss
export const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Custom hook for audio playback
export const useAudioPlayer = (audioUri: string) => {
    const [audioState, setAudioState] = useState({
        isPlaying: false,
        duration: 0,
        position: 0,
        isLoaded: false,
        error: null as string | null
    });
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    // Calculate progress percentage
    const progressPercentage = audioState.duration > 0
        ? (audioState.position / audioState.duration) * 100
        : 0;

    // Update status when audio is playing
    const onPlaybackStatusUpdate = (status: Audio.PlaybackStatus) => {
        if (!status.isLoaded) {
            setAudioState(prev => ({ ...prev, isLoaded: false }));
            if (status.error) {
                console.log(`Audio playback error: ${status.error}`);
                setAudioState(prev => ({ ...prev, error: `Error: ${status.error}` }));
            }
            return;
        }

        setAudioState(prev => ({
            ...prev,
            isLoaded: true,
            isPlaying: status.isPlaying,
            duration: status.durationMillis || 0,
            position: status.positionMillis || 0
        }));

        // When audio finishes playing
        if (status.didJustFinish) {
            setAudioState(prev => ({ ...prev, isPlaying: false, position: 0 }));
            // Reset position to beginning
            sound?.setPositionAsync(0);
        }
    };

    // Load audio file
    const loadAudio = async () => {
        try {
            console.log('Loading audio from:', audioUri);
            setAudioState(prev => ({ ...prev, error: null }));

            // Unload any existing sound
            if (sound) {
                await sound.unloadAsync();
            }

            // Create and load the new sound
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUri },
                { shouldPlay: false },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            setAudioState(prev => ({ ...prev, isLoaded: true }));
            console.log('Audio loaded successfully');
        } catch (error) {
            console.error('Error loading audio:', error);
            setAudioState(prev => ({
                ...prev,
                error: 'Failed to load audio',
                isLoaded: false
            }));
        }
    };

    // Toggle play/pause
    const togglePlayback = async () => {
        if (!sound || !audioState.isLoaded) {
            console.log('Sound not loaded yet, trying to reload');
            await loadAudio();
            return;
        }

        try {
            if (audioState.isPlaying) {
                console.log('Pausing audio');
                await sound.pauseAsync();
            } else {
                console.log('Playing audio');
                await sound.playAsync();
            }
        } catch (error) {
            console.error('Error toggling playback:', error);
            setAudioState(prev => ({ ...prev, error: 'Failed to play audio' }));
        }
    };

    // Seek to position in audio
    const seekAudio = async (value: number) => {
        if (!sound || !audioState.isLoaded) return;

        const newPosition = (value / 100) * audioState.duration;
        try {
            await sound.setPositionAsync(newPosition);
        } catch (error) {
            console.error('Error seeking audio:', error);
        }
    };

    // Load audio when component mounts or URI changes
    useEffect(() => {
        loadAudio();

        // Clean up function
        return () => {
            if (sound) {
                console.log('Unloading sound');
                sound.unloadAsync();
            }
        };
    }, [audioUri]);

    return {
        audioState,
        progressPercentage,
        togglePlayback,
        seekAudio
    };
};