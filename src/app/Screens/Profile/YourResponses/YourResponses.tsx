import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import pinnedResponses from '../PinnedResponses';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

// Import extracted components
import TextResponse from './TextResponse';
import AudioResponse from './AudioResponse';
import ImageResponse from './ImageResponse';
import VideoResponse from './VideoResponse';
import GifResponse from './GifResponse';

const YourResponses = () => {
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingId, setPlayingId] = useState(null);

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

    // Function to render the appropriate content preview based on type
    const renderResponsePreview = (item) => {
        // Use a different style for text responses
        const itemStyle = item.type === 'text'
            ? [styles.pinItem, styles.textPinItem]
            : styles.pinItem;

        return (
            <View key={item.id} style={styles.responseContainer}>
                <TouchableOpacity style={itemStyle}>
                    {renderResponseContent(item)}
                </TouchableOpacity>
                {/* Date container is now outside the pin item */}
                <View style={styles.dateContainer}>
                    <Text style={styles.promptHint} numberOfLines={1}>
                        {item.prompt?.substring(0, 15)}...
                    </Text>
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
            </View>
        );
    };

    // Function to render the content based on type
    const renderResponseContent = (item) => {
        switch (item.type) {
            case 'text':
                return <TextResponse response={item.response} />;
            case 'audio':
                return (
                    <AudioResponse
                        response={item.response}
                        isPlaying={isPlaying}
                        onPlayPress={playAudio}
                        id={item.id}
                        playingId={playingId}
                    />
                );
            case 'video':
                return <VideoResponse response={item.response} />;
            case 'image':
                return <ImageResponse response={item.response} />;
            case 'gif':
                return <GifResponse response={item.response} />;
            default:
                return <View style={styles.mediaPreviewContainer} />;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Your Responses 📌</Text>
                <View style={styles.visibilityContainer}>
                    <Ionicons name="people-sharp" size={16} color="#888" />
                    <Text style={styles.visibilityText}>Visible to your friends</Text>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {pinnedResponses.map((item) => renderResponsePreview(item))}

                <TouchableOpacity style={styles.addNewPin}>
                    <Feather name="plus" size={40} color="#888" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        paddingHorizontal: 5,
        paddingVertical: 25,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    headerText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    visibilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    visibilityText: {
        color: '#888',
        fontSize: 14,
        marginLeft: 8,
    },
    scrollContent: {
        paddingRight: 15,
        paddingLeft: 10,
    },
    responseContainer: {
        marginRight: 15,
    },
    pinItem: {
        width: 150,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#1E1E1E',
    },
    // Special style for text items to make them wider
    textPinItem: {
        width: 380, // Wider to accommodate more text
        height: 180, // Matching the height in TextResponse
    },
    mediaPreviewContainer: {
        aspectRatio: 1,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    dateContainer: {
        padding: 10,
        width: '100%',
    },
    promptHint: {
        color: '#AAA',
        fontSize: 10,
        marginBottom: 4,
    },
    dateText: {
        color: 'white',
        fontSize: 12,
    },
    addNewPin: {
        width: 150,
        height: 180,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#888',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default YourResponses;