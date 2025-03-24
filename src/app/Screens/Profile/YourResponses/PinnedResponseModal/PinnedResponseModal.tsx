import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Import the extracted content components
import TextContent from './TextContent';
import AudioContent from './AudioContent';
import ImageContent from './ImageContent';
import VideoContent from './VideoContent';
import GifContent from './GifContent';
import ErrorContent from './ErrorContent';

// Define interfaces for data
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

interface PinnedResponseModalProps {
    isVisible: boolean;
    onClose: () => void;
    response: ResponseData | null;
    playAudio?: (url: string, id: string) => void;
    isPlaying?: boolean;
    playingId?: string | null;
}

const PinnedResponseModal = ({
    isVisible,
    onClose,
    response,
    playAudio,
    isPlaying,
    playingId
}: PinnedResponseModalProps) => {
    if (!response) return null;

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Render content based on type using the extracted components
    const renderContent = () => {
        switch (response.content_type) {
            case 'text':
                return <TextContent textContent={response.text_content} />;
            case 'audio':
                return (
                    <AudioContent
                        fileUrl={response.file_url}
                        responseId={response.id}
                        playAudio={playAudio}
                        isPlaying={isPlaying}
                        playingId={playingId}
                    />
                );
            case 'image':
                return <ImageContent fileUrl={response.file_url} />;
            case 'video':
                return <VideoContent fileUrl={response.file_url} />;
            case 'gif':
                return <GifContent fileUrl={response.file_url} />;
            default:
                return <ErrorContent />;
        }
    };

    return (
        <View style={styles.container}>
            <Modal
                visible={isVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    {/* Floating close button positioned in the overlay, centered horizontally */}
                    <View style={styles.floatingCloseButtonContainer}>
                        <TouchableOpacity style={styles.floatingCloseButton} onPress={onClose}>
                            <Feather name="x" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContainer}>
                        <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
                            <View style={styles.header}>
                                <Text style={styles.promptText}>{response.prompt?.text || "No prompt available"}</Text>
                            </View>
                        </BlurView>

                        <View style={styles.contentContainer}>
                            {renderContent()}
                        </View>

                        <BlurView intensity={20} tint="dark" style={styles.footerBlur}>
                            <View style={styles.footer}>
                                <Text style={styles.dateText}>cc: {formatDate(response.created_at)}</Text>
                            </View>
                        </BlurView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
    },
    floatingCloseButtonContainer: {
        position: 'absolute',
        top: height * 0.3 - 50,
        width: '100%',
        alignItems: 'center',
        zIndex: 1000,
    },
    floatingCloseButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 30,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#000',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: height * 0.7,
        overflow: 'hidden', // Ensures the blur doesn't extend beyond the modal
    },
    headerBlur: {
        width: '100%',
    },
    header: {
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    promptText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
    },
    footerBlur: {
        width: '100%',
    },
    footer: {
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dateText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
});

export default PinnedResponseModal;