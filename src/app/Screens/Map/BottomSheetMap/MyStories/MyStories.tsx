// MyStories.tsx - Fixed with Stable Heights
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Modal,
    Animated,
    Alert,
} from 'react-native';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PanGestureHandler, State as GestureState } from 'react-native-gesture-handler';
import { supabase } from '../../../../../../lib/supabase';

import { CARD_MARGIN, CARD_WIDTH, HORIZONTAL_PADDING, SHEET_HEIGHT, styles, width } from './styles';

// ✅ Import VideoPlayer Component
import VideoPlayer from './VideoPlayer';

interface MyStoriesProps {
    onCreateFirstStory?: () => void;
}


interface Story {
    id: string;
    media_url: string;
    media_type: 'photo' | 'video';
    caption: string;
    location_name: string;
    created_at: string;
    view_count: number;
    signedUrl?: string;
}

interface StoryViewer {
    id: string;
    viewer_user_id: string;
    story_id: string;
    viewed_at: string;
    users?: {
        id: string;
        username: string;
        full_name: string;
        avatar_url: string;
    };
}
const MyStories: React.FC<MyStoriesProps> = ({ onCreateFirstStory }) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);

    // Viewers Sheet State
    const [showViewersSheet, setShowViewersSheet] = useState(false);
    const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
    const [viewers, setViewers] = useState<StoryViewer[]>([]);
    const [loadingViewers, setLoadingViewers] = useState(false);
    const [sheetAnimation] = useState(new Animated.Value(0));

    // Expanded Story State
    const [expandedStory, setExpandedStory] = useState<Story | null>(null);
    const [showExpandedModal, setShowExpandedModal] = useState(false);
    const [expandedAnimation] = useState(new Animated.Value(0));

    // ✅ FIXED: Generate stable heights based on story ID
    const storyHeights = useMemo(() => {
        const heights = [140, 160, 180, 200, 170, 190, 150, 220];
        const storyHeightMap: { [key: string]: number } = {};

        stories.forEach((story, index) => {
            // Use story ID to generate consistent height
            const hashCode = story.id.split('').reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);
            const heightIndex = Math.abs(hashCode) % heights.length;
            storyHeightMap[story.id] = heights[heightIndex];
        });

        return storyHeightMap;
    }, [stories.map(s => s.id).join(',')]); // Only recalculate when story IDs change

    useEffect(() => {
        loadStories();
    }, []);

    const getRelativeTime = (timestamp: string): string => {
        const now = new Date().getTime();
        const past = new Date(timestamp).getTime();
        const diffSeconds = Math.floor((now - past) / 1000);

        if (diffSeconds < 60) return 'Just now';
        if (diffSeconds < 3600) {
            const mins = Math.floor(diffSeconds / 60);
            return `${mins} min${mins > 1 ? 's' : ''} ago`;
        }
        if (diffSeconds < 86400) {
            const hours = Math.floor(diffSeconds / 3600);
            return `${hours} hr${hours > 1 ? 's' : ''} ago`;
        }
        const days = Math.floor(diffSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const loadStories = async (): Promise<void> => {
        try {
            setLoading(true);

            // Always check correct user!
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error('❌ Not authenticated:', userError);
                setStories([]);
                setLoading(false);
                return;
            }
            console.log('Current User ID =', user.id);

            const { data: storiesData, error } = await supabase
                .from('my_stories')
                .select('*')
                .order('created_at', { ascending: false });

            console.log('Fetched storiesData from my_stories =', storiesData);

            if (error) {
                console.error('❌ Database error:', error);
                setStories([]);
                return;
            }

            if (!storiesData || storiesData.length === 0) {
                setStories([]);
                return;
            }

            // QUICK SANITY CHECK
            for (const story of storiesData) {
                // This should ALWAYS match user.id
                if ('user_id' in story && story.user_id !== user.id) {
                    console.error('❌ Story with wrong user_id found in my_stories:', story);
                }
            }

            const storiesWithUrls = await Promise.all(
                storiesData.map(async (story) => {
                    const { data: signedUrlData } = await supabase.storage
                        .from('media_bucket')
                        .createSignedUrl(story.media_url, 60 * 60);

                    return {
                        ...story,
                        signedUrl: signedUrlData?.signedUrl
                    };
                })
            );

            setStories(storiesWithUrls);
            console.log('✅ Stories loaded:', storiesWithUrls.length);
        } catch (error) {
            console.error('❌ Error loading stories:', error);
            setStories([]);
        } finally {
            setLoading(false);
        }
    };



    // All your existing functions (deleteStory, handleOptionsPress, etc.) remain the same...
    const deleteStory = async (storyId: string) => {
        try {
            setDeletingStoryId(storyId);
            console.log('🗑️ Deleting story:', storyId);

            const { error } = await supabase
                .from('stories')
                .delete()
                .eq('id', storyId);

            if (error) {
                console.error('❌ Error deleting story:', error);
                Alert.alert('Error', 'Failed to delete story. Please try again.');
                return;
            }

            setStories(prevStories => prevStories.filter(story => story.id !== storyId));
            console.log('✅ Story deleted successfully');
            Alert.alert('Success', 'Story deleted successfully');

        } catch (error) {
            console.error('❌ Exception deleting story:', error);
            Alert.alert('Error', 'An unexpected error occurred while deleting the story.');
        } finally {
            setDeletingStoryId(null);
        }
    };

    const handleOptionsPress = (storyId: string) => {
        console.log('⚙️ Options pressed for story:', storyId);

        Alert.alert(
            'Delete Story',
            'Are you sure you want to delete this story? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => console.log('❌ Delete cancelled')
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        console.log('✅ Delete confirmed');
                        deleteStory(storyId);
                    }
                }
            ]
        );
    };

    const fetchStoryViewers = async (storyId: string) => {
        try {
            setLoadingViewers(true);
            console.log('👀 Fetching viewers for story:', storyId);

            const { data: viewersData, error } = await supabase
                .from('story_views')
                .select(`
                    id,
                    viewer_user_id,
                    story_id,
                    viewed_at,
                    users:viewer_user_id (
                        id,
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('story_id', storyId)
                .order('viewed_at', { ascending: false });

            if (error) {
                console.error('❌ Error fetching viewers:', error);
                setViewers([]);
                return;
            }

            console.log('✅ Viewers data:', viewersData);
            setViewers(viewersData || []);
            console.log('✅ Viewers loaded:', viewersData?.length || 0);
        } catch (error) {
            console.error('❌ Exception fetching viewers:', error);
            setViewers([]);
        } finally {
            setLoadingViewers(false);
        }
    };

    const handleEyeIconPress = async (storyId: string) => {
        console.log('👀 handleEyeIconPress called with storyId:', storyId);
        console.log('📱 Current showViewersSheet state:', showViewersSheet);

        setSelectedStoryId(storyId);
        setShowViewersSheet(true);

        console.log('📱 Modal should be visible now');

        Animated.timing(sheetAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            console.log('✅ Animation completed');
        });

        await fetchStoryViewers(storyId);
    };

    const handleCloseViewersSheet = () => {
        Animated.timing(sheetAnimation, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setShowViewersSheet(false);
            setSelectedStoryId(null);
            setViewers([]);
        });
    };

    const handleStoryPress = (story: Story) => {
        if (stories.length <= 1) return;

        console.log('📱 Expanding story:', story.id);
        setExpandedStory(story);
        setShowExpandedModal(true);

        Animated.timing(expandedAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleCloseExpandedStory = () => {
        Animated.timing(expandedAnimation, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setShowExpandedModal(false);
            setExpandedStory(null);
        });
    };

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: sheetAnimation } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === GestureState.ACTIVE) {
            const { translationY, velocityY } = event.nativeEvent;

            if (translationY < -50 || velocityY < -500) {
                Animated.timing(sheetAnimation, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            } else {
                handleCloseViewersSheet();
            }
        }
    };

    // ✅ FIXED: Use stable heights from useMemo
    const renderStoryItem = ({ item, index }: { item: Story; index: number }) => {
        const isMultiple = stories.length > 1;
        // ✅ FIXED: Get consistent height from pre-calculated map
        const itemHeight = isMultiple ? storyHeights[item.id] || 180 : undefined;

        let itemWidth;
        if (isMultiple) {
            if (stories.length === 2) {
                itemWidth = (width - (HORIZONTAL_PADDING * 2) - (CARD_MARGIN * 2)) / 2;
            } else {
                itemWidth = CARD_WIDTH;
            }
        } else {
            itemWidth = width - 32;
        }

        const isDeleting = deletingStoryId === item.id;
        const relativeTime = getRelativeTime(item.created_at);

        return (
            <TouchableOpacity
                style={[
                    isMultiple ? styles.multipleStoryCard : styles.singleStoryCard,
                    {
                        height: itemHeight,
                        width: itemWidth,
                        marginBottom: isMultiple ? 12 : 0,
                        marginHorizontal: isMultiple ? CARD_MARGIN : 0,
                        opacity: isDeleting ? 0.5 : 1
                    }
                ]}
                activeOpacity={isMultiple ? 0.8 : 0.9}
                disabled={isDeleting}
                onPress={() => handleStoryPress(item)}
            >
                {item.media_type === 'video' ? (
                    <VideoPlayer
                        uri={item.signedUrl || ''}
                        location={item.location_name}
                        time={relativeTime}
                        viewCount={item.view_count}
                        isMultiple={isMultiple}
                        style={styles.mediaPlayer}
                        onEyeIconPress={() => {
                            console.log('👀 Eye pressed on video story:', item.id);
                            handleEyeIconPress(item.id);
                        }}
                        onVideoPress={() => {
                            console.log('📱 Video content pressed, expanding story');
                            if (isMultiple) {
                                handleStoryPress(item);
                            }
                        }}
                        disabled={isDeleting}
                    />
                ) : (
                    <>
                        <Image
                            source={{ uri: item.signedUrl }}
                            style={styles.storyImage}
                            resizeMode="cover"
                        />

                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.singleGradientOverlay}
                        />

                        <View style={styles.storyOverlay}>
                            <View style={styles.leftSection}>
                                <PanGestureHandler
                                    onGestureEvent={onGestureEvent}
                                    onHandlerStateChange={onHandlerStateChange}
                                    enabled={!isDeleting}
                                >
                                    <Animated.View>
                                        <TouchableOpacity
                                            style={styles.eyeContainer}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                console.log('👀 Eye pressed on photo story:', item.id);
                                                handleEyeIconPress(item.id);
                                            }}
                                            disabled={isDeleting}
                                        >
                                            <Text style={[
                                                styles.eyeIcon,
                                                stories.length === 2 && styles.twoStoryEyeIcon
                                            ]}>👀</Text>
                                            {item.view_count > 0 && (
                                                <Text style={[
                                                    styles.viewCountText,
                                                    stories.length === 2 && styles.twoStoryViewCountText
                                                ]}>
                                                    {item.view_count}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </Animated.View>
                                </PanGestureHandler>
                            </View>

                            <View style={styles.rightSection}>
                                <Text style={[
                                    styles.timeText,
                                    !isMultiple && styles.singleStoryTimeText,
                                    stories.length === 2 && styles.twoStoryTimeText
                                ]}>
                                    {relativeTime}
                                </Text>

                                {item.location_name && (
                                    <View style={styles.locationRow}>
                                        <Ionicons
                                            name="location"
                                            size={stories.length === 2 ? 10 : (isMultiple ? 8 : 16)}
                                            color="#fff"
                                        />
                                        <Text style={[
                                            styles.locationText,
                                            !isMultiple && styles.singleStoryLocationText,
                                            stories.length === 2 && styles.twoStoryLocationText
                                        ]} numberOfLines={1}>
                                            {item.location_name}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </>
                )}

                <TouchableOpacity
                    style={[
                        styles.optionsButton,
                        isDeleting && styles.disabledButton,
                        stories.length === 2 && styles.twoStoryOptionsButton
                    ]}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleOptionsPress(item.id);
                    }}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Entypo
                            name="dots-two-vertical"
                            size={stories.length === 2 ? 16 : (isMultiple ? 14 : 18)}
                            color="#fff"
                        />
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    // All your other render functions remain exactly the same...
    const renderExpandedStory = () => {
        if (!expandedStory) return null;

        const relativeTime = getRelativeTime(expandedStory.created_at);

        return (
            <Modal
                visible={showExpandedModal}
                transparent={true}
                animationType="none"
                onRequestClose={handleCloseExpandedStory}
                statusBarTranslucent={true}
            >
                <View style={styles.expandedOverlay}>
                    <TouchableOpacity
                        style={styles.expandedBackdrop}
                        onPress={handleCloseExpandedStory}
                        activeOpacity={1}
                    />

                    <Animated.View
                        style={[
                            styles.expandedStoryContainer,
                            {
                                opacity: expandedAnimation,
                                transform: [{
                                    scale: expandedAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1]
                                    })
                                }]
                            }
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.expandedCloseButton}
                            onPress={handleCloseExpandedStory}
                        >
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.expandedStoryContent}>
                            {expandedStory.media_type === 'video' ? (
                                <VideoPlayer
                                    uri={expandedStory.signedUrl || ''}
                                    location={expandedStory.location_name}
                                    time={relativeTime}
                                    viewCount={expandedStory.view_count}
                                    isMultiple={false}
                                    style={styles.expandedMediaPlayer}
                                    onEyeIconPress={() => handleEyeIconPress(expandedStory.id)}
                                    onVideoPress={() => { }}
                                    disabled={false}
                                />
                            ) : (
                                <>
                                    <Image
                                        source={{ uri: expandedStory.signedUrl }}
                                        style={styles.expandedStoryImage}
                                        resizeMode="cover"
                                    />

                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                        style={styles.expandedGradientOverlay}
                                    />

                                    <View style={styles.expandedStoryOverlay}>
                                        <View style={styles.expandedLeftSection}>
                                            <TouchableOpacity
                                                style={styles.expandedEyeContainer}
                                                onPress={() => handleEyeIconPress(expandedStory.id)}
                                            >
                                                <Text style={styles.expandedEyeIcon}>👀</Text>
                                                {expandedStory.view_count > 0 && (
                                                    <Text style={styles.expandedViewCountText}>
                                                        {expandedStory.view_count}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.expandedRightSection}>
                                            <Text style={styles.expandedTimeText}>
                                                {relativeTime}
                                            </Text>

                                            {expandedStory.location_name && (
                                                <View style={styles.expandedLocationRow}>
                                                    <Ionicons name="location" size={16} color="#fff" />
                                                    <Text style={styles.expandedLocationText} numberOfLines={2}>
                                                        {expandedStory.location_name}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        );
    };

    const renderViewerItem = ({ item }: { item: StoryViewer }) => {
        const user = item.users;
        const displayName = user?.full_name || user?.username || `User ${item.viewer_user_id?.substring(0, 8)}`;
        const avatarUrl = user?.avatar_url;

        return (
            <View style={styles.viewerItem}>
                <View style={styles.viewerAvatar}>
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={styles.viewerAvatarImage}
                        />
                    ) : (
                        <Ionicons name="person" size={20} color="#666" />
                    )}
                </View>
                <View style={styles.viewerInfo}>
                    <Text style={styles.viewerName}>
                        {displayName}
                    </Text>
                    {user?.username && user.username !== displayName && (
                        <Text style={styles.viewerUsername}>
                            @{user.username}
                        </Text>
                    )}
                    <Text style={styles.viewerTime}>
                        {getRelativeTime(item.viewed_at)}
                    </Text>
                </View>
            </View>
        );
    };

    const renderViewersSheet = () => (
        <Modal
            visible={showViewersSheet}
            transparent={true}
            animationType="none"
            onRequestClose={handleCloseViewersSheet}
            statusBarTranslucent={true}
        >
            <View style={styles.sheetOverlay}>
                <TouchableOpacity
                    style={styles.sheetBackdrop}
                    onPress={handleCloseViewersSheet}
                    activeOpacity={1}
                />

                <Animated.View
                    style={[
                        styles.viewersSheet,
                        {
                            transform: [{
                                translateY: sheetAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [SHEET_HEIGHT, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <View style={styles.sheetHeader}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>
                            {viewers.length === 0 ? 'Story Views' : `${viewers.length} View${viewers.length > 1 ? 's' : ''}`}
                        </Text>
                    </View>

                    <View style={styles.sheetContent}>
                        {loadingViewers ? (
                            <View style={styles.sheetLoadingContainer}>
                                <ActivityIndicator size="large" color="#4A90E2" />
                                <Text style={styles.sheetLoadingText}>Loading viewers...</Text>
                            </View>
                        ) : viewers.length === 0 ? (
                            <View style={styles.noViewersContainer}>
                                <Text style={styles.noViewersIcon}>👀</Text>
                                <Text style={styles.noViewersTitle}>0 people have seen it yet</Text>
                                <Text style={styles.noViewersSubtitle}>
                                    When people view your story, you'll see them here
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={viewers}
                                keyExtractor={(item) => item.id}
                                renderItem={renderViewerItem}
                                style={styles.viewersList}
                                contentContainerStyle={styles.viewersListContent}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="images-outline" size={64} color="#666" />
            </View>
            <Text style={styles.emptyTitle}>Create, Share & Curate Memories</Text>
            <Text style={styles.emptySubtitle}>
                Your stories will appear here in a beautiful layout
            </Text>
            <TouchableOpacity style={styles.createButton}>
                <Ionicons name="add-circle" size={20} color="#4A90E2" />
                <Text style={styles.createButtonText}>Create Your First Story</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                    <Text style={styles.loadingText}>Loading your stories...</Text>
                </View>
            </View>
        );
    }

    return (
        <>
            <View style={styles.container}>
                {stories.length === 1 ? (
                    <View style={styles.singleStoryContainer}>
                        {renderStoryItem({ item: stories[0], index: 0 })}
                    </View>
                ) : (
                    <FlatList
                        data={stories}
                        keyExtractor={(item) => item.id}
                        renderItem={renderStoryItem}
                        numColumns={stories.length === 2 ? 2 : 3}
                        key={stories.length === 2 ? 'two-col' : 'three-col'}
                        columnWrapperStyle={stories.length > 1 ? styles.leftAlignedRow : undefined}
                        style={styles.flatList}
                        contentContainerStyle={styles.flatListContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyState}
                        removeClippedSubviews={false}
                    />
                )}
            </View>
            {renderViewersSheet()}
            {renderExpandedStory()}
        </>
    );
};

export default MyStories;
