import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    Dimensions,
    ScrollView,
    PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserReportReason } from '../../../../../API/useReportUserProfiles';

interface ReportUserModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (reason: UserReportReason) => void;
    isLoading: boolean;
    username: string | null;
}

const ReportUserModal: React.FC<ReportUserModalProps> = ({
    isVisible,
    onClose,
    onSubmit,
    isLoading,
    username
}) => {
    const [selectedReason, setSelectedReason] = useState<UserReportReason | null>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const { height } = Dimensions.get('window');

    // For swipe down gesture
    const panY = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                // Only allow downward movement
                if (gestureState.dy > 0) {
                    panY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dy > 50) {
                    // If dragged down more than 50 units, close the modal
                    closeModal();
                } else {
                    // Otherwise snap back to the original position
                    Animated.spring(panY, {
                        toValue: 0,
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

    useEffect(() => {
        if (isVisible) {
            Animated.spring(slideAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 65,
                friction: 10,
            }).start();
            // Reset panY when modal opens
            panY.setValue(0);
        } else {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
            // Reset state when modal closes
            setTimeout(() => {
                setSelectedReason(null);
            }, 200);
        }
    }, [isVisible]);

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    const handleSubmit = () => {
        if (selectedReason) {
            onSubmit(selectedReason);
        }
    };

    const reasons: { value: UserReportReason; label: string }[] = [
        { value: 'i_dont_like_it', label: 'I just don\'t like it' },
        { value: 'bullying_or_unwanted_contact', label: 'Bullying or unwanted contact' },
        { value: 'suicide_self_injury_or_eating_disorders', label: 'Suicide, self-injury or eating disorders' },
        { value: 'violence_hate_or_exploitation', label: 'Violence, hate or exploitation' },
        { value: 'selling_or_promoting_restricted_items', label: 'Selling or promoting restricted items' },
        { value: 'nudity_or_sexual_activity', label: 'Nudity or sexual activity' },
        { value: 'scam_fraud_or_spam', label: 'Scam, fraud or spam' },
        { value: 'false_information', label: 'False information' },
        { value: 'intellectual_property', label: 'Intellectual property' },
    ];

    const renderOption = (reason: { value: UserReportReason; label: string }) => {
        const isSelected = selectedReason === reason.value;
        return (
            <TouchableOpacity
                key={reason.value}
                style={[styles.reasonButton, isSelected && styles.selectedReason]}
                onPress={() => setSelectedReason(reason.value)}
                activeOpacity={0.7}
            >
                <Text style={styles.reasonText}>{reason.label}</Text>
                {isSelected && (
                    <Ionicons name="checkmark" size={20} color="#fff" style={styles.checkmark} />
                )}
            </TouchableOpacity>
        );
    };

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
                                    {
                                        translateY: panY
                                    }
                                ],
                            },
                        ]}
                    >
                        {/* Draggable header area */}
                        <View
                            style={styles.dragHandle}
                            {...panResponder.panHandlers}
                        >
                            <View style={styles.headerBar} />
                        </View>

                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Report</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={closeModal}
                                hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
                            >
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContentContainer}
                        >
                            <Text style={styles.subtitle}>Why are you reporting this {username ? 'user' : 'account'}?</Text>

                            <Text style={styles.disclaimer}>
                                Your report is anonymous. If someone is in immediate danger, call the local emergency services – don't wait.
                            </Text>

                            <View style={styles.reasonsContainer}>
                                {reasons.map(renderOption)}
                            </View>

                            {/* Bottom indicator bar similar to what's shown in the screenshot */}
                            <View style={styles.bottomIndicator} />
                        </ScrollView>

                        {selectedReason && (
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={[styles.submitButton, isLoading && styles.disabledButton]}
                                    onPress={handleSubmit}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {isLoading ? 'Submitting...' : 'Submit'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 10,
    },
    dragHandle: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 10,
    },
    headerBar: {
        width: 40,
        height: 5,
        backgroundColor: '#444',
        borderRadius: 3,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 15,
        marginBottom: 15,
        position: 'relative',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    scrollContentContainer: {
        paddingBottom: 20, // Reduced padding at the bottom
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 15,
        textAlign: 'center',
    },
    disclaimer: {
        fontSize: 14,
        color: '#999',
        marginBottom: 25,
        textAlign: 'center',
        lineHeight: 20,
    },
    reasonsContainer: {
        marginBottom: 20, // Reduced margin at the bottom
    },
    reasonButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
    },
    selectedReason: {
        backgroundColor: '#222',
    },
    reasonText: {
        color: '#FFFFFF',
        fontSize: 16,
        flex: 1,
    },
    checkmark: {
        marginLeft: 10,
    },
    footer: {
        padding: 20,
        backgroundColor: '#111',
        borderTopWidth: 1,
        borderTopColor: '#222',
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
    },
    bottomIndicator: {
        // width: 135,
        // height: 5,
        // backgroundColor: '#444',
        // borderRadius: 3,
        // alignSelf: 'center',
        // marginTop: 10,
    }
});

export default ReportUserModal;