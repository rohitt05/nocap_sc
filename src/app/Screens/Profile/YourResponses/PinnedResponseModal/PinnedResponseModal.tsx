import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';


// Import the extracted content components
import TextContent from './TextContent';
import AudioContent from './AudioContent';
import ImageContent from './ImageContent';
import VideoContent from './VideoContent';
import GifContent from './GifContent';
import ErrorContent from './ErrorContent';

// Custom TextContent wrapper for centered display
const CenteredTextContent = ({ textContent }: { textContent?: string }) => {
    return (
        <View style={styles.centeredTextContainer}>
            <TextContent textContent={textContent} />
        </View>
    );
};

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
        const ContentComponent = () => {
            switch (response.content_type) {
                case 'text':
                    return <CenteredTextContent textContent={response.text_content} />;
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
            <View style={styles.contentWrapper}>
                <ContentComponent />
            </View>
        );
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
                        <View style={styles.contentContainer}>
                            {renderContent()}
                        </View>

                        <View style={styles.promptContainer}>
                            <Text style={styles.promptText}>{response.prompt?.text || "No prompt available"}</Text>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.dateText}>Created: {formatDate(response.created_at)}</Text>
                        </View>
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
        top: height * 0.2 - 100, // Adjusted based on new modal height
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
        backgroundColor: '#000', // Changed to plain black background
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        height: height * 0.85,
        overflow: 'hidden',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        padding: 0,
        borderRadius: 0,
        overflow: 'hidden',
    },
    contentWrapper: {
        flex: 1,
        width: '100%',
        borderRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
    },
    centeredTextContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 30,
        paddingHorizontal: 5,
        backgroundColor: '#000',
    },
    promptContainer: {
        backgroundColor: '#000', // Changed to plain black background
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 0.3,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    promptText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    footer: {
        padding: 0,
        backgroundColor: '#000', // Changed to plain black background
        minHeight: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    dateText: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
    },
});

export default PinnedResponseModal;