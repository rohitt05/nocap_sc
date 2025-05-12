import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportReason } from '../../../API/useReportResponse';

interface ReportModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (reason: ReportReason, details: string) => void;
    isLoading: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({
    isVisible,
    onClose,
    onSubmit,
    isLoading
}) => {
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [details, setDetails] = useState('');
    const slideAnim = useRef(new Animated.Value(0)).current;
    const { height } = Dimensions.get('window');

    React.useEffect(() => {
        if (isVisible) {
            Animated.spring(slideAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 65,
                friction: 10,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
            // Reset state when modal closes
            setTimeout(() => {
                setSelectedReason(null);
                setDetails('');
            }, 200);
        }
    }, [isVisible]);

    const handleReasonSelect = (reason: ReportReason) => {
        setSelectedReason(reason);
    };

    const handleSubmit = () => {
        if (selectedReason) {
            onSubmit(selectedReason, details);
        }
    };

    const reasons: { value: ReportReason; label: string }[] = [
        { value: 'inappropriate', label: 'Inappropriate Content' },
        { value: 'spam', label: 'Spam' },
        { value: 'offensive', label: 'Offensive' },
        { value: 'misleading', label: 'Misleading' },
        { value: 'other', label: 'Other' },
    ];

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            {
                                transform: [
                                    {
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [height, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>Report thier response</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.subtitle}>Why are you reporting this post?</Text>

                        <View style={styles.reasonsContainer}>
                            {reasons.map((reason) => (
                                <TouchableOpacity
                                    key={reason.value}
                                    style={[
                                        styles.reasonButton,
                                        selectedReason === reason.value && styles.selectedReason,
                                    ]}
                                    onPress={() => handleReasonSelect(reason.value)}
                                >
                                    <Text style={[
                                        styles.reasonText,
                                        selectedReason === reason.value && styles.selectedReasonText,
                                    ]}>
                                        {reason.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Additional details (optional)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Please provide more information..."
                            placeholderTextColor="#666"
                            value={details}
                            onChangeText={setDetails}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!selectedReason || isLoading) && styles.disabledButton
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedReason || isLoading}
                        >
                            <Text style={styles.submitButtonText}>
                                {isLoading ? 'Submitting...' : 'Submit Report'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 15,
    },
    reasonsContainer: {
        marginBottom: 20,
    },
    reasonButton: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#222',
    },
    selectedReason: {
        backgroundColor: '#333',
        borderColor: '#0066CC',
        borderWidth: 1,
    },
    reasonText: {
        color: '#FFFFFF',
        fontSize: 15,
    },
    selectedReasonText: {
        fontWeight: '600',
    },
    inputLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#222',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 15,
        height: 100,
        borderWidth: 1,
        borderColor: '#444',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#ff4040',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#661A1A',
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default ReportModal;