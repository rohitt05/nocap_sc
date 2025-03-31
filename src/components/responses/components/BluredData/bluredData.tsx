import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

const windowWidth = Dimensions.get('window').width;

const BlurredFeed = () => {
    const [revealedItems, setRevealedItems] = useState({});
    const [loadingResponses, setLoadingResponses] = useState(true);
    const [responses, setResponses] = useState([]);

    useEffect(() => {
        // Simulate loading data from API
        setTimeout(() => {
            const mockResponses = [
                {
                    id: '1',
                    user: { username: 'alex_captures', avatar_url: 'https://picsum.photos/40' },
                    prompt: { text: 'Show your workspace right now' },
                    content_type: 'image',
                    file_url: 'https://picsum.photos/400/300',
                    created_at: '2025-03-29T14:30:00Z',
                    reaction_count: 24
                },
                {
                    id: '2',
                    user: { username: 'taylor_moments', avatar_url: 'https://picsum.photos/40' },
                    prompt: { text: 'What are you cooking today?' },
                    content_type: 'video',
                    file_url: 'https://picsum.photos/400/300',
                    created_at: '2025-03-30T10:15:00Z',
                    reaction_count: 42
                },
                {
                    id: '3',
                    user: { username: 'sam_thoughts', avatar_url: 'https://picsum.photos/40' },
                    prompt: { text: 'Share a thought about today' },
                    content_type: 'text',
                    text_content: "Just finished a challenging project that's been consuming my time for weeks. The satisfaction of completing something difficult is unmatched. Taking the rest of the day to celebrate small victories!",
                    created_at: '2025-03-30T09:45:00Z',
                    reaction_count: 18
                },
                {
                    id: '4',
                    user: { username: 'melody_maker', avatar_url: 'https://picsum.photos/40' },
                    prompt: { text: 'What sounds surround you?' },
                    content_type: 'audio',
                    file_url: 'https://picsum.photos/400/100',
                    created_at: '2025-03-29T19:20:00Z',
                    reaction_count: 15
                },
                {
                    id: '5',
                    user: { username: 'nature_lover', avatar_url: 'https://picsum.photos/40' },
                    prompt: { text: 'Share your view right now' },
                    content_type: 'image',
                    file_url: 'https://picsum.photos/400/300',
                    created_at: '2025-03-30T08:10:00Z',
                    reaction_count: 36
                }
            ];

            setResponses(mockResponses);
            setLoadingResponses(false);
        }, 1000);
    }, []);

    const toggleReveal = (id) => {
        setRevealedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    const renderContent = (item, isRevealed) => {
        switch (item.content_type) {
            case 'image':
                return (
                    <View style={styles.mediaContainer}>
                        <Image
                            source={{ uri: item.file_url }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>
                );
            case 'video':
                return (
                    <View style={styles.mediaContainer}>
                        <Image
                            source={{ uri: item.file_url }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <View style={styles.videoPlayIconContainer}>
                            <Feather name="play" size={32} color="white" />
                        </View>
                    </View>
                );
            case 'text':
                return (
                    <View style={styles.textContentContainer}>
                        <Text style={styles.textContent}>{item.text_content}</Text>
                    </View>
                );
            case 'audio':
                return (
                    <View style={styles.audioContainer}>
                        <Feather name="volume-2" size={22} color="#3b82f6" style={styles.audioIcon} />
                        <View style={styles.waveformContainer}>
                            <View style={styles.waveform}>
                                <View style={styles.waveformIndicator} />
                            </View>
                        </View>
                    </View>
                );
            default:
                return <Text style={styles.errorText}>Unsupported content type</Text>;
        }
    };

    const renderItem = ({ item }) => {
        const isRevealed = revealedItems[item.id];

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => toggleReveal(item.id)}
                    style={styles.cardContent}
                >
                    {/* User info and prompt */}
                    <View style={styles.cardHeader}>
                        <View style={styles.userInfo}>
                            <Image
                                source={{ uri: item.user.avatar_url }}
                                style={styles.avatar}
                            />
                            <View>
                                <Text style={styles.username}>{item.user.username}</Text>
                                <Text style={styles.timeAgo}>{formatTimeAgo(item.created_at)}</Text>
                            </View>
                        </View>
                        <Text style={styles.promptText}>"{item.prompt.text}"</Text>
                    </View>

                    {/* Content with conditional blur */}
                    <View style={styles.contentContainer}>
                        {renderContent(item, isRevealed)}

                        {!isRevealed && (
                            <BlurView intensity={80} tint="dark" style={styles.blurOverlay}>
                                <TouchableOpacity
                                    style={styles.revealButton}
                                    onPress={() => toggleReveal(item.id)}
                                >
                                    <Text style={styles.revealButtonText}>Tap to reveal</Text>
                                </TouchableOpacity>
                            </BlurView>
                        )}
                    </View>

                    {/* Interaction buttons */}
                    <View style={styles.interactionContainer}>
                        <View style={styles.interactionButtonGroup}>
                            <TouchableOpacity style={styles.interactionButton}>
                                <Feather name="heart" size={20} color="#FFF" />
                                <Text style={styles.interactionCount}>{item.reaction_count}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.interactionButton}>
                                <Feather name="message-square" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.interactionButtonGroup}>
                            <TouchableOpacity style={styles.interactionButton}>
                                <Feather name="bookmark" size={20} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.interactionButton}>
                                <Feather name="user" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (loadingResponses) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <Text style={styles.headerTitle}>Moment Feed</Text>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFF" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Text style={styles.headerTitle}>Moment Feed</Text>

            <FlatList
                data={responses}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.feedContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    feedContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    username: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    timeAgo: {
        fontSize: 12,
        color: '#999',
    },
    promptText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#BBB',
        marginTop: 4,
    },
    contentContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    mediaContainer: {
        width: '100%',
        height: 280,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    videoPlayIconContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    textContentContainer: {
        padding: 16,
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
    },
    textContent: {
        fontSize: 16,
        color: '#FFF',
        lineHeight: 22,
    },
    audioContainer: {
        padding: 16,
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    audioIcon: {
        marginRight: 12,
    },
    waveformContainer: {
        flex: 1,
        height: 50,
        backgroundColor: '#333',
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    waveform: {
        height: 4,
        backgroundColor: '#3b82f6',
        borderRadius: 2,
        position: 'relative',
    },
    waveformIndicator: {
        position: 'absolute',
        left: '33%',
        top: -4,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFF',
    },
    blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    revealButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
    },
    revealButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    interactionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    interactionButtonGroup: {
        flexDirection: 'row',
        gap: 16,
    },
    interactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    interactionCount: {
        fontSize: 14,
        color: '#FFF',
        marginLeft: 4,
    },
    errorText: {
        padding: 16,
        color: '#FF5252',
        textAlign: 'center',
    },
});

export default BlurredFeed;