import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDeleteAccount } from '../../../../../../API/useDeleteAccount';

interface DeleteAccountProps {
    // Optional props if needed
}

const DeleteAccount: React.FC<DeleteAccountProps> = () => {
    const { isDeleting, error, confirmDelete } = useDeleteAccount();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={confirmDelete}
                disabled={isDeleting}
                activeOpacity={0.7}
            >
                <View style={styles.buttonContent}>
                    <MaterialIcons name="delete-forever" size={24} color="#ff3b30" />
                    <View style={styles.textContainer}>
                        <Text style={styles.deleteText}>Delete Account</Text>
                        <Text style={styles.warningText}>
                            All your data will be permanently deleted
                        </Text>
                    </View>
                    {isDeleting ? (
                        <ActivityIndicator size="small" color="#ff3b30" />
                    ) : (
                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                    )}
                </View>
            </TouchableOpacity>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    deleteButton: {
        backgroundColor: '#1a1a1a',
        marginHorizontal: 16,
        marginVertical: 7,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    textContainer: {
        flex: 1,
        marginLeft: 8,
    },
    deleteText: {
        color: '#ff3b30',
        fontSize: 16,
        fontWeight: '500',
    },
    warningText: {
        color: '#999',
        fontSize: 12,
        marginTop: 2,
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 14,
        marginHorizontal: 16,
        marginTop: 8,
    }
});

export default DeleteAccount;