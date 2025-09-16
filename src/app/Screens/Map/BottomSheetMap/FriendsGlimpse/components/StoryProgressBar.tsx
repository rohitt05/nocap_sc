import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Story {
    id: string;
    type: 'image' | 'video';
    url: string;
    uploadedTime: string;
    timestamp: number;
    duration: number;
}

interface StoryProgressBarProps {
    stories: Story[];
    currentStoryIndex: number;
    progress: Animated.Value;
    isVideoLoading?: boolean;
    videoProgress?: number;
}

const StoryProgressBar: React.FC<StoryProgressBarProps> = ({
    stories,
    currentStoryIndex,
    progress,
    isVideoLoading = false,
    videoProgress = 0
}) => {
    const currentStory = stories[currentStoryIndex];
    const isCurrentStoryVideo = currentStory?.type === 'video';

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressBarsRow}>
                {stories.map((_, index) => (
                    <View key={index} style={styles.progressBarWrapper}>
                        <View style={styles.progressBarBackground} />
                        <Animated.View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: index < currentStoryIndex 
                                        ? '100%' 
                                        : index === currentStoryIndex
                                            ? (() => {
                                                // ✅ HANDLE VIDEO LOADING: If video is loading, show 0%
                                                if (isCurrentStoryVideo && isVideoLoading) {
                                                    return '0%';
                                                }
                                                
                                                // ✅ USE VIDEO PROGRESS: For videos, use actual playback progress
                                                if (isCurrentStoryVideo && !isVideoLoading) {
                                                    return `${videoProgress * 100}%`;
                                                }
                                                
                                                // ✅ USE ANIMATED PROGRESS: For images, use timer-based progress
                                                return progress.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%'],
                                                    extrapolate: 'clamp'
                                                });
                                            })()
                                            : '0%'
                                }
                            ]}
                        />
                        
                        {/* ✅ LOADING INDICATOR: Show subtle loading state for current video */}
                        {index === currentStoryIndex && isCurrentStoryVideo && isVideoLoading && (
                            <Animated.View style={styles.loadingIndicator} />
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        position: 'absolute',
        top: 25,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    progressBarsRow: {
        flexDirection: 'row',
        width: '30%',
        gap: 3,
        backgroundColor: 'transparent',
    },
    progressBarWrapper: {
        flex: 1,
        height: 1,
        position: 'relative',
        backgroundColor: 'transparent',
    },
    progressBarBackground: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 0.5,
    },
    progressBarFill: {
        position: 'absolute',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 0.5,
    },
    loadingIndicator: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 0.5,
    },
});

export default StoryProgressBar;
