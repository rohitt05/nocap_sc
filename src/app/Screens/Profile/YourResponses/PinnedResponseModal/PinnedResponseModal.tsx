import React from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';

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
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#000',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        height: height * 0.95,
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
        paddingTop: 40,
        paddingHorizontal: 8,
        backgroundColor: '#000',
    },
    promptContainer: {
        backgroundColor: '#000',
        minHeight: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 0.3,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 6,
    },
    promptText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 12,
        lineHeight: 18,
    },
    footer: {
        padding: 0,
        backgroundColor: '#000',
        minHeight: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
    },
});

export default PinnedResponseModal;
