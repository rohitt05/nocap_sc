import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ResponseItemProps } from '../../types';
import { Entypo, FontAwesome, Feather } from '@expo/vector-icons';
import { fonts } from '../../../../utils/Fonts/fonts';
import { Image } from 'expo-image';
import { formatTimestamp, formatTime, useAudioPlayer } from './utils';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';
import { Link } from 'expo-router';

const AudioResponse: React.FC<ResponseItemProps> = ({ item }) => {
    const { audioState, togglePlayback } = useAudioPlayer(item.content);

    return (
        <View style={styles.responseItem}>
            <LinearGradient
                colors={['#000', '#000', '#090238', '#000', '#000']}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                style={styles.contentContainer}
                start={{ x: 0.1, y: 0.1 }}
                end={{ x: 0.9, y: 0.9 }}
            >
                {/* Header with user info and timestamp */}
                <View style={styles.header}>
                    <Link href={`/Screens/user/users?id=${item.user.id}`} asChild>
                        <TouchableOpacity>
                            <Image
                                source={{ uri: item.user.avatar || 'https://via.placeholder.com/40' }}
                                style={styles.profilePic}
                                contentFit="cover"
                            />
                        </TouchableOpacity>
                    </Link>
                    <View style={styles.headerInfo}>
                        <Link href={`/Screens/user/users?id=${item.user.id}`} asChild>
                            <TouchableOpacity>
                                <Text style={styles.username}>{item.user.username}</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                    <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                    <TouchableOpacity style={styles.menuDotsContainer}>
                        <Entypo name="dots-two-vertical" size={16} color="#fff" style={styles.menuDots} />
                    </TouchableOpacity>
                </View>

                {/* Message content area - expanded for extra height */}
                <View style={styles.messageContent}>
                    {/* Empty space for additional height */}
                </View>

                {/* Audio controls at bottom left corner */}
                <View style={styles.audioControls}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={togglePlayback}
                        disabled={!audioState.isLoaded}
                        hitSlop={5}
                    >
                        <FontAwesome
                            name={audioState.isPlaying ? "pause" : "play"}
                            size={20}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    <Text style={styles.audioDuration}>
                        {formatTime(audioState.duration)}
                    </Text>
                </View>

                {audioState.error && (
                    <Text style={styles.errorText}>{audioState.error}</Text>
                )}

                {/* Reaction and send buttons */}
                <View style={styles.reactionsContainer}>
                    {/* Send button without background */}
                    <TouchableOpacity style={styles.sendButton}>
                        <Feather name="send" size={18} color="#fff" />
                    </TouchableOpacity>

                    {/* Reaction buttons with light background and underline */}
                    <TouchableOpacity style={styles.reactionButton}>
                        <Entypo name="emoji-flirt" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reactionButton}>
                        <Entypo name="emoji-happy" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
};


export default AudioResponse;