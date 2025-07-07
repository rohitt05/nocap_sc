import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CommentInputProps {
    responseId: string;
    currentUserId: string;
    onCommentAdded: () => void; // Callback to refresh the reactions list
}

const CommentInput: React.FC<CommentInputProps> = ({
    responseId,
    currentUserId,
    onCommentAdded,
}) => {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitComment = async () => {
        if (!comment.trim()) {
            return;
        }

        if (!currentUserId) {
            Alert.alert('Error', 'You must be logged in to comment');
            return;
        }

        setIsSubmitting(true);

        try {
            // Import the service function dynamically to avoid circular imports
            const { uploadTextReaction } = await import('./humanReactionService');

            const result = await uploadTextReaction(
                comment.trim(),
                currentUserId,
                responseId
            );

            if (result.success) {
                setComment('');
                onCommentAdded(); // Refresh the reactions list
            } else {
                Alert.alert('Error', result.error || 'Failed to submit comment');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            Alert.alert('Error', 'Something went wrong while submitting your comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={comment}
                    onChangeText={setComment}
                    placeholder="whatt? you got something to say?"
                    placeholderTextColor="#8E8E93"
                    multiline
                    maxLength={500}
                    editable={!isSubmitting}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!comment.trim() || isSubmitting) && styles.sendButtonDisabled
                    ]}
                    onPress={handleSubmitComment}
                    disabled={!comment.trim() || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Ionicons
                            name="send"
                            size={18}
                            color={comment.trim() ? "#FFFFFF" : "#8E8E93"}
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1C1C1E',
        borderTopWidth: 0.5,
        borderTopColor: '#3A3A3C',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 34, // Extra padding for safe area on newer iPhones
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#2C2C2E',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 40,
    },
    textInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        maxHeight: 100,
        paddingVertical: 8,
        paddingRight: 12,
        letterSpacing: -0.08,
    },
    sendButton: {
        backgroundColor: '#000',
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: '#2C2C2E',
    },
});

export default CommentInput;