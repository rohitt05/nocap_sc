import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface MediaOptionsMenuProps {
    onSave: () => void;
    onDiscard: () => void;
    onClose: () => void;
}

export default function MediaOptionsMenu({ onSave, onDiscard, onClose }: MediaOptionsMenuProps) {
    return (
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity 
                            style={styles.optionItem}
                            onPress={() => {
                                onSave();
                                onClose();
                            }}
                        >
                            <MaterialIcons name="save-alt" size={20} color="white" />
                            <Text style={styles.optionText}>Save to Gallery</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.optionItem}
                            onPress={() => {
                                onDiscard();
                                onClose();
                            }}
                        >
                            <Ionicons name="trash-outline" size={20} color="white" />
                            <Text style={styles.optionText}>Discard</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.optionItem}
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={20} color="white" />
                            <Text style={styles.optionText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        zIndex: 9999,
    },
    optionsContainer: {
        position: 'absolute',
        top: 10,
        right: 60,
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
        borderRadius: 8,
        padding: 8,
        minWidth: 160,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    optionText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 12,
    },
});