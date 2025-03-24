import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure you have expo/vector-icons installed

interface CustomAlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({ visible, message, title, onClose }) => {
    const slideAnim = new Animated.Value(Dimensions.get('window').height);
    const opacityAnim = new Animated.Value(0);

    useEffect(() => {
        if (visible) {
            // Animate in
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 0.7,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 9,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: Dimensions.get('window').height,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.container}>
            <Animated.View
                style={[styles.backdrop, { opacity: opacityAnim }]}
                onTouchEnd={onClose}
            />
            <Animated.View
                style={[
                    styles.modalContainer,
                    { transform: [{ translateY: slideAnim }] }
                ]}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={50} color="#6441A5" />
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>
                <TouchableOpacity style={styles.button} onPress={onClose}>
                    <Text style={styles.buttonText}>OK</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#121212',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#333',
    },
    iconContainer: {
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#ccc',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        minWidth: 120,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CustomAlertModal;