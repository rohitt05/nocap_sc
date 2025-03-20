// NotificationsNewFriends.js
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useBackNavigation } from './navigationUtils';
import SentModal from './sentModal';
import NotificationList from './NotificationList';

const NotificationsNewFriends = () => {
    // Use the custom hook for back navigation
    const goBackToFriends = useBackNavigation('/(tabs)/friends');

    // State for modal visibility
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={goBackToFriends}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.rightPlaceholder}></View>
            </View>

            {/* Main content with Sent button */}
            <View style={styles.content}>
                <View style={styles.contentHeader}>
                    <View style={styles.spacer} />
                    <TouchableOpacity
                        style={styles.sentButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.sentButtonText}>Sent</Text>
                        <Ionicons name="chevron-forward" size={16} color="#fff" style={styles.chevron} />
                    </TouchableOpacity>
                </View>

                {/* Notification List Component */}
                <NotificationList />
            </View>

            {/* Sent Modal */}
            <SentModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 50,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    rightPlaceholder: {
        width: 40, // To balance the header
    },
    content: {
        flex: 1,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    spacer: {
        flex: 1,
    },
    sentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    sentButtonText: {
        color: '#fff',
        fontWeight: '500',
        marginRight: 4,
    },
    chevron: {
        marginTop: 1, // Small adjustment to align with text
    }
});

export default NotificationsNewFriends;