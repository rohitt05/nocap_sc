import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { supabase } from '../../../../../lib/supabase';
import { styles } from './styles'
import PinnedResponseModal from './PinnedResponseModal'; // Import the modal component

// Import extracted components
import TextResponse from './TextResponse';
import AudioResponse from './AudioResponse';
import ImageResponse from './ImageResponse';
import VideoResponse from './VideoResponse';
import GifResponse from './GifResponse';
import { Link } from 'expo-router';

// Define interfaces for pinned response data
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

// Add proper type for props
interface YourResponsesProps {
    userId?: string; // Optional - if not provided, show current user's pins
}

const YourResponses = ({ userId }: YourResponsesProps) => {
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingId, setPlayingId] = useState(null);
    const [pinnedResponses, setPinnedResponses] = useState<PinnedResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isViewingOwnProfile, setIsViewingOwnProfile] = useState(true);
    const [isFriend, setIsFriend] = useState(false);

    // Add state for modal control
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState<ResponseData | null>(null);

    // Fetch pinned responses on component mount and when userId changes
    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                // If userId is not provided or matches current user, we're viewing own profile
                const viewingOwnProfile = !userId || userId === user.id;
                setIsViewingOwnProfile(viewingOwnProfile);

                // If viewing another user's profile, check if they're friends
                if (!viewingOwnProfile) {
                    checkFriendship(user.id, userId);
                }
            }
        };

        getCurrentUser();
    }, [userId]);

    // Fetch pinned responses when currentUserId and friendship status are determined
    useEffect(() => {
        if (currentUserId) {
            fetchPinnedResponses();
        }
    }, [currentUserId, isFriend, userId]);

    // Check if current user and profile user are friends
    const checkFriendship = async (currentUserId, profileUserId) => {
        try {
            // Check if there's an accepted friendship
            const { data: friendshipData, error: friendshipError } = await supabase
                .from('friendships')
                .select('*')
                .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
                .or(`user_id.eq.${profileUserId},friend_id.eq.${profileUserId}`)
                .eq('status', 'accepted')
                .single();

            if (friendshipError && friendshipError.code !== 'PGRST116') {
                console.error('Error checking friendship:', friendshipError);
            }

            // If there's valid friendship data, they are friends
            setIsFriend(!!friendshipData);
        } catch (err) {
            console.error('Error in friendship check:', err);
            setIsFriend(false);
        }
    };

    // Fetch user's pinned responses from database
    const fetchPinnedResponses = async () => {
        try {
            setLoading(true);

            // Determine which user's pins to fetch
            const targetUserId = userId || currentUserId;

            // If viewing another user's profile and not friends, don't fetch pins
            if (!isViewingOwnProfile && !isFriend) {
                setPinnedResponses([]);
                setLoading(false);
                return;
            }

            // Fetch pinned responses with joined response and prompt data
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
        } finally {
            setLoading(false);
        }
    };

    // Cleanup sound on component unmount
    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    // Function to handle audio playback
    const playAudio = async (audioUrl, id) => {
        try {
            // Release any existing sound object
            if (sound) {
                await sound.unloadAsync();
            }

            // If the same audio is clicked again, just stop playback
            if (playingId === id) {
                setIsPlaying(false);
                setPlayingId(null);
                return;
            }

            console.log('Playing audio from URL:', audioUrl);
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );

            setSound(newSound);
            setIsPlaying(true);
            setPlayingId(id);

            // Listen for playback status
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

    // Function to format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Handle opening the modal with the selected response
    const handleOpenModal = (response: ResponseData) => {
        setSelectedResponse(response);
        setModalVisible(true);
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setModalVisible(false);
    };

    // Function to render the appropriate content preview based on type
    const renderResponsePreview = (item: PinnedResponse) => {
        const response = item.response;
        if (!response) return null;

        // Use a different style for text responses
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
                {/* Date container is now outside the pin item */}
                <View style={styles.dateContainer}>
                    <Text style={styles.promptHint} numberOfLines={1}>
                        {response.prompt?.text?.substring(0, 15) || "Prompt"}...
                    </Text>
                    <Text style={styles.dateText}>{formatDate(response.created_at)}</Text>
                </View>
            </View>
        );
    };

    // Function to render the content based on type
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

    // Render appropriate empty state based on context
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

    // This will determine if we should render the component at all
    const shouldRenderComponent = () => {
        // Always render if still loading
        if (loading) return true;

        // Always render if viewing own profile (to allow adding pins)
        if (isViewingOwnProfile) return true;

        // If not viewing own profile, only render if there are pins and is a friend
        return pinnedResponses.length > 0 && isFriend;
    };

    // If we shouldn't render the component, return null
    if (!shouldRenderComponent()) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Pinned Responses</Text>
                {/* Only show visibility indicator to the account owner */}
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
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Show add pin button first if viewing own profile */}
                    {isViewingOwnProfile && (
                        <Link href="/archives" asChild>
                            <TouchableOpacity style={styles.addNewPin}>
                                <AntDesign name="plus" size={32} color="#888" />
                                <Text style={styles.addPinText}>Tap to pin more of your responses</Text>
                            </TouchableOpacity>
                        </Link>
                    )}

                    {pinnedResponses.length > 0 ? (
                        pinnedResponses.map((item) => renderResponsePreview(item))
                    ) : (
                        renderEmptyState()
                    )}
                </ScrollView>
            )}

            {/* Add the PinnedResponseModal component */}
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