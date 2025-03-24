import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import { MaterialIcons, Feather, Ionicons, Entypo } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

// Export the ref type for consumers
export type OptionsModalRef = {
    open: () => void;
    close: () => void;
};

type ResponseOptionsModalProps = {
    responseId: string;
    userId: string;
    onHide: (responseId: string) => void;
    onRemoveFriend: (userId: string) => void;
    onBlock: (userId: string) => void;
};

const ResponseOptionsModal = forwardRef<OptionsModalRef, ResponseOptionsModalProps>(
    ({ responseId, userId, onHide, onRemoveFriend, onBlock }, ref) => {
        const [visible, setVisible] = useState(false);
        const slideAnim = useRef(new Animated.Value(height)).current;
        const insets = useSafeAreaInsets();

        // Expose methods to parent component
        useImperativeHandle(ref, () => ({
            open: () => {
                setVisible(true);
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            },
            close: () => {
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setVisible(false);
                });
            },
        }));

        const handleClose = () => {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setVisible(false);
            });
        };

        return (
            <Modal
                visible={visible}
                transparent={true}
                animationType="none"
                onRequestClose={handleClose}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.container,
                                    { transform: [{ translateY: slideAnim }] },
                                    { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }
                                ]}
                            >
                                <View style={styles.handle} />

                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onHide(responseId);
                                        handleClose();
                                    }}
                                >
                                    <Feather name="eye-off" size={24} color="#fff" />
                                    <Text style={styles.optionText}>Hide this response</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onRemoveFriend(userId);
                                        handleClose();
                                    }}
                                >
                                    <MaterialIcons name="person-remove" size={24} color="#fff" />
                                    <Text style={styles.optionText}>Remove friend</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.option, styles.lastOption]}
                                    onPress={() => {
                                        onBlock(userId);
                                        handleClose();
                                    }}
                                >
                                    <Entypo name="block" size={24} color="#ff4d4d" />
                                    <Text style={[styles.optionText, styles.dangerText]}>Block user</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#000',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 12,
        paddingHorizontal: 20,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#555',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    lastOption: {
        borderBottomWidth: 0,
    },
    optionText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 16,
        fontWeight: '500',
    },
    dangerText: {
        color: '#ff4d4d',
    },
});

export default ResponseOptionsModal;