// VideoPlayer.tsx - Final Working Version
import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    Animated 
} from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface VideoPlayerProps {
    uri: string;
    location?: string | null;
    time: string;
    viewCount?: number;
    isMultiple?: boolean;
    style?: any;
    onEyeIconPress?: () => void;
    onVideoPress?: () => void;
    disabled?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
    uri, 
    location, 
    time, 
    viewCount = 0,
    isMultiple = false,
    style,
    onEyeIconPress,
    onVideoPress,
    disabled = false
}) => {
    const videoRef = useRef<Video>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        
        if (isPlaying && showControls) {
            timeout = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [isPlaying, showControls]);

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
            setIsLoading(true);
            return;
        }

        setIsLoading(false);
        setIsPlaying(status.isPlaying);
        
        if (status.durationMillis && status.positionMillis !== undefined) {
            setProgress(status.positionMillis / status.durationMillis);
        }

        if (status.didJustFinish) {
            setIsPlaying(false);
            setProgress(0);
            videoRef.current?.setPositionAsync(0);
        }
    };

    const togglePlayPause = async () => {
        if (!videoRef.current || disabled) return;

        try {
            console.log('🎵 Play button pressed, current state:', isPlaying);
            if (isPlaying) {
                await videoRef.current.pauseAsync();
                console.log('⏸️ Video paused');
            } else {
                await videoRef.current.playAsync();
                console.log('▶️ Video playing');
            }
            setShowControls(true);
        } catch (error) {
            console.error('Video playback error:', error);
        }
    };

    const handleEyePress = (e: any) => {
        e?.stopPropagation();
        console.log('👀 Eye icon pressed in VideoPlayer');
        if (onEyeIconPress && !disabled) {
            onEyeIconPress();
        }
    };

    const handleVideoContentPress = () => {
        if (disabled) return;
        
        console.log('📱 Video content area pressed');
        if (onVideoPress && isMultiple) {
            console.log('📱 Calling onVideoPress for expansion');
            onVideoPress();
        } else {
            console.log('📱 Single story or no onVideoPress handler');
        }
    };

    return (
        <View style={[styles.container, style]}>
            {/* ✅ FIXED: Single TouchableOpacity for entire video area */}
            <TouchableOpacity 
                style={styles.touchableArea}
                onPress={handleVideoContentPress}
                activeOpacity={isMultiple ? 0.9 : 1}
                disabled={disabled}
            >
                <Video
                    ref={videoRef}
                    source={{ uri }}
                    style={styles.video}
                    resizeMode="cover"
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    shouldPlay={false}
                    isLooping={false}
                    useNativeControls={false}
                />

                {/* Single Black Gradient */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.singleGradientOverlay}
                />
                
                <View style={styles.storyOverlay}>
                    <View style={styles.leftSection} />
                    
                    <View style={styles.rightSection}>
                        <Text style={[
                            styles.timeText,
                            !isMultiple && styles.singleStoryTimeText
                        ]}>
                            {time}
                        </Text>
                        
                        {location && (
                            <View style={styles.locationRow}>
                                <Ionicons 
                                    name="location" 
                                    size={isMultiple ? 10 : 16} 
                                    color="#fff" 
                                />
                                <Text style={[
                                    styles.locationText,
                                    !isMultiple && styles.singleStoryLocationText
                                ]} numberOfLines={1}>
                                    {location}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {/* ✅ Play Button - Highest Priority */}
            {(isLoading || !isPlaying || showControls) && (
                <TouchableOpacity 
                    style={styles.playButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        console.log('🎯 Play button touched');
                        togglePlayPause();
                    }}
                    activeOpacity={0.7}
                    disabled={disabled}
                >
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : (
                        <Ionicons 
                            name={isPlaying ? "pause" : "play"} 
                            size={isMultiple ? 32 : 48} 
                            color="#fff"
                            style={styles.playIcon}
                        />
                    )}
                </TouchableOpacity>
            )}

            {/* ✅ Eye Icon - High Priority */}
            <TouchableOpacity 
                style={styles.eyeButton}
                onPress={handleEyePress}
                disabled={disabled}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={0.7}
            >
                <View style={styles.eyeContainer}>
                    <Text style={styles.eyeIcon}>👀</Text>
                    {viewCount > 0 && (
                        <Text style={styles.viewCountText}>
                            {viewCount}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>

            {/* Progress Timeline */}
            <View style={styles.timelineContainer}>
                <View 
                    style={[
                        styles.timelineFill, 
                        { width: `${progress * 100}%` }
                    ]} 
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
    },
    
    // ✅ Single touchable area for video expansion
    touchableArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    
    // ✅ Play Button - Positioned absolutely with highest priority
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -40,
        marginLeft: -40,
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20, // Highest priority
        // backgroundColor: 'rgba(0,0,0,0.1)',
    },
    
    playIcon: {
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    
    // ✅ Eye Button - Positioned absolutely
    eyeButton: {
        position: 'absolute',
        bottom: 5,
        // left: 10,
        zIndex: 15, // High priority
        padding: 5,
    },
    
    eyeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,

        minWidth: 40,
        minHeight: 30,
        justifyContent: 'center',
    },
    eyeIcon: {
        fontSize: 16,
    },
    viewCountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 3,
    },
    
    singleGradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        zIndex: 2,
    },
    
    storyOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: 10,
        paddingTop: 30,
        paddingLeft: 60, // Space for eye icon
        zIndex: 3,
    },
    
    leftSection: {
        flex: 1,
        alignItems: 'flex-start',
    },
    
    rightSection: {
        flex: 1,
        alignItems: 'flex-end',
    },
    timeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '600',
        textAlign: 'right',
        marginBottom: 4,
        lineHeight: 12,
    },
    singleStoryTimeText: {
        fontSize: 14,
        lineHeight: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        maxWidth: '100%',
    },
    locationText: {
        color: '#fff',
        fontSize: 7,
        fontWeight: '500',
        marginLeft: 3,
        textAlign: 'right',
        lineHeight: 9,
    },
    singleStoryLocationText: {
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '600',
        lineHeight: 16,
    },
    
    timelineContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        zIndex: 4,
    },
    timelineFill: {
        height: '100%',
        backgroundColor: '#4A90E2',
        borderRadius: 1.5,
    },
});

export default VideoPlayer;
