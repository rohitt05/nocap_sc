import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, Animated } from 'react-native';
import { supabase } from '../../../../../../lib/supabase';
import * as FileSystem from 'expo-file-system';
import ProfilesRow from './components/ProfilesRow';
import StoryViewer from './components/StoryViewer';
import FloatingProfile from './components/FloatingProfile';

const { width: screenWidth } = Dimensions.get('window');

interface Story {
    id: string;
    type: 'image' | 'video';
    url: string;
    uploadedTime: string;
    timestamp: number;
    duration: number;
     caption: string;
}

interface Friend {
    id: string;
    name: string;
    username: string;
    profilePic: string;
    stories: Story[];
    lastSeen: string;
    isOnline: boolean;
}

const FriendsGlimpse: React.FC = () => {
    // All hooks at top level
    const [friendsData, setFriendsData] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const [isMounted, setIsMounted] = useState(true);
    const [scrollOffset, setScrollOffset] = useState(0);
    // ✅ NEW: Preloading states
    const [preloadedMedia, setPreloadedMedia] = useState<{ [key: string]: string }>({});
    const [preloadProgress, setPreloadProgress] = useState<{ [key: string]: number }>({});

    const scrollViewRef = useRef<ScrollView>(null);
    const flatListRef = useRef<FlatList>(null);
    const progress = useRef(new Animated.Value(0)).current;
    const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);

    const PROFILE_ITEM_WIDTH = 50;
    const FIXED_HIGHLIGHT_INDEX = 0;

    const sortedFriends: Friend[] = useMemo(() => {
        return [...friendsData].sort((a, b) => b.stories[0]?.timestamp - a.stories?.timestamp);
    }, [friendsData]);

    const currentFriend = useMemo(() => sortedFriends[currentUserIndex], [sortedFriends, currentUserIndex]);
    const currentStory = useMemo(() => currentFriend?.stories[currentStoryIndex], [currentFriend, currentStoryIndex]);

    // ✅ NEW: Get full URL from Supabase storage
    const getMediaUrl = async (mediaPath: string): Promise<string> => {
        try {
            console.log('🔗 Getting signed URL for:', mediaPath);
            const { data, error } = await supabase.storage
                .from('media_bucket')
                .createSignedUrl(mediaPath, 3600); // 1 hour expiry

            if (error) {
                console.error('❌ Error getting signed URL:', error);
                throw error;
            }

            console.log('✅ Got signed URL:', data.signedUrl);
            return data.signedUrl;
        } catch (error) {
            console.error('❌ Failed to get media URL:', error);
            throw error;
        }
    };

    // ✅ NEW: Preload media to local cache
    const preloadMedia = async (story: Story): Promise<string> => {
        try {
            const cacheKey = story.id;

            // Check if already preloaded
            if (preloadedMedia[cacheKey]) {
                console.log('📦 Using cached media for:', story.id);
                return preloadedMedia[cacheKey];
            }

            console.log('⬇️ Preloading media:', story.url);

            // Get full URL first
            const fullUrl = await getMediaUrl(story.url);

            // Create local cache path
            const filename = `story_${story.id}_${Date.now()}.${story.type === 'video' ? 'mp4' : 'jpg'}`;
            const localPath = `${FileSystem.cacheDirectory}${filename}`;

            // Check if already cached locally
            const fileInfo = await FileSystem.getInfoAsync(localPath);
            if (fileInfo.exists) {
                console.log('📁 Found cached file:', localPath);
                setPreloadedMedia(prev => ({ ...prev, [cacheKey]: localPath }));
                return localPath;
            }

            // Download to cache
            console.log('⬇️ Downloading to cache:', localPath);
            const downloadResult = await FileSystem.downloadAsync(fullUrl, localPath);

            if (downloadResult.status === 200) {
                console.log('✅ Successfully cached:', localPath);
                setPreloadedMedia(prev => ({ ...prev, [cacheKey]: localPath }));
                return localPath;
            } else {
                console.warn('⚠️ Download failed, using original URL');
                return fullUrl;
            }
        } catch (error) {
            console.error('❌ Preload failed for:', story.id, error);
            // Fallback to getting signed URL
            try {
                return await getMediaUrl(story.url);
            } catch (urlError) {
                console.error('❌ Failed to get URL fallback:', urlError);
                return story.url; // Last resort - use original path
            }
        }
    };

    // ✅ NEW: Preload all stories in background
    const preloadAllStories = async (friends: Friend[]) => {
        console.log('🚀 Starting story preloading...');

        // Get all stories from all friends
        const allStories = friends.flatMap(friend => friend.stories);

        // Preload in parallel with limited concurrency
        const preloadPromises = allStories.slice(0, 10).map(async (story) => {
            try {
                await preloadMedia(story);
            } catch (error) {
                console.warn('⚠️ Failed to preload story:', story.id, error);
            }
        });

        await Promise.allSettled(preloadPromises);
        console.log('✅ Story preloading completed');
    };

    // ✅ UPDATED: Fetch friends' stories with URL fixing
    const fetchFriendsStories = async () => {
        try {
            console.log('📱 Fetching friends stories...');
            setLoading(true);
            setError(null);

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error('❌ User not authenticated:', userError);
                setError('User not authenticated');
                return;
            }

            const { data: storiesData, error: storiesError } = await supabase
                .from('friends_stories')
                .select('*')
                .order('created_at', { ascending: false });

            if (storiesError) {
                console.error('❌ Error fetching stories:', storiesError);
                setError('Failed to fetch friends stories');
                return;
            }

            console.log('✅ Fetched stories:', storiesData?.length || 0);

            if (!storiesData || storiesData.length === 0) {
                setFriendsData([]);
                return;
            }

            const friendsMap = new Map<string, Friend>();

            // ✅ UPDATED: Process stories and get full URLs
            const processedStories = await Promise.all(
                storiesData.map(async (dbStory: any) => {
                    try {
                        // Get full URL for the media
                        const fullUrl = await getMediaUrl(dbStory.media_url);

                        return {
                            ...dbStory,
                            full_url: fullUrl
                        };
                    } catch (error) {
                        console.warn('⚠️ Failed to get URL for story:', dbStory.id, error);
                        return {
                            ...dbStory,
                            full_url: dbStory.media_url // Fallback to original
                        };
                    }
                })
            );

            processedStories.forEach((dbStory: any) => {
                const userId = dbStory.user_id;

                const story: Story = {
                    id: dbStory.id,
                    type: dbStory.media_type === 'photo' ? 'image' : 'video',
                    url: dbStory.full_url,
                    uploadedTime: dbStory.created_at,
                    timestamp: new Date(dbStory.created_at).getTime(),
                    duration: dbStory.duration_ms || (dbStory.media_type === 'video' ? 15000 : 5000),
                    caption: dbStory.caption ?? '',  // <---- THIS LINE ADDED!
                };


                if (friendsMap.has(userId)) {
                    friendsMap.get(userId)!.stories.push(story);
                } else {
                    const friend: Friend = {
                        id: userId,
                        name: dbStory.full_name || dbStory.username,
                        username: dbStory.username,
                        profilePic: dbStory.avatar_url || `https://ui-avatars.com/api/?name=${dbStory.username}&background=random`,
                        stories: [story],
                        lastSeen: new Date().toISOString(),
                        isOnline: Math.random() > 0.5,
                    };
                    friendsMap.set(userId, friend);
                }
            });

            const friendsArray = Array.from(friendsMap.values()).sort((a, b) => {
                const aLatest = Math.max(...a.stories.map(s => s.timestamp));
                const bLatest = Math.max(...b.stories.map(s => s.timestamp));
                return bLatest - aLatest;
            });

            setFriendsData(friendsArray);
            console.log('✅ Processed friends:', friendsArray.length);

            // ✅ START PRELOADING: Begin caching stories in background
            preloadAllStories(friendsArray);

        } catch (error) {
            console.error('❌ Exception fetching friends stories:', error);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW: Get optimized media URL (cached if available)
    const getOptimizedMediaUrl = async (story: Story): Promise<string> => {
        const cacheKey = story.id;

        // Return cached version if available
        if (preloadedMedia[cacheKey]) {
            console.log('🚀 Using preloaded media for:', story.id);
            return preloadedMedia[cacheKey];
        }

        // Otherwise preload it now
        console.log('⏳ Preloading media on-demand for:', story.id);
        return await preloadMedia(story);
    };

    useEffect(() => {
        fetchFriendsStories();
    }, []);

    useEffect(() => {
        return () => {
            setIsMounted(false);

            if (progressAnimation.current) {
                progressAnimation.current.stop();
            }

            progress.stopAnimation();
            progress.setValue(0);
        };
    }, []);

    useEffect(() => {
        if (!currentStory || isPaused || !isMounted) return;

        if (currentStory.type === 'video') {
            return;
        }

        progress.setValue(0);

        const animation = Animated.timing(progress, {
            toValue: 1,
            duration: currentStory.duration,
            useNativeDriver: false,
        });

        progressAnimation.current = animation;
        animation.start(({ finished }) => {
            if (finished && !isPaused && isMounted) {
                handleStoryComplete();
            }
        });

        return () => {
            animation.stop();
        };
    }, [currentUserIndex, currentStoryIndex, isPaused, currentStory?.type, isMounted]);

    // All function definitions here...
    const handleVideoProgressUpdate = (videoProgressValue: number) => {
        if (!isMounted) return;
        setVideoProgress(videoProgressValue);
        if (videoProgressValue >= 0.99 && !isPaused && isMounted) {
            handleStoryComplete();
        }
    };

    const handleVideoLoadingChange = (loading: boolean) => {
        if (!isMounted) return;
        setIsVideoLoading(loading);
        if (loading && progressAnimation.current) {
            progressAnimation.current.stop();
        }
    };

    const handleStoryComplete = () => {
        if (!isMounted) return;

        const hasMoreStories = currentStoryIndex < currentFriend.stories.length - 1;

        if (hasMoreStories) {
            setCurrentStoryIndex(prev => prev + 1);
            setVideoProgress(0);
        } else {
            const hasMoreUsers = currentUserIndex < sortedFriends.length - 1;
            if (hasMoreUsers) {
                setCurrentUserIndex(prev => prev + 1);
                setCurrentStoryIndex(0);
                setVideoProgress(0);

                flatListRef.current?.scrollToIndex({
                    index: currentUserIndex + 1,
                    animated: true
                });

                updateProfileScroll(currentUserIndex + 1);
            }
        }
    };

    const handleStoryTap = (direction: 'left' | 'right') => {
        if (!isMounted) return;

        if (progressAnimation.current) {
            progressAnimation.current.stop();
        }

        if (direction === 'right') {
            const hasMoreStories = currentStoryIndex < currentFriend.stories.length - 1;

            if (hasMoreStories) {
                setCurrentStoryIndex(prev => prev + 1);
                setVideoProgress(0);
            } else {
                const hasMoreUsers = currentUserIndex < sortedFriends.length - 1;
                if (hasMoreUsers) {
                    setCurrentUserIndex(prev => prev + 1);
                    setCurrentStoryIndex(0);
                    setVideoProgress(0);

                    flatListRef.current?.scrollToIndex({
                        index: currentUserIndex + 1,
                        animated: true
                    });
                    updateProfileScroll(currentUserIndex + 1);
                }
            }
        } else {
            if (currentStoryIndex > 0) {
                setCurrentStoryIndex(prev => prev - 1);
                setVideoProgress(0);
            } else {
                if (currentUserIndex > 0) {
                    const prevUserIndex = currentUserIndex - 1;
                    const prevUser = sortedFriends[prevUserIndex];

                    setCurrentUserIndex(prevUserIndex);
                    setCurrentStoryIndex(prevUser.stories.length - 1);
                    setVideoProgress(0);

                    flatListRef.current?.scrollToIndex({
                        index: prevUserIndex,
                        animated: true
                    });
                    updateProfileScroll(prevUserIndex);
                }
            }
        }
    };

    const handleUserSwipe = (direction: 'left' | 'right') => {
        if (!isMounted) return;

        if (progressAnimation.current) {
            progressAnimation.current.stop();
        }

        if (direction === 'left' && currentUserIndex < sortedFriends.length - 1) {
            setCurrentUserIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
            setVideoProgress(0);

            flatListRef.current?.scrollToIndex({
                index: currentUserIndex + 1,
                animated: true
            });
            updateProfileScroll(currentUserIndex + 1);
        } else if (direction === 'right' && currentUserIndex > 0) {
            setCurrentUserIndex(prev => prev - 1);
            setCurrentStoryIndex(0);
            setVideoProgress(0);

            flatListRef.current?.scrollToIndex({
                index: currentUserIndex - 1,
                animated: true
            });
            updateProfileScroll(currentUserIndex - 1);
        }
    };

    const updateProfileScroll = (userIndex: number) => {
        if (scrollViewRef.current) {
            const targetProfilePosition = userIndex * PROFILE_ITEM_WIDTH;
            const highlightPosition = FIXED_HIGHLIGHT_INDEX * PROFILE_ITEM_WIDTH;
            const scrollAmount = targetProfilePosition - highlightPosition;

            scrollViewRef.current.scrollTo({
                x: Math.max(0, scrollAmount),
                animated: true
            });
        }
    };

    const handleProfilePress = (index: number) => {
        if (index === currentUserIndex || !isMounted) return;

        if (progressAnimation.current) {
            progressAnimation.current.stop();
        }

        setCurrentUserIndex(index);
        setCurrentStoryIndex(0);
        setVideoProgress(0);

        flatListRef.current?.scrollToIndex({
            index: index,
            animated: true
        });
    };

    const handleProfileScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        setScrollOffset(offsetX);
    };

    const handleMenuPress = () => {
        console.log('Story menu pressed for:', currentFriend.name, 'Story:', currentStoryIndex + 1);
    };

    const handleLongPressStart = () => {
        setIsPaused(true);
        if (progressAnimation.current) {
            progressAnimation.current.stop();
        }
    };

    const handleLongPressEnd = () => {
        setIsPaused(false);
    };

    const getFixedHighlightPosition = () => {
        const baseX = 16;
        const profileSpacing = 50;
        const regularProfileWidth = 40;
        const floatingProfileWidth = 58;

        const profileCenterX = baseX + (FIXED_HIGHLIGHT_INDEX * profileSpacing) + (regularProfileWidth / 2) - scrollOffset;
        const floatingX = profileCenterX - (floatingProfileWidth / 2);

        const minX = 16;
        const maxX = screenWidth - floatingProfileWidth - 16;

        return Math.max(minX, Math.min(maxX, floatingX));
    };

    const getExtraPadding = () => {
        const lastProfilePosition = (sortedFriends.length - 1) * PROFILE_ITEM_WIDTH;
        const highlightPosition = FIXED_HIGHLIGHT_INDEX * PROFILE_ITEM_WIDTH;
        const minScrollNeeded = lastProfilePosition - highlightPosition;
        const extraPadding = Math.max(0, minScrollNeeded) + screenWidth;
        return extraPadding;
    };

    // Conditional rendering after all hooks
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading friends' stories...</Text>
                    <Text style={styles.subLoadingText}>Preparing media for you...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>😕 {error}</Text>
                    <Text style={styles.retryText} onPress={fetchFriendsStories}>
                        Tap to retry
                    </Text>
                </View>
            </View>
        );
    }

    if (!sortedFriends || sortedFriends.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>👥</Text>
                    <Text style={styles.emptyText}>No friends' stories yet</Text>
                    <Text style={styles.emptySubtext}>Stories from your friends will appear here</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ProfilesRow
                friends={sortedFriends}
                currentUserIndex={currentUserIndex}
                onProfilePress={handleProfilePress}
                onScroll={handleProfileScroll}
                scrollRef={scrollViewRef}
                getExtraPadding={getExtraPadding}
            />

            <StoryViewer
                friends={sortedFriends}
                currentUserIndex={currentUserIndex}
                currentStoryIndex={currentStoryIndex}
                onUserSwipe={handleUserSwipe}
                onStoryTap={handleStoryTap}
                flatListRef={flatListRef}
                onMenuPress={handleMenuPress}
                progress={progress}
                isPaused={isPaused}
                onLongPressStart={handleLongPressStart}
                onLongPressEnd={handleLongPressEnd}
                onVideoProgressUpdate={handleVideoProgressUpdate}
                onVideoLoadingChange={handleVideoLoadingChange}
                videoProgress={videoProgress}
                isVideoLoading={isVideoLoading}
                getOptimizedMediaUrl={getOptimizedMediaUrl} // ✅ NEW: Pass preloading function
            />

            <FloatingProfile
                currentFriend={currentFriend}
                position={getFixedHighlightPosition()}
                onPress={() => handleProfilePress(currentUserIndex)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        textAlign: 'center',
    },
    subLoadingText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 12,
    },
    retryText: {
        color: '#4A90E2',
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default FriendsGlimpse;
