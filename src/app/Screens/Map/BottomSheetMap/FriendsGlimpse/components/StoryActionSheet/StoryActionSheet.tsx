import React, { useState } from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface StoryActionSheetProps {
    visible: boolean;
    onClose: () => void;
    onReport: () => void;
}

const StoryActionSheet: React.FC<StoryActionSheetProps> = ({
    visible,
    onClose,
    onReport
}) => {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleReport = () => {
        setShowConfirm(true);
        onReport();
        setTimeout(() => {
            setShowConfirm(false);
            onClose();
        }, 1500);
    };

    // Prevent closing overlay while confirmation is visible
    const handleOverlayPress = () => {
        if (!showConfirm) onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleOverlayPress}>
                <BlurView intensity={28} tint="dark" style={styles.glassSheet}>
                    {showConfirm ? (
                        <View style={{ paddingVertical: 26 }}>
                            <Text style={styles.confirmText}>Reported. We'll look into it.</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.option} onPress={handleReport}>
                            <Text style={styles.optionText}>Report Story</Text>
                        </TouchableOpacity>
                    )}
                </BlurView>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.24)',
        justifyContent: 'flex-end',
    },
    glassSheet: {
        padding: 28,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        alignItems: 'stretch',
        minHeight: 85,
        shadowColor: "#111",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 18,
        backgroundColor: 'rgba(28,32,42,0.27)',
        borderColor: 'rgba(255,255,255,0.18)',
        borderWidth: 1,
    },
    option: {
        paddingVertical: 17,
    },
    optionText: {
        color: '#e04545',
        fontSize: 19,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 0.8,
    },
    confirmText: {
        color: '#fff',
        fontSize: 17,
        textAlign: 'center',
        letterSpacing: 0.6,
        fontWeight: '600',
    },
});

export default StoryActionSheet;
