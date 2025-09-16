// YourResponses.tsx - KEEP EXISTING LAYOUT + ADD REFRESH SUPPORT
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { supabase } from '../../../../../lib/supabase';
import { styles } from './styles'
import PinnedResponseModal from './PinnedResponseModal';

import TextResponse from './TextResponse';
import AudioResponse from './AudioResponse';
import ImageResponse from './ImageResponse';
import VideoResponse from './VideoResponse';
import GifResponse from './GifResponse';
import { Link } from 'expo-router';

const { height: screenHeight } = Dimensions.get('window');

interface PinnedResponse {
    id: string;
    user_id: string;
    response_id: string;
    created_at: string;
    response: ResponseData;
}

interface ResponseData {
    id: string;
    prompt_id: string;
    content_type: 'text' | 'image' | 'video' | 'audio' | 'gif';
    file_url?: string;
    text_content?: string;
    created_at: string;
    prompt?: {
        id: string;
        text: string;
    };
}

// ✅ ONLY CHANGE: Add refreshTrigger prop
interface YourResponsesProps {
    userId?: string;
    refreshTrigger?: number; // NEW: Refresh trigger from parent
}

// ✅ ONLY CHANGE: Accept refreshTrigger prop
const YourResponses = ({ userId, refreshTrigger }: YourResponsesProps) => {
    const [sound, setSound] = useState<Audio.Sound>();
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [pinnedResponses, setPinnedResponses] = useState<PinnedResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isViewingOwnProfile, setIsViewingOwnProfile] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState<ResponseData | null>(null);

    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                const viewingOwnProfile = !userId || userId === user.id;
                setIsViewingOwnProfile(viewingOwnProfile);
                if (!viewingOwnProfile) {
                    checkFriendship(user.id, userId);
                }
            }
        };
        getCurrentUser();
    }, [userId]);

    useEffect(() => {
        if (currentUserId) {
            fetchPinnedResponses();
        }
    }, [currentUserId, isFriend, userId]);

    // ✅ NEW: Listen for refresh trigger from parent
    useEffect(() => {
        if (refreshTrigger && refreshTrigger > 0) {
            console.log('🔄 YourResponses: Refreshing due to pull-to-refresh...');
            fetchPinnedResponses();
        }
    }, [refreshTrigger]);

    // FIXED: Corrected friendship checking logic with proper Supabase syntax
    const checkFriendship = async (currentUserId: string, profileUserId?: string) => {
        if (!profileUserId) {
            setIsFriend(false);
            return;
        }
        try {
            const { data: friendshipData, error: friendshipError } = await supabase
                .from('friendships')
                .select('*')
                .eq('status', 'accepted')
                .or(`and(user_id.eq.${currentUserId},friend_id.eq.${profileUserId}),and(user_id.eq.${profileUserId},friend_id.eq.${currentUserId})`)
                .single();
            if (friendshipError && friendshipError.code !== 'PGRST116') {
                console.error('Error checking friendship:', friendshipError);
                const { data: friendshipDataAlt } = await supabase
                    .from('friendships')
                    .select('*')
                    .eq('status', 'accepted')
                    .or(`user_id.eq.${currentUserId},user_id.eq.${profileUserId}`)
                    .or(`friend_id.eq.${currentUserId},friend_id.eq.${profileUserId}`);

                const isConnected = friendshipDataAlt?.some(friendship =>
                    (friendship.user_id === currentUserId && friendship.friend_id === profileUserId) ||
                    (friendship.user_id === profileUserId && friendship.friend_id === currentUserId)
                );
                setIsFriend(!!isConnected);
                return;
            }
            setIsFriend(!!friendshipData);
        } catch (err) {
            console.error('Error in friendship check:', err);
            setIsFriend(false);
        }
    };

    const fetchPinnedResponses = async () => {
        try {
            setLoading(true);
            const targetUserId = userId || currentUserId;

            const { data, error } = await supabase
                .from('pinned_responses')
                .select(`
                    id,
                    user_id,
                    response_id,
                    created_at,
                    response:responses(
                        id,
                        prompt_id,
                        content_type,
                        file_url,
                        text_content,
                        created_at,
                        prompt:prompts(id, text)
                    )
                `)
                .eq('user_id', targetUserId)
                .order('created_at', { ascending: false });
            if (error) {
                throw error;
            }
            setPinnedResponses(data || []);
        } catch (err) {
            console.error('Error fetching pinned responses:', err);
            setPinnedResponses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const playAudio = async (audioUrl: string, id: string) => {
        try {
            if (sound) {
                await sound.unloadAsync();
            }
            if (playingId === id) {
                setIsPlaying(false);
                setPlayingId(null);
                return;
            }
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );
            setSound(newSound);
            setIsPlaying(true);
            setPlayingId(id);
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    setPlayingId(null);
                }
            });
        } catch (error) {
            console.log('Error playing audio:', error);
            setIsPlaying(false);
            setPlayingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleOpenModal = (response: ResponseData) => {
        setSelectedResponse(response);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const renderResponsePreview = (item: PinnedResponse) => {
        const response = item.response;
        if (!response) return null;
        const itemStyle = response.content_type === 'text'
            ? [styles.pinItem, styles.textPinItem]
            : styles.pinItem;
        return (
            <View key={item.id} style={styles.responseContainer}>
                <TouchableOpacity
                    style={itemStyle}
                    onPress={() => handleOpenModal(response)}
                >
                    {renderResponseContent(response)}
                </TouchableOpacity>
                <View style={styles.dateContainer}>
                    <Text style={styles.promptHint} numberOfLines={1}>
                        {response.prompt?.text?.substring(0, 15) || "Prompt"}...
                    </Text>
                    <Text style={styles.dateText}>{formatDate(response.created_at)}</Text>
                </View>
            </View>
        );
    };

    const renderResponseContent = (response: ResponseData) => {
        switch (response.content_type) {
            case 'text':
                return <TextResponse response={response.text_content || ""} />;
            case 'audio':
                return (
                    <AudioResponse
                        response={response.file_url || ""}
                        isPlaying={isPlaying}
                        onPlayPress={playAudio}
                        id={response.id}
                        playingId={playingId}
                    />
                );
            case 'video':
                return <VideoResponse response={response.file_url || ""} />;
            case 'image':
                return <ImageResponse response={response.file_url || ""} />;
            case 'gif':
                return <GifResponse response={response.file_url || ""} />;
            default:
                return <View style={styles.mediaPreviewContainer} />;
        }
    };

    const renderEmptyState = () => {
        if (isViewingOwnProfile) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No pinned responses yet</Text>
                </View>
            );
        } else if (!isFriend) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Only friends can see pinned responses</Text>
                </View>
            );
        } else {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>This user has no pinned responses</Text>
                </View>
            );
        }
    };

    const shouldRenderComponent = () => {
        if (loading) return true;
        if (isViewingOwnProfile) return true;
        if (isFriend) return true;
        return false;
    };

    if (!shouldRenderComponent()) return null;

    // Split logic: half-half when more than 5 responses
    const totalPins = pinnedResponses.length;
    let topRowPins: PinnedResponse[];
    let bottomRowPins: PinnedResponse[];

    if (totalPins <= 5) {
        topRowPins = pinnedResponses;
        bottomRowPins = [];
    } else {
        const half = Math.ceil(totalPins / 2);
        topRowPins = pinnedResponses.slice(0, half);
        bottomRowPins = pinnedResponses.slice(half);
    }

    const showSecondRow = bottomRowPins.length > 0;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Pinned Responses</Text>
                {isViewingOwnProfile && (
                    <View style={styles.visibilityContainer}>
                        <Ionicons name="people-sharp" size={16} color="#888" />
                        <Text style={styles.visibilityText}>Visible to your friends</Text>
                    </View>
                )}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#888" size="large" />
                </View>
            ) : (
                <>
                    {pinnedResponses.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        <>
                            {/* ✅ KEEP EXISTING: Simple horizontal scrolling - no changes */}
                            {/* Top Row - Scrolls Left to Right */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContent}
                                style={styles.rowScrollView}
                                scrollEventThrottle={16}
                            >
                                {/* Add New Pin button as first item in top row if viewing own profile */}
                                {isViewingOwnProfile && (
                                    <Link href="/archives" asChild>
                                        <TouchableOpacity style={styles.addNewPin}>
                                            <AntDesign name="plus" size={32} color="#888" />
                                            <Text style={styles.addPinText}>Tap to pin more of your responses</Text>
                                        </TouchableOpacity>
                                    </Link>
                                )}

                                {topRowPins.map((item) => renderResponsePreview(item))}
                            </ScrollView>

                            {/* Bottom Row - Only render if there are more than 5 pinned responses */}
                            {showSecondRow && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    inverted
                                    contentContainerStyle={[styles.scrollContent, { transform: [{ scaleX: -1 }] }]}
                                    style={styles.rowScrollView}
                                    scrollEventThrottle={16}
                                >
                                    {bottomRowPins.slice().reverse().map((item) => (
                                        <View key={item.id} style={{ transform: [{ scaleX: -1 }] }}>
                                            {renderResponsePreview(item)}
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </>
                    )}
                </>
            )}

            <PinnedResponseModal
                isVisible={modalVisible}
                onClose={handleCloseModal}
                response={selectedResponse}
                playAudio={playAudio}
                isPlaying={isPlaying}
                playingId={playingId}
            />
        </View>
    );
};

export default YourResponses;
